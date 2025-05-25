
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) throw new Error("User not authenticated");

    const { tier, period } = await req.json();
    
    if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
      throw new Error("Invalid subscription tier");
    }

    if (!["monthly", "yearly"].includes(period)) {
      throw new Error("Invalid subscription period");
    }

    const price = TIER_PRICES[tier as keyof typeof TIER_PRICES][period as keyof typeof TIER_PRICES[keyof typeof TIER_PRICES]];
    
    // Generate unique order ID
    const orderId = `${user.id}-${tier}-${Date.now()}`;
    
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

    return new Response(JSON.stringify({ url: paymentUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
