import axios from 'axios';
import { config, initializeConfig } from '../config/index.js';  // Update this path according to your file structure

/**
 * Check transactions for a given Ethereum wallet address
 * @param {string} walletAddress - The Ethereum wallet address to check
 * @param {string} network - The network to check (default: 'mainnet')
 * @returns {Promise<Array>} Array of transactions or empty array if none found
 */
export async function checkTransactions(walletAddress, network = 'mainnet') {
    try {
        // Ensure the configuration is initialized before proceeding
        await initializeConfig();

        const etherscanApiKey = config.etherscan.apiKeys[0];
        const endpoint = config.etherscan.networks[network] || config.etherscan.endpoint;

        if (!etherscanApiKey) {
            throw new Error('Etherscan API key is not configured.');
        }

        if (!walletAddress) {
            throw new Error('Wallet address is required.');
        }

        // Validate wallet address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            throw new Error('Invalid Ethereum wallet address format.');
        }

        const params = {
            module: 'account',
            action: 'txlist',
            address: walletAddress,
            startblock: 0,
            endblock: 99999999,
            page: 1,
            offset: 5,
            sort: 'desc',
            apikey: etherscanApiKey
        };

        console.log(`Fetching transactions for wallet: ${walletAddress} on network: ${network}`);
        
        const response = await axios.get(endpoint, { 
            params,
            timeout: 5000 // 5 second timeout
        });

        // Check for API error responses
        if (response.data.status === '0') {
            throw new Error(`Etherscan API Error: ${response.data.message || 'Unknown error'}`);
        }

        if (response.data.status === '1' && response.data.result.length > 0) {
            return response.data.result;
        }

        console.log(`No transactions found for wallet: ${walletAddress}`);
        return [];

    } catch (error) {
        // Handle specific types of errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Response Error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from API');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }

        throw error; // Re-throw the error for the calling function to handle
    }
}
