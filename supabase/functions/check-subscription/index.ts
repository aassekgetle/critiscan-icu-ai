
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Get user's subscription from database
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_subscription_id) {
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscription_tier: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check subscription status with 2Checkout API
    const response = await fetch(`https://api.2checkout.com/rest/6.0/subscriptions/${subscription.stripe_subscription_id}`, {
      method: "GET",
      headers: {
        "X-Avangate-Authentication": `code="${Deno.env.get("TWOCHECKOUT_MERCHANT_CODE")}" date="${new Date().toISOString().split('T')[0]}" time="${new Date().toISOString().split('T')[1].split('.')[0]}" hash="${await generateHash()}"`,
      }
    });

    if (!response.ok) {
      console.log(`2Checkout API error: ${response.statusText}`);
      // Return current database status if API fails
      return new Response(JSON.stringify({
        subscribed: subscription.status === 'active',
        subscription_tier: subscription.subscription_tier,
        subscription_end: subscription.current_period_end,
        status: subscription.status
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscriptionData = await response.json();
    const isActive = subscriptionData.Status === 'ACTIVE';
    
    // Update local subscription status
    const endDate = subscriptionData.ExpirationDate ? new Date(subscriptionData.ExpirationDate).toISOString() : null;
    
    await supabaseClient
      .from("subscriptions")
      .update({
        status: isActive ? 'active' : 'canceled',
        current_period_end: endDate,
        updated_at: new Date().toISOString()
      })
      .eq("id", subscription.id);

    return new Response(JSON.stringify({
      subscribed: isActive,
      subscription_tier: subscription.subscription_tier,
      subscription_end: endDate,
      status: isActive ? 'active' : 'canceled'
    }), {
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
