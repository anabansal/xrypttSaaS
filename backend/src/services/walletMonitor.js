import { weiToEther, decodeTokenTransaction } from './web3Service.js';
import { checkTransactions } from './transactionService.js';
import { supabase } from '../utils/supabase.js';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';

// Get the API base URL dynamically
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path
  : 'http://localhost:3000/api'; // In development, use localhost

// Cache for user data to reduce database queries
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Store intervals globally
const walletIntervals = new Map();
const processingState = new Map();

/**
 * Initialize tracking for all active users on server start
 */
export async function initializeTrackingOnStartup() {
    try {
        // Use supabaseAdmin for server-side initialization
        const { data: activeUsers, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('tracking_active', true);

        if (error) {
            console.error('Error fetching active users:', error);
            return;
        }

        console.log(`Initializing tracking for ${activeUsers.length} active users`);
        
        // Start tracking for each active user with isServerInit flag
        for (const user of activeUsers) {
            await trackWalletsContinuously(user.email, true);
        }
    } catch (error) {
        console.error('Error during tracking initialization:', error);
    }
}

/**
 * Fetches user data from the database or cache
 * @param {string} email - User's email
 * @param {boolean} isServerInit - Whether this is server initialization
 */
async function getUserData(email, isServerInit = false) {
    const cachedData = userCache.get(email);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data;
    }

    // Use appropriate Supabase client based on context
    const client = isServerInit ? supabaseAdmin : supabase;

    const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !data) {
        console.error(`User ${email} not found. Error:`, error);
        throw new Error(`User ${email} not found: ${error?.message}`);
    }

    userCache.set(email, {
        data,
        timestamp: Date.now()
    });

    return data;
}

/**
 * Starts continuous tracking of wallets for a specific email
 * @param {string} email - User's email
 * @param {boolean} isServerInit - Whether this is server initialization
 */
export async function trackWalletsContinuously(email, isServerInit = false) {
    console.log(`Starting wallet tracking for email: ${email} (Server Init: ${isServerInit})`);

    // Stop existing tracking before starting fresh
    userCache.delete(email);
    await stopWalletTracking(email, isServerInit);

    try {
        const userData = await getUserData(email, isServerInit);
        console.log(`Found user data:`, { email, walletsCount: userData.wallets.length, checkInterval: userData.check_interval });

        const { wallets, check_interval: checkInterval } = userData;

        // Use appropriate Supabase client based on context
        const client = isServerInit ? supabaseAdmin : supabase;

        // Update tracking status in database
        await client
            .from('users')
            .update({ 
                tracking_active: true,
                last_tracking_start: new Date().toISOString()
            })
            .eq('email', email);

        // Store last processed transaction hashes
        const walletStates = new Map(wallets.map(wallet => [
            wallet.address,
            { lastTransactionHash: null, isFirstRun: true }
        ]));

        const intervalId = setInterval(async () => {
            console.log(`Checking transactions for all wallets for user ${email}`);
            
            for (const wallet of wallets) {
                const { address: walletAddress, monitorOptions } = wallet;
                const walletState = walletStates.get(walletAddress);

                try {
                    const isStealthWallet = await isWalletInStealthTable(walletAddress);
                    if (isStealthWallet) {
                        console.log(`Skipping stealth wallet: ${walletAddress}`);
                        continue;
                    }

                    await processWalletTransactions(email, walletAddress, monitorOptions, walletState, isServerInit);
                } catch (error) {
                    console.error(`Error processing wallet ${walletAddress}:`, error);
                }
            }
        }, checkInterval);

        walletIntervals.set(email, intervalId);
        console.log(`Monitoring interval set for all wallets under user ${email} with interval: ${checkInterval}ms`);
    } catch (error) {
        console.error(`Error starting tracking for ${email}:`, error);
        throw error;
    }
}

/**
 * Stops wallet tracking for a specific email
 * @param {string} email - User's email
 * @param {boolean} isServerInit - Whether this is server initialization
 */
export async function stopWalletTracking(email, isServerInit = false) {
    console.log(`Stopping wallet tracking for email: ${email}`);
    
    // Clear intervals
    for (const [key, intervalId] of walletIntervals.entries()) {
        if (key.startsWith(`${email}-`)) {
            clearInterval(intervalId);
            walletIntervals.delete(key);
            processingState.delete(key);
            console.log(`Cleared interval for ${key}`);
        }
    }

    // Use appropriate Supabase client based on context
    const client = isServerInit ? supabaseAdmin : supabase;

    // Update tracking status in database
    try {
        await client
            .from('users')
            .update({ tracking_active: false })
            .eq('email', email);
    } catch (error) {
        console.error(`Error updating tracking status for ${email}:`, error);
    }
}

