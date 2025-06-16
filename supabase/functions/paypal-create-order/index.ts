import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateOrderRequest {
  bidId: string;
  amount: number;
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

    const { bidId, amount }: CreateOrderRequest = await req.json()

    if (!bidId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing bidId or amount' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify bid exists and user has access
    const { data: bid, error: bidError } = await supabaseClient
      .from('bids')
      .select(`
        *,
        item:items(
          id,
          title,
          buyer_id
        )
      `)
      .eq('id', bidId)
      .single()

    if (bidError || !bid) {
      return new Response(
        JSON.stringify({ error: 'Bid not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify user is the bidder or item owner
    const isBidder = bid.bidder_id === user.id
    const isItemOwner = bid.item?.buyer_id === user.id

    if (!isBidder && !isItemOwner) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to access this bid' }),
        { 
          status: 403, 
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

    // Calculate processing fee (3%)
    const processingFee = Math.round(amount * 0.03 * 100) / 100
    const totalAmount = Math.round((amount + processingFee) * 100) / 100

    // Create PayPal order
    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: bidId,
            amount: {
              currency_code: 'USD',
              value: totalAmount.toString(),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: amount.toString(),
                },
                handling: {
                  currency_code: 'USD',
                  value: processingFee.toString(),
                },
              },
            },
            items: [
              {
                name: bid.item?.title || 'Marketplace Item',
                unit_amount: {
                  currency_code: 'USD',
                  value: amount.toString(),
                },
                quantity: '1',
              },
            ],
            description: `Payment for bid #${bidId}`,
          },
        ],
        application_context: {
          return_url: `${req.headers.get('origin')}/payment/success`,
          cancel_url: `${req.headers.get('origin')}/payment/failed`,
        },
      }),
    })

    const orderData = await orderResponse.json()

    if (!orderResponse.ok) {
      console.error('PayPal order creation error:', orderData)
      return new Response(
        JSON.stringify({ error: 'Failed to create PayPal order' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store order in database
    const { error: insertError } = await supabaseClient
      .from('payments')
      .insert({
        bid_id: bidId,
        user_id: user.id,
        paypal_order_id: orderData.id,
        amount: amount,
        processing_fee: processingFee,
        total_amount: totalAmount,
        status: 'pending',
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Continue anyway, we can handle this in webhook
    }

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        amount: totalAmount,
        processingFee: processingFee,
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