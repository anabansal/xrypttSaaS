import axios from 'axios';
const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
console.log(etherscanApiKey);

export async function checkTransactions(walletAddress) {
    try {
        // Get the Etherscan API key from Vite environment variables
        const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

        if (!etherscanApiKey) {
            throw new Error('Etherscan API key is not defined.');
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
            apikey: etherscanApiKey,  // Use the API key from Vite environment
        };

        console.log(`Fetching transactions for wallet: ${walletAddress}`);
        const response = await axios.get('https://api.etherscan.io/api', { params });

        if (response.data.status === '1' && response.data.result.length > 0) {
            return response.data.result;
        }

        console.log(`No transactions found for wallet: ${walletAddress}`);
        return [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