/**
 * Checks if a wallet address exists in the stealth_wallets table
 * @param {string} walletAddress - Wallet address to check
 * @param {boolean} isServerInit - Whether this is server initialization
 */
async function isWalletInStealthTable(walletAddress, isServerInit = true) {
    try {
        const client = isServerInit ? supabaseAdmin : supabase;
        const { data: stealthWalletData, error: stealthWalletError } = await client
            .from('stealth_wallets')
            .select('wallet_address')
            .eq('wallet_address', walletAddress)
            .single();

        if (stealthWalletError || !stealthWalletData) {
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Error checking stealth wallet for ${walletAddress}:`, error);
        return false;
    }
}

/**
 * Processes transactions for a specific wallet
 */
async function processWalletTransactions(email, walletAddress, monitorOptions, walletState, isServerInit = false) {
    const client = isServerInit ? supabaseAdmin : supabase;

    // Load last processed transaction from database if it's the first run
    if (walletState.isFirstRun) {
        const { data: savedState } = await client
            .from('wallet_states')
            .select('last_transaction_hash')
            .eq('wallet_address', walletAddress)
            .eq('user_email', email) // Now filtering by user_email as well
            .single();
        
        if (savedState?.last_transaction_hash) {
            walletState.lastTransactionHash = savedState.last_transaction_hash;
            console.log(`Loaded last transaction hash from DB: ${walletState.lastTransactionHash}`);
        }
    }

    console.log(`Checking transactions for wallet: ${walletAddress}`);
    const transactions = await checkTransactions(walletAddress);
    console.log(`Found ${transactions.length} transactions for wallet: ${walletAddress}`);

    if (transactions.length === 0) return;

    const newTransactions = [];
    for (const transaction of transactions) {
        console.log(`Processing transaction: ${transaction.hash}`);

        if (transaction.hash === walletState.lastTransactionHash) {
            console.log(`Stopping at last processed transaction: ${walletState.lastTransactionHash}`);
            break;
        }

        const [valueInEther, tokenData] = await Promise.all([
            weiToEther(transaction.value),
            decodeTokenTransaction(transaction.input)
        ]);

        if (shouldNotifyTransaction(transaction, tokenData, monitorOptions, valueInEther)) {
            console.log(`Adding transaction ${transaction.hash} to notification list`);
            newTransactions.push({
                hash: transaction.hash,
                from: transaction.from,
                to: transaction.to,
                amount: valueInEther,
                timestamp: new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(),
                tokenData: tokenData ? JSON.stringify(tokenData) : null,
            });
        }
    }

    if (newTransactions.length > 0) {
        if (walletState.isFirstRun) {
            walletState.lastTransactionHash = newTransactions[0].hash;
            console.log(`First run detected. Updated lastTransactionHash to: ${walletState.lastTransactionHash}`);
            walletState.isFirstRun = false;
        } else {
            console.log(`Handling ${newTransactions.length} new transactions for email: ${email}`);
            await handleNewTransactions(newTransactions, email);
            walletState.lastTransactionHash = newTransactions[0].hash;
            console.log(`Updated lastTransactionHash to: ${walletState.lastTransactionHash}`);
        }

        // Save the latest transaction hash to the database
        await client
            .from('wallet_states')
            .upsert({
                wallet_address: walletAddress,
                user_email: email,
                last_transaction_hash: walletState.lastTransactionHash,
                last_check: new Date().toISOString()
            });
    }
}

// These functions remain unchanged as they don't interact with Supabase
function shouldNotifyTransaction(transaction, tokenData, monitorOptions, valueInEther) {
    return (
        (monitorOptions.tokenTransfers && tokenData?.method === 'transfer') ||
        (monitorOptions.tokenApprovals && tokenData?.method === 'approve') ||
        (monitorOptions.etherTransfers && parseFloat(valueInEther) >= monitorOptions.minTransactionValue)
    );
}

async function handleNewTransactions(transactions, email) {
    console.log(`Creating email content for ${transactions.length} transactions`);
    const emailContent = transactions
        .map((txn, index) => (
            `Transaction ${index + 1}:\nHash: ${txn.hash}\n` +
            `From: ${txn.from}\nTo: ${txn.to}\n` +
            `Amount: ${txn.amount} ETH\n` +
            `Timestamp: ${txn.timestamp}\n` +
            `Token Data: ${txn.tokenData || 'N/A'}\n\n`
        ))
        .join('---------------------\n');

    try {
        const response = await fetch(`${API_BASE_URL}/emails/send-transaction-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transactionDetails: { combined: true, details: emailContent },
                recipientEmail: email
            }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        console.log('Email notification sent successfully');
    } catch (error) {
        console.error('Failed to send transaction notification:', error);
    }
}

export default {
    initializeTrackingOnStartup,
    trackWalletsContinuously,
    stopWalletTracking
};