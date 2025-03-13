import express from 'express';
import { trackWalletsContinuously } from '../services/walletMonitor.js';

const router = express.Router();

// Start tracking endpoint
router.post('/start-tracking', async (req, res) => {
  try {
    const { email } = req.body;
    await trackWalletsContinuously(email);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in start-tracking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop tracking endpoint (optional but recommended)
router.post('/stop-tracking', async (req, res) => {
  try {
    const { email } = req.body;
    await stopWalletTracking(email);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in stop-tracking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tracking status endpoint (optional but useful)
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    // Add logic to check tracking status
    res.json({ tracking: true }); // Modify based on your implementation
  } catch (error) {
    console.error('Error getting tracking status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;