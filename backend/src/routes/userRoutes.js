import express from 'express';
import { getSupabaseClient } from '../utils/supabase.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { trackWalletsContinuously } from '../services/walletMonitor.js';

const router = express.Router();

// 🔹 Register or Update a User
router.post('/register', authenticate, async (req, res) => {
    const { email, wallets, checkInterval } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('wallets')
            .eq('email', email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            return res.status(400).json({ error: fetchError.message });
        }

        let result;
        if (existingUser) {
            // Merge new wallets with existing ones
            const updatedWallets = Array.from(new Set([...existingUser.wallets, ...wallets]));

            result = await supabase
                .from('users')
                .update({
                    wallets: updatedWallets,
                    check_interval: checkInterval,
                    updated_at: new Date().toISOString(),
                })
                .eq('email', email)
                .select()
                .single();
        } else {
            // Insert new user
            result = await supabase
                .from('users')
                .insert([
                    {
                        id: req.user.id,
                        email,
                        wallets,
                        check_interval: checkInterval,
                    }
                ])
                .select()
                .single();
        }

        if (result.error) throw result.error;
        trackWalletsContinuously(email,supabase, false).catch((err) =>
            console.error(`Error starting wallet tracking for ${email}:`, err)
        );

        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Get User Settings
router.get('/settings', authenticate, async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    try {
        console.log('Starting settings query for email:', req.user.email);
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('email', req.user.email)
            .limit(1)
            .maybeSingle();
            
        console.log('Query result:', { data, error });
            
        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }

        if (!data) {
            console.log('No data found for email:', req.user.email);
            return res.status(404).json({ error: 'User settings not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Settings fetch error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Update User Settings
router.put('/settings', authenticate, async (req, res) => {
    const { email, wallets, checkInterval } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    console.log("Received PUT /settings request");
    console.log("Request body:", req.body);
    console.log("Authorization token:", token);

    const supabase = getSupabaseClient(token);
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client not initialized" });
    }

    try {
        if (!email || !wallets || !checkInterval) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log(`Updating settings for ${email}`);
        const { data, error } = await supabase
            .from('users')
            .update({
                wallets,
                check_interval: checkInterval,
                updated_at: new Date().toISOString(),
            })
            .eq('email', email)
            .select();

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        console.log("Update successful:", data);

        trackWalletsContinuously(email,supabase, false).catch((err) =>
            console.error(`Error starting wallet tracking for ${email}:`, err)
        );

        res.json(data);
    } catch (err) {
        console.error("Internal Server Error:", err);
        res.status(500).json({ error: err.message });
    }
});


export default router;