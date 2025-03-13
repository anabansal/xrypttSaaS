import express from 'express';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';
import crypto from 'crypto';
import { stopWalletTracking, trackWalletsContinuously } from '../services/walletMonitor.js';

const router = express.Router();

// Verify Paddle webhook signature using RSA-SHA1
const verifyPaddleWebhook = (req) => {
  const publicKey = process.env.PADDLE_PUBLIC_KEY;
  if (!publicKey) {
    console.error('Paddle public key not set in environment variables.');
    return false;
  }
  
  // Remove the p_signature from the payload
  const { p_signature, ...rest } = req.body;
  if (!p_signature) {
    return false;
  }
  
  // Create a string to verify: sort the keys alphabetically and concatenate as key=value pairs
  const sortedKeys = Object.keys(rest).sort();
  const stringToVerify = sortedKeys.map(key => `${key}=${rest[key]}`).join('&');

  const verifier = crypto.createVerify('sha1');
  verifier.update(stringToVerify);
  verifier.end();

  // Convert signature from Base64 and verify
  const signatureBuffer = Buffer.from(p_signature, 'base64');
  return verifier.verify(publicKey, signatureBuffer);
};

router.post('/paddle', async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyPaddleWebhook(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Destructure payload fields
    const { alert_name, subscription_id, status, subscription_plan_id, user_id, passthrough, event_time } = req.body;

    // Parse passthrough to get the Supabase user ID
    const { supabaseUserId } = JSON.parse(passthrough);

    // Here, the Paddle generated user ID is stored in `user_id`
    const paddleUserId = user_id;

    switch (alert_name) {
      case 'subscription_created':
      case 'subscription_updated':
        // Update or insert subscription with both Supabase and Paddle user IDs
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: supabaseUserId,
            paddle_user_id: paddleUserId,
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

      case 'subscription_cancelled':
      case 'subscription_expired':
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
        console.log(`Unhandled webhook event: ${alert_name}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
