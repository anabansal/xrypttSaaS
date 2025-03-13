import express from 'express';
import { getSupabaseClient } from '../utils/supabase.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkSubscriptionLimits } from '../utils/subscriptionUtils.js';

const router = express.Router();

// Get stealth wallets for a user
router.get('/', authenticate, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const supabase = getSupabaseClient(token);
  try {
    const { data, error } = await supabase
      .from('stealth_wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching stealth wallets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new stealth wallet
router.post('/', authenticate, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const supabase = getSupabaseClient(token);
  try {
    const { walletAddress } = req.body;

    // Get current count of stealth wallets
    const { count, error: countError } = await supabase
      .from('stealth_wallets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (countError) throw countError;

    // Check subscription limits
    const canAddWallet = await checkSubscriptionLimits(supabase,req.user.id, 'stealth_wallets', count || 0);
    if (!canAddWallet) {
      return res.status(403).json({ 
        error: 'Subscription limit reached for stealth wallets. Please upgrade to Privacy Shield plan.' 
      });
    }

    const { error } = await supabase
      .from('stealth_wallets')
      .insert([{
        user_id: req.user.id,
        wallet_address: walletAddress.toLowerCase()
      }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding stealth wallet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove a stealth wallet
router.delete('/:address', authenticate, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const supabase = getSupabaseClient(token);
  try {
    const { address } = req.params;
    const { error } = await supabase
      .from('stealth_wallets')
      .delete()
      .eq('user_id', req.user.id)
      .eq('wallet_address', address.toLowerCase());

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing stealth wallet:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
