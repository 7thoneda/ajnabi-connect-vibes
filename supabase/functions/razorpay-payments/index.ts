import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = "rzp_test_WQBAQbslF30m1w";
    const RAZORPAY_SECRET_KEY = Deno.env.get('RAZORPAY_SECRET_KEY');
    
    if (!RAZORPAY_SECRET_KEY) {
      throw new Error('RAZORPAY_SECRET_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'create_order': {
        const { amount, currency, product_type, product_details, user_id } = payload;

        // Create order with Razorpay
        const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET_KEY}`)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount * 100, // Convert to paise
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`,
          }),
        });

        if (!orderResponse.ok) {
          throw new Error('Failed to create Razorpay order');
        }

        const razorpayOrder = await orderResponse.json();

        // Store order in database
        const { data: order, error } = await supabaseClient
          .from('orders')
          .insert({
            user_id,
            razorpay_order_id: razorpayOrder.id,
            amount: amount,
            currency: currency || 'INR',
            status: 'created',
            product_type,
            product_details,
          })
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw new Error('Failed to store order in database');
        }

        return new Response(JSON.stringify({
          success: true,
          order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key_id: RAZORPAY_KEY_ID,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'verify_payment': {
        const { 
          razorpay_order_id, 
          razorpay_payment_id, 
          razorpay_signature, 
          user_id 
        } = payload;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = createHmac("sha256", RAZORPAY_SECRET_KEY)
          .update(body)
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          throw new Error('Invalid payment signature');
        }

        // Update order status
        const { data: order, error } = await supabaseClient
          .from('orders')
          .update({
            razorpay_payment_id,
            razorpay_signature,
            status: 'paid',
          })
          .eq('razorpay_order_id', razorpay_order_id)
          .eq('user_id', user_id)
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw new Error('Failed to update order status');
        }

        // Process the successful payment based on product type
        let updateResult = null;
        
        if (order.product_type === 'coins') {
          // Update user's coin balance
          // Note: You'll need to implement user profile/wallet management
          console.log(`Adding ${order.product_details.coins} coins to user ${user_id}`);
        } else if (order.product_type === 'premium') {
          // Update user's premium status
          console.log(`Activating premium for user ${user_id} for ${order.product_details.duration}`);
        } else if (order.product_type === 'unlimited_calls') {
          // Update user's unlimited calls status
          console.log(`Activating unlimited calls for user ${user_id} for ${order.product_details.duration}`);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Payment verified successfully',
          order,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});