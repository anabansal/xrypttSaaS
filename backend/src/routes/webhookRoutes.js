import express from 'express';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';
import { stopWalletTracking, trackWalletsContinuously } from '../services/walletMonitor.js';
import { Paddle } from '@paddle/paddle-node-sdk';

const router = express.Router();
const paddle = new Paddle(process.env.PADDLE_API_KEY);

// Express middleware to parse raw body for webhook verification
router.use('/paddle', express.raw({ type: 'application/json' }));

router.post('/paddle', async (req, res) => {
  try {
    // Get the signature from headers
    const signature = req.headers['paddle-signature'] || '';
    const rawRequestBody = req.body.toString();
    const secretKey = process.env.WEBHOOK_SECRET_KEY || '';
    
    let eventData;
    try {
      // Verify signature and unmarshal data
      eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);
    } catch (verificationError) {
      console.error('Webhook verification failed:', verificationError);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Extract data from the verified webhook
    const { eventType, data } = eventData;
    
    // Get the customer ID from the data
    const paddleCustomerId = data.customer_id;
    
    // Extract subscription information
    const subscription_id = data.id;
    const status = data.status;
    
    // Get the first item's price ID as the plan ID
    const subscription_plan_id = data.items[0].price.id;
    
    // Get next billing date as period end
    const event_time = data.next_billed_at || new Date().toISOString();
    
    // Extract supabaseUserId from custom_data
    if (!data.custom_data || !data.custom_data.supabaseUserId) {
      console.error('No supabaseUserId found in custom_data');
      return res.status(400).json({ error: 'Missing required user data' });
    }
    
    const supabaseUserId = data.custom_data.supabaseUserId;

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
        // Update or insert subscription with both Supabase and Paddle user IDs
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: supabaseUserId,
            paddle_user_id: paddleCustomerId,
            subscription_id,
            plan_id: subscription_plan_id,
            status,
            current_period_end: new Date(event_time).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id, subscription_id'
          });

        // Get user email for tracking management using Supabase user ID
        const { data: userData, error } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('id', supabaseUserId)
          .single();

        if (error) {
          console.error('Failed to fetch user:', error);
          return res.status(500).json({ error: 'User not found' });
        }

        if (userData && status === 'active') {
          // Resume tracking for active subscriptions
          await trackWalletsContinuously(userData.email, supabaseAdmin, true);
        } else if (userData && status !== 'active') {
          // Stop tracking for non-active subscriptions
          await stopWalletTracking(userData.email, supabaseAdmin, true);
        }
        break;

      case 'subscription.canceled':
      case 'subscription.expired':
        // Update subscription status to cancelled
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .match({ subscription_id });

        // Get user email for tracking management using Supabase user ID
        const { data: cancelledUserData, error: cancelledError } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('id', supabaseUserId)
          .single();

        if (cancelledError) {
          console.error('Failed to fetch user:', cancelledError);
          return res.status(500).json({ error: 'User not found' });
        }

        if (cancelledUserData) {
          // Stop tracking when subscription is cancelled
          await stopWalletTracking(cancelledUserData.email, supabaseAdmin, true);
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;