import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CaptureOrderRequest {
  orderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { orderId }: CaptureOrderRequest = await req.json()

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing orderId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get PayPal credentials
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com'

    if (!paypalClientId || !paypalClientSecret) {
      return new Response(
        JSON.stringify({ error: 'PayPal configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get PayPal access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    })

    const authData = await authResponse.json()

    if (!authResponse.ok) {
      console.error('PayPal auth error:', authData)
      return new Response(
        JSON.stringify({ error: 'PayPal authentication failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Capture the PayPal order
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
    })

    const captureData = await captureResponse.json()

    if (!captureResponse.ok) {
      console.error('PayPal capture error:', captureData)
      
      // Update payment status to failed
      await supabaseClient
        .from('payments')
        .update({ 
          status: 'failed',
          paypal_capture_id: null,
          error_message: captureData.message || 'Capture failed'
        })
        .eq('paypal_order_id', orderId)

      return new Response(
        JSON.stringify({ error: 'Failed to capture payment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract capture details
    const capture = captureData.purchase_units[0]?.payments?.captures?.[0]
    const captureId = capture?.id
    const captureStatus = capture?.status

    if (captureStatus !== 'COMPLETED') {
      console.error('Payment capture not completed:', captureData)
      
      await supabaseClient
        .from('payments')
        .update({ 
          status: 'failed',
          paypal_capture_id: captureId,
          error_message: `Capture status: ${captureStatus}`
        })
        .eq('paypal_order_id', orderId)

      return new Response(
        JSON.stringify({ error: 'Payment capture not completed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update payment status to completed
    const { data: payment, error: updateError } = await supabaseClient
      .from('payments')
      .update({ 
        status: 'completed',
        paypal_capture_id: captureId,
        completed_at: new Date().toISOString()
      })
      .eq('paypal_order_id', orderId)
      .select('id, bid_id')
      .single()

    if (updateError || !payment) {
      console.error('Failed to update payment:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update payment status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update bid status to paid
    const { error: bidUpdateError } = await supabaseClient
      .from('bids')
      .update({ status: 'paid' })
      .eq('id', payment.bid_id)

    if (bidUpdateError) {
      console.error('Failed to update bid status:', bidUpdateError)
      // Don't fail the request, payment is still successful
    }

    // Get bid details for notification
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

    // Send notification to seller
    if (bid?.item?.buyer_id) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: bid.item.buyer_id,
          type: 'payment_received',
          message: `Payment received for "${bid.item.title}"! You can now arrange delivery.`,
          data: {
            bidId: bid.id,
            itemId: bid.item_id,
            amount: bid.amount,
            paymentId: orderId
          },
          read: false
        })
    }

    // Send payout to seller
    await sendPayoutToSeller(supabaseClient, payment.id, bid)

    return new Response(
      JSON.stringify({
        success: true,
        captureId: captureId,
        status: 'completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendPayoutToSeller(supabaseClient: any, paymentId: string, bid: any) {
  try {
    // Get seller's PayPal info
    const { data: seller } = await supabaseClient
      .from('profiles')
      .select('paypal_email, paypal_sandbox_email')
      .eq('id', bid.item.buyer_id)
      .single()

    if (!seller) {
      console.error('Seller not found')
      return
    }

    const isProduction = Deno.env.get('PAYPAL_BASE_URL')?.includes('api-m.paypal.com')
    const sellerEmail = isProduction ? seller.paypal_email : seller.paypal_sandbox_email

    if (!sellerEmail) {
      console.log('Seller PayPal email not configured, skipping payout')
      await supabaseClient
        .from('payments')
        .update({ 
          payout_status: 'failed',
          error_message: 'Seller PayPal email not configured'
        })
        .eq('id', paymentId)
      return
    }

    // Get PayPal credentials
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com'

    // Get access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    })

    const authData = await authResponse.json()
    if (!authResponse.ok) {
      console.error('PayPal auth error for payout:', authData)
      return
    }

    // Calculate seller amount (subtract 3% processing fee)
    const sellerAmount = Math.round((bid.amount * 0.97) * 100) / 100

    // Create payout
    const payoutResponse = await fetch(`${paypalBaseUrl}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `payout_${paymentId}_${Date.now()}`,
          email_subject: 'Payment for your sold item',
          email_message: `You've received payment for "${bid.item.title}"`
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: sellerAmount.toString(),
              currency: 'USD'
            },
            receiver: sellerEmail,
            note: `Payment for item: ${bid.item.title}`,
            sender_item_id: `item_${bid.item_id}`
          }
        ]
      })
    })

    const payoutData = await payoutResponse.json()

    if (payoutResponse.ok) {
      // Update payment with payout info
      await supabaseClient
        .from('payments')
        .update({ 
          payout_id: payoutData.batch_header.payout_batch_id,
          payout_status: 'processing'
        })
        .eq('id', paymentId)

      // Send notification to seller
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: bid.item.buyer_id,
          type: 'payout_sent',
          message: `$${sellerAmount} has been sent to your PayPal account for "${bid.item.title}"`,
          data: {
            amount: sellerAmount,
            payoutId: payoutData.batch_header.payout_batch_id,
            itemTitle: bid.item.title
          },
          read: false
        })
    } else {
      console.error('Payout failed:', payoutData)
      await supabaseClient
        .from('payments')
        .update({ 
          payout_status: 'failed',
          error_message: payoutData.message || 'Payout failed'
        })
        .eq('id', paymentId)
    }
  } catch (error) {
    console.error('Error sending payout:', error)
    await supabaseClient
      .from('payments')
      .update({ 
        payout_status: 'failed',
        error_message: 'Payout processing error'
      })
      .eq('id', paymentId)
  }
} 