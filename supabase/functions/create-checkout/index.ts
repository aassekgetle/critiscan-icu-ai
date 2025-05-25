
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
    
    // Create 2Checkout order
    const orderData = {
      Currency: "USD",
      Language: "en",
      Country: "US",
      CustomerIP: req.headers.get("x-forwarded-for") || "127.0.0.1",
      ExternalReference: `${user.id}-${Date.now()}`,
      Source: "critiscan-icu-ai.com",
      BillingDetails: {
        FirstName: user.user_metadata?.first_name || "User",
        LastName: user.user_metadata?.last_name || "User",
        Email: user.email,
        Country: "BW"
      },
      Items: [{
        Name: `CritiScan ICU AI - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        Description: `${period.charAt(0).toUpperCase() + period.slice(1)} subscription`,
        Quantity: 1,
        Price: price,
        PriceType: "GROSS",
        IsDynamic: true,
        Recurrence: {
          Enabled: true,
          CycleLength: period === "monthly" ? 1 : 12,
          CycleUnit: "MONTH",
          CycleAmount: price,
          ContractLength: 1,
          ContractUnit: "YEAR"
        }
      }]
    };

    // Create 2Checkout session
    const response = await fetch("https://api.2checkout.com/rest/6.0/orders/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Avangate-Authentication": `code="${Deno.env.get("TWOCHECKOUT_MERCHANT_CODE")}" date="${new Date().toISOString().split('T')[0]}" time="${new Date().toISOString().split('T')[1].split('.')[0]}" hash="${await generateHash()}"`,
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`2Checkout API error: ${response.statusText}`);
    }

    const orderResult = await response.json();

    // Create subscription record
    await supabaseClient.from("subscriptions").insert({
      user_id: user.id,
      stripe_customer_id: null, // We'll use this field for 2Checkout customer reference
      stripe_subscription_id: orderResult.RefNo, // Use RefNo as subscription ID
      subscription_tier: tier,
      subscription_period: period,
      status: 'incomplete'
    });

    // Generate payment URL
    const paymentUrl = `https://secure.2checkout.com/checkout/buy?merchant=${Deno.env.get("TWOCHECKOUT_MERCHANT_CODE")}&tco-currency=USD&tco-amount=${price}&tco-item-name=${encodeURIComponent(`CritiScan ICU AI - ${tier} Plan`)}&tco-item-desc=${encodeURIComponent(`${period} subscription`)}&email=${encodeURIComponent(user.email)}&return-url=${encodeURIComponent(`${req.headers.get("origin")}/subscription?success=true`)}&return-type=redirect`;

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

async function generateHash() {
  // This is a simplified hash generation - in production, implement proper HMAC-MD5
  const merchantCode = Deno.env.get("TWOCHECKOUT_MERCHANT_CODE") || "";
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].split('.')[0];
  const secretKey = Deno.env.get("TWOCHECKOUT_SECRET_KEY") || "";
  
  const stringToHash = `${merchantCode}${date}${time}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToHash + secretKey);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
