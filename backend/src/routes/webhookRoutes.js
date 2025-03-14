import express from 'express';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';
import { stopWalletTracking, trackWalletsContinuously } from '../services/walletMonitor.js';
import { Paddle } from '@paddle/paddle-node-sdk';

const router = express.Router();
const paddle = new Paddle(process.env.PADDLE_API_KEY);

// Define Paddle webhook IP addresses
const PADDLE_SANDBOX_IPS = [
  '34.194.127.46',
  '54.234.237.108',
  '3.208.120.145',
  '44.226.236.210',
  '44.241.183.62',
  '100.20.172.113'
];

const PADDLE_LIVE_IPS = [
  '34.232.58.13',
  '34.195.105.136',
  '34.237.3.244',
  '35.155.119.135',
  '52.11.166.252',
  '34.212.5.7'
];
const ENVIRONMENT = 'sandbox';
// Middleware to verify Paddle IP addresses
const verifyPaddleIP = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const isPaddleIP = ENVIRONMENT === 'production'
  ? PADDLE_LIVE_IPS.includes(clientIP)
  : PADDLE_SANDBOX_IPS.includes(clientIP);
  
  if (!isPaddleIP) {
    console.error(`Rejected webhook from unauthorized IP: ${clientIP}`);
    return res.status(403).json({ error: 'Unauthorized IP address' });
  }
  
  // Also verify user agent contains 'Paddle'
  const userAgent = req.get('User-Agent') || '';
  if (!userAgent.includes('Paddle')) {
    console.error(`Rejected webhook with invalid User-Agent: ${userAgent}`);
    return res.status(403).json({ error: 'Unauthorized request' });
  }
  
  next();
};

// Express middleware to parse raw body for webhook verification
router.use('/paddle', express.raw({ type: 'application/json' }));

// Apply IP verification middleware
router.use('/paddle', verifyPaddleIP);

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

    // Respond with 200 before processing to avoid timeout
    res.status(200).json({ success: true });

    // Process webhook asynchronously
    (async () => {
      try {
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
              return;
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
              return;
            }

            if (cancelledUserData) {
              // Stop tracking when subscription is cancelled
              await stopWalletTracking(cancelledUserData.email, supabaseAdmin, true);
            }
            break;

          default:
            console.log(`Unhandled webhook event: ${eventType}`);
        }
      } catch (processingError) {
        console.error('Async webhook processing error:', processingError);
      }
    })();
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;