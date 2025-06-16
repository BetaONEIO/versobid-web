import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for webhook
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const webhookEvent = await req.json()
    console.log('PayPal webhook received:', webhookEvent.event_type)

    // Verify webhook signature (optional but recommended)
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')
    if (webhookId) {
      // TODO: Implement webhook signature verification
      // This requires PayPal's webhook verification library
    }

    const eventType = webhookEvent.event_type
    const resource = webhookEvent.resource

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(supabaseClient, resource)
        break
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        await handlePaymentCaptureFailed(supabaseClient, resource)
        break
      
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(supabaseClient, resource)
        break
      
      case 'CHECKOUT.ORDER.CANCELLED':
        await handleOrderCancelled(supabaseClient, resource)
        break
      
      default:
        console.log('Unhandled webhook event:', eventType)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handlePaymentCaptureCompleted(supabaseClient: any, resource: any) {
  const orderId = resource.supplementary_data?.related_ids?.order_id
  const captureId = resource.id
  const amount = parseFloat(resource.amount?.value || '0')

  if (!orderId) {
    console.error('No order ID found in capture completed event')
    return
  }

  // Update payment status
  const { data: payment, error: updateError } = await supabaseClient
    .from('payments')
    .update({ 
      status: 'completed',
      paypal_capture_id: captureId,
      completed_at: new Date().toISOString()
    })
    .eq('paypal_order_id', orderId)
    .select('bid_id, user_id')
    .single()

  if (updateError || !payment) {
    console.error('Failed to update payment:', updateError)
    return
  }

  // Update bid status to paid
  await supabaseClient
    .from('bids')
    .update({ status: 'paid' })
    .eq('id', payment.bid_id)

  // Get bid details for notifications
  const { data: bid } = await supabaseClient
    .from('bids')
    .select(`
      *,
      item:items(
        id,
        title,
        buyer_id
      )
    `)
    .eq('id', payment.bid_id)
    .single()

  if (!bid) return

  // Send notification to seller
  if (bid.item?.buyer_id) {
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: bid.item.buyer_id,
        type: 'payment_received',
        message: `Payment of $${amount} received for "${bid.item.title}"! You can now arrange delivery.`,
        data: {
          bidId: bid.id,
          itemId: bid.item_id,
          amount: amount,
          paymentId: orderId
        },
        read: false
      })
  }

  // Send confirmation to buyer
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: payment.user_id,
      type: 'payment_confirmed',
      message: `Payment confirmed for "${bid.item?.title}"! The seller will contact you for delivery.`,
      data: {
        bidId: bid.id,
        itemId: bid.item_id,
        amount: amount,
        paymentId: orderId
      },
      read: false
    })
}

async function handlePaymentCaptureFailed(supabaseClient: any, resource: any) {
  const orderId = resource.supplementary_data?.related_ids?.order_id
  const reason = resource.reason_code || 'Payment failed'

  if (!orderId) {
    console.error('No order ID found in capture failed event')
    return
  }

  // Update payment status
  const { data: payment, error: updateError } = await supabaseClient
    .from('payments')
    .update({ 
      status: 'failed',
      error_message: reason
    })
    .eq('paypal_order_id', orderId)
    .select('bid_id, user_id')
    .single()

  if (updateError || !payment) {
    console.error('Failed to update payment:', updateError)
    return
  }

  // Get bid details for notification
  const { data: bid } = await supabaseClient
    .from('bids')
    .select(`
      *,
      item:items(
        id,
        title
      )
    `)
    .eq('id', payment.bid_id)
    .single()

  if (!bid) return

  // Send notification to buyer
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: payment.user_id,
      type: 'payment_failed',
      message: `Payment failed for "${bid.item?.title}". Reason: ${reason}. Please try again.`,
      data: {
        bidId: bid.id,
        itemId: bid.item_id,
        paymentId: orderId,
        reason: reason
      },
      read: false
    })
}

async function handleOrderApproved(supabaseClient: any, resource: any) {
  const orderId = resource.id

  // Update payment status to approved (waiting for capture)
  await supabaseClient
    .from('payments')
    .update({ status: 'approved' })
    .eq('paypal_order_id', orderId)
}

async function handleOrderCancelled(supabaseClient: any, resource: any) {
  const orderId = resource.id

  // Update payment status to cancelled
  const { data: payment } = await supabaseClient
    .from('payments')
    .update({ status: 'cancelled' })
    .eq('paypal_order_id', orderId)
    .select('bid_id, user_id')
    .single()

  if (!payment) return

  // Get bid details for notification
  const { data: bid } = await supabaseClient
    .from('bids')
    .select(`
      *,
      item:items(
        id,
        title
      )
    `)
    .eq('id', payment.bid_id)
    .single()

  if (!bid) return

  // Send notification to buyer
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: payment.user_id,
      type: 'payment_cancelled',
      message: `Payment cancelled for "${bid.item?.title}". You can try again anytime.`,
      data: {
        bidId: bid.id,
        itemId: bid.item_id,
        paymentId: orderId
      },
      read: false
    })
} 