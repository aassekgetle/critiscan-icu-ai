
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  let webhookData = null;
  let subscription = null;

  try {
    const formData = await req.formData();
    const merchantId = formData.get("m_shop");
    const orderId = formData.get("m_orderid");
    const amount = formData.get("m_amount");
    const currency = formData.get("m_curr");
    const description = formData.get("m_desc");
    const status = formData.get("m_status");
    const signature = formData.get("m_sign");

    webhookData = {
      merchantId,
      orderId,
      amount,
      currency,
      description,
      status,
      signature
    };

    console.log('Payeer webhook received:', {
      ...webhookData,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });

    // Log webhook received
    await logPaymentEvent(supabaseClient, {
      user_id: null, // Will be updated when we find the subscription
      event_type: 'webhook_received',
      function_name: 'payeer-webhook',
      order_id: orderId?.toString(),
      amount: amount ? parseFloat(amount.toString()) : null,
      currency: currency?.toString(),
      status: status?.toString(),
      request_data: webhookData,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent')
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
      console.error('Invalid signature:', {
        received: signature,
        expected: expectedSignature,
        signString
      });

      await logPaymentEvent(supabaseClient, {
        event_type: 'signature_verification_failed',
        function_name: 'payeer-webhook',
        order_id: orderId?.toString(),
        error_message: 'Invalid signature',
        request_data: webhookData,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });

      return new Response('Invalid signature', { status: 400 });
    }

    console.log('Signature verified successfully');

    // Find subscription by order ID
    const { data: subscriptionData, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', orderId)
      .single();

    if (subError || !subscriptionData) {
      console.error('Subscription not found:', {
        orderId,
        error: subError
      });

      await logPaymentEvent(supabaseClient, {
        event_type: 'subscription_not_found',
        function_name: 'payeer-webhook',
        order_id: orderId?.toString(),
        error_message: `Subscription not found for order ID: ${orderId}`,
        request_data: webhookData,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });

      return new Response('Subscription not found', { status: 404 });
    }

    subscription = subscriptionData;
    console.log('Found subscription:', {
      subscriptionId: subscription.id,
      userId: subscription.user_id,
      tier: subscription.subscription_tier,
      period: subscription.subscription_period
    });

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

      console.log('Subscription activated:', {
        orderId,
        subscriptionId: subscription.id,
        userId: subscription.user_id,
        periodStart: now.toISOString(),
        periodEnd: periodEnd.toISOString()
      });

      // Log successful payment
      await logPaymentEvent(supabaseClient, {
        user_id: subscription.user_id,
        event_type: 'payment_success',
        function_name: 'payeer-webhook',
        order_id: orderId?.toString(),
        amount: amount ? parseFloat(amount.toString()) : null,
        currency: currency?.toString(),
        status: 'active',
        request_data: webhookData,
        response_data: {
          subscription_id: subscription.id,
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString()
        },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });

    } else {
      await supabaseClient
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      console.log('Subscription canceled:', {
        orderId,
        subscriptionId: subscription.id,
        userId: subscription.user_id,
        paymentStatus: status
      });

      // Log failed payment
      await logPaymentEvent(supabaseClient, {
        user_id: subscription.user_id,
        event_type: 'payment_failed',
        function_name: 'payeer-webhook',
        order_id: orderId?.toString(),
        amount: amount ? parseFloat(amount.toString()) : null,
        currency: currency?.toString(),
        status: 'canceled',
        request_data: webhookData,
        error_message: `Payment failed with status: ${status}`,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });
    }

    return new Response(orderId?.toString(), { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (error: any) {
    console.error('Webhook error:', {
      error: error.message,
      stack: error.stack,
      webhookData,
      timestamp: new Date().toISOString()
    });

    // Log webhook error
    await logPaymentEvent(supabaseClient, {
      user_id: subscription?.user_id || null,
      event_type: 'webhook_error',
      function_name: 'payeer-webhook',
      order_id: webhookData?.orderId?.toString(),
      request_data: webhookData,
      error_message: error.message,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
