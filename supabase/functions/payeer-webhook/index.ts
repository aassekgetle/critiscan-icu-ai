
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

    const formData = await req.formData();
    const merchantId = formData.get("m_shop");
    const orderId = formData.get("m_orderid");
    const amount = formData.get("m_amount");
    const currency = formData.get("m_curr");
    const description = formData.get("m_desc");
    const status = formData.get("m_status");
    const signature = formData.get("m_sign");

    console.log('Payeer webhook received:', {
      merchantId,
      orderId,
      amount,
      currency,
      status,
      signature
    });

    // Verify signature
    const secretKey = Deno.env.get("PAYEER_SECRET_KEY") || "";
    const signString = `${merchantId}:${orderId}:${amount}:${currency}:${description}:${status}:${secretKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signString);
    const hashBuffer = await crypto.subtle.digest('SHA256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 400 });
    }

    // Find subscription by order ID
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', orderId)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found:', orderId);
      return new Response('Subscription not found', { status: 404 });
    }

    // Update subscription based on payment status
    if (status === 'success') {
      const now = new Date();
      const periodEnd = new Date(now);
      
      if (subscription.subscription_period === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', subscription.id);

      console.log('Subscription activated:', orderId);
    } else {
      await supabaseClient
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      console.log('Subscription canceled:', orderId);
    }

    return new Response(orderId, { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
