
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_PRICES = {
  student: { monthly: 5.00, yearly: 60.00 },
  nurse: { monthly: 20.00, yearly: 240.00 },
  doctor: { monthly: 40.00, yearly: 480.00 },
  teacher: { monthly: 15.00, yearly: 180.00 }
};

const logPaymentEvent = async (supabaseClient: any, eventData: any) => {
  try {
    await supabaseClient
      .from('payment_logs')
      .insert(eventData);
  } catch (error) {
    console.error('Failed to log payment event:', error);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  let userId = null;
  let requestData = null;

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    userId = user?.id;
    
    if (!user?.email) throw new Error("User not authenticated");

    requestData = await req.json();
    const { tier, period } = requestData;
    
    console.log('Create checkout request:', {
      userId: user.id,
      email: user.email,
      tier,
      period,
      timestamp: new Date().toISOString()
    });

    // Log checkout creation attempt
    await logPaymentEvent(supabaseClient, {
      user_id: user.id,
      event_type: 'checkout_creation_started',
      function_name: 'create-checkout',
      request_data: { tier, period, email: user.email },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent')
    });
    
    if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
      throw new Error("Invalid subscription tier");
    }

    if (!["monthly", "yearly"].includes(period)) {
      throw new Error("Invalid subscription period");
    }

    const price = TIER_PRICES[tier as keyof typeof TIER_PRICES][period as keyof typeof TIER_PRICES[keyof typeof TIER_PRICES]];
    
    // Generate unique order ID
    const orderId = `${user.id}-${tier}-${Date.now()}`;
    
    console.log('Creating subscription record:', {
      orderId,
      userId: user.id,
      tier,
      period,
      price
    });

    // Create subscription record
    await supabaseClient.from("subscriptions").insert({
      user_id: user.id,
      stripe_customer_id: null,
      stripe_subscription_id: orderId,
      subscription_tier: tier,
      subscription_period: period,
      status: 'incomplete'
    });

    // Create Payeer payment form parameters
    const merchantId = Deno.env.get("PAYEER_MERCHANT_ID") || "";
    const secretKey = Deno.env.get("PAYEER_SECRET_KEY") || "";
    const currency = "USD";
    const description = `CritiScan ICU AI - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan (${period})`;
    const successUrl = `${req.headers.get("origin")}/subscription?success=true`;
    const failUrl = `${req.headers.get("origin")}/subscription?error=true`;
    
    // Generate signature for Payeer
    const signString = `${merchantId}:${orderId}:${price}:${currency}:${description}:${secretKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signString);
    const hashBuffer = await crypto.subtle.digest('SHA256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Creating Payeer checkout:', {
      merchantId,
      orderId,
      amount: price,
      currency,
      description,
      signatureLength: signature.length
    });

    // Create Payeer payment URL
    const payeerParams = new URLSearchParams({
      m_shop: merchantId,
      m_orderid: orderId,
      m_amount: price.toFixed(2),
      m_curr: currency,
      m_desc: description,
      m_sign: signature,
      success_url: successUrl,
      fail_url: failUrl,
      lang: "en"
    });

    const paymentUrl = `https://payeer.com/merchant/?${payeerParams.toString()}`;

    // Log successful checkout creation
    await logPaymentEvent(supabaseClient, {
      user_id: user.id,
      event_type: 'checkout_created',
      function_name: 'create-checkout',
      order_id: orderId,
      amount: price,
      currency,
      status: 'created',
      request_data: { tier, period, email: user.email },
      response_data: { paymentUrl, orderId },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent')
    });

    console.log('Checkout created successfully:', {
      orderId,
      paymentUrl,
      userId: user.id
    });

    return new Response(JSON.stringify({ url: paymentUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('Checkout error:', {
      error: error.message,
      userId,
      requestData,
      timestamp: new Date().toISOString()
    });

    // Log error
    if (userId) {
      await logPaymentEvent(supabaseClient, {
        user_id: userId,
        event_type: 'checkout_error',
        function_name: 'create-checkout',
        request_data: requestData,
        error_message: error.message,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
