
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_PRICES = {
  student: { monthly: 500, yearly: 6000 }, // $5.00, $60.00
  nurse: { monthly: 2000, yearly: 24000 }, // $20.00, $240.00
  doctor: { monthly: 4000, yearly: 48000 }, // $40.00, $480.00
  teacher: { monthly: 1500, yearly: 18000 } // $15.00, $180.00
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    const priceAmount = TIER_PRICES[tier as keyof typeof TIER_PRICES][period as keyof typeof TIER_PRICES[keyof typeof TIER_PRICES]];
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `CritiScan ICU AI - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `${period.charAt(0).toUpperCase() + period.slice(1)} subscription`
            },
            unit_amount: priceAmount,
            recurring: {
              interval: period === "monthly" ? "month" : "year",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription?success=true`,
      cancel_url: `${req.headers.get("origin")}/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        tier: tier,
        period: period
      }
    });

    // Create subscription record
    await supabaseClient.from("subscriptions").insert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: session.subscription as string,
      subscription_tier: tier,
      subscription_period: period,
      status: 'incomplete'
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
