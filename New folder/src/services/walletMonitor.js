import { weiToEther, decodeTokenTransaction } from './web3Service.js';
import { checkTransactions } from './transactionService.js';
import { supabase } from '../utils/supabase.js';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';
import { sendEmailNotification,sendTrackingStartedEmail,formatTransactionDetails } from './emailService.js';

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
        const { data: activeUsers, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('tracking_active', true);

        if (error) {
            console.error('Error fetching active users:', error);
            return;
        }

        console.log(`Initializing tracking for ${activeUsers.length} active users`);
        
        for (const user of activeUsers) {
            await trackWalletsContinuously(user.email, supabaseAdmin, true);
        }
    } catch (error) {
        console.error('Error during tracking initialization:', error);
    }
}

/**
 * Fetches user data from the database or cache
 */
async function getUserData(email, client, isServerInit = false) {
    const cachedData = userCache.get(email);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data;
    }

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
 */
export async function trackWalletsContinuously(email, client, isServerInit = false) {
    console.log(`Starting wallet tracking for email: ${email} (Server Init: ${isServerInit})`);

    userCache.delete(email);
    await stopWalletTracking(email, client, isServerInit);

    try {
        const userData = await getUserData(email, client, isServerInit);
        console.log(`Found user data:`, { email, walletsCount: userData.wallets.length, checkInterval: userData.check_interval });

        const { wallets, check_interval: checkInterval } = userData;

        await client
            .from('users')
            .update({ 
                tracking_active: true,
                last_tracking_start: new Date().toISOString()
            })
            .eq('email', email);

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

                    await processWalletTransactions(email, walletAddress, monitorOptions, walletState, client);
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
 */
export async function stopWalletTracking(email, client, isServerInit = false) {
    console.log(`Stopping wallet tracking for email: ${email}`);
    
    for (const [key, intervalId] of walletIntervals.entries()) {
        if (key === email) {  // Changed from startsWith to equality check
            clearInterval(intervalId);
            walletIntervals.delete(key);
            processingState.delete(key);
            console.log(`Cleared interval for ${key}`);
        }
    }

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
async function processWalletTransactions(email, walletAddress, monitorOptions, walletState, client) {
    if (walletState.isFirstRun) {
        const { data: savedState } = await client
            .from('wallet_states')
            .select('last_transaction_hash')
            .eq('wallet_address', walletAddress)
            .eq('user_email', email)
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

        let transactionAmount;
        let tokenData = null;

        if (transaction.input && transaction.input !== '0x') {
        // This is a token transaction
        tokenData = await decodeTokenTransaction(transaction.input, transaction.to);
        if (tokenData && (tokenData.method === 'transfer' || tokenData.method === 'approve')) {
        transactionAmount = tokenData.value; // Value is already converted based on token decimals
        }
        } else {
        // This is a regular ETH transaction
        transactionAmount = await weiToEther(transaction.value);
        }

        if (shouldNotifyTransaction(transaction, tokenData, monitorOptions,transactionAmount)) {
            console.log(`Adding transaction ${transaction.hash} to notification list`);
            if (tokenData) {
                if (tokenData.method === 'transfer') {
                  // For token transfers, sender is still transaction.from,
                  // while the real recipient comes from tokenData.to.
                  newTransactions.push({
                    hash: transaction.hash,
                    from: transaction.from,
                    to: tokenData.to, // Real recipient from the token transfer input data
                    amount: transactionAmount,
                    timestamp: new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(),
                    tokenData: JSON.stringify(tokenData),
                  });
                } else if (tokenData.method === 'approve') {
                  // For token approvals, there is no transfer of tokens,
                  // so record the approved spender instead.
                  newTransactions.push({
                    hash: transaction.hash,
                    from: transaction.from,
                    spender: tokenData.spender, // Approved spender
                    approvedAmount: transactionAmount,
                    timestamp: new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(),
                    tokenData: JSON.stringify(tokenData),
                  });
                }
              } else {
                // For ETH transfers, use the transaction.to field.
                newTransactions.push({
                  hash: transaction.hash,
                  from: transaction.from,
                  to: transaction.to,
                  amount: transactionAmount,
                  timestamp: new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(),
                  tokenData: null,
                });
            }
        }
    }

    if (newTransactions.length > 0) {
        if (walletState.isFirstRun) {
            walletState.lastTransactionHash = newTransactions[0].hash;
            console.log(`First run detected. Updated lastTransactionHash to: ${walletState.lastTransactionHash}`);
            walletState.isFirstRun = false;
            await sendTrackingStartedEmail(email, walletAddress, newTransactions);
        } else {
            console.log(`Handling ${newTransactions.length} new transactions for email: ${email}`);
            await handleNewTransactions(newTransactions, email);
            walletState.lastTransactionHash = newTransactions[0].hash;
            console.log(`Updated lastTransactionHash to: ${walletState.lastTransactionHash}`);
        }

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

// Helper functions remain unchanged
function shouldNotifyTransaction(transaction, tokenData, monitorOptions, transactionAmount) {
    // Parse the amount to a float for comparison.
    const amount = parseFloat(transactionAmount);
  
    return (
      (monitorOptions.tokenTransfers && tokenData?.method === 'transfer' && amount >= monitorOptions.minTransactionValue) ||
      (monitorOptions.tokenApprovals && tokenData?.method === 'approve'&& amount >= monitorOptions.minTransactionValue ) ||
      (monitorOptions.etherTransfers && !tokenData && amount >= monitorOptions.minTransactionValue)
    );
  }

  async function handleNewTransactions(transactions, email) {
    console.log(`Creating email content for ${transactions.length} transactions`);
    const emailContent = transactions
      .map((txn, index) => (
        `Transaction ${index + 1}:\n${formatTransactionDetails(txn)}\n`
      ))
      .join('\n---------------------\n');
  
    try {
      await sendEmailNotification(
        { combined: true, details: emailContent },
        email
      );
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