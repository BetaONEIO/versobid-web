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

    // Verify webhook signature
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')
    if (webhookId) {
      const isValid = await verifyPayPalWebhookSignature(req, webhookEvent, webhookId)
      if (!isValid) {
        console.error('PayPal webhook signature verification failed')
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      console.log('PayPal webhook signature verified successfully')
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

async function verifyPayPalWebhookSignature(req: Request, webhookEvent: any, webhookId: string): Promise<boolean> {
  try {
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      console.error('Failed to get PayPal access token for webhook verification')
      return false
    }

    // Extract headers needed for verification
    const headers = req.headers
    const transmissionId = headers.get('paypal-transmission-id')
    const transmissionTime = headers.get('paypal-transmission-time')
    const certUrl = headers.get('paypal-cert-url')
    const authAlgo = headers.get('paypal-auth-algo')
    const transmissionSig = headers.get('paypal-transmission-sig')

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      console.error('Missing required PayPal webhook headers')
      return false
    }

    // Prepare verification payload
    const verificationPayload = {
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: webhookEvent
    }

    // Call PayPal verification endpoint
    const baseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api.sandbox.paypal.com'
    const verifyResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationPayload)
    })

    if (!verifyResponse.ok) {
      console.error('PayPal webhook verification failed:', verifyResponse.status, await verifyResponse.text())
      return false
    }

    const verificationResult = await verifyResponse.json()
    return verificationResult.verification_status === 'SUCCESS'

  } catch (error) {
    console.error('Error verifying PayPal webhook signature:', error)
    return false
  }
}

async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const baseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api.sandbox.paypal.com'

    if (!clientId || !clientSecret) {
      console.error('PayPal client credentials not found in environment variables')
      return null
    }

    const credentials = btoa(`${clientId}:${clientSecret}`)
    
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      console.error('Failed to get PayPal access token:', response.status)
      return null
    }

    const tokenData = await response.json()
    return tokenData.access_token

  } catch (error) {
    console.error('Error getting PayPal access token:', error)
    return null
  }
}

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