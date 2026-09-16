import dotenv from 'dotenv';
import path from 'path';

// Declare config at the top level
export let config = {};

// Flag to track if config has already been initialized
let isConfigInitialized = false;

/**
 * Loads environment variables from .env file and sets the configuration object.
 * This function is designed to run only once.
 *
 * @returns {Promise<void>}
 */
export function initializeConfig() {
  return new Promise((resolve) => {
    // If already initialized, resolve immediately.
    if (isConfigInitialized) {
      return resolve();
    }

    // Load environment variables from .env file
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });

    // Set the configuration object
    config = {
      port: process.env.PORT || 3000, // Fallback to 3000 if PORT is not set
      infura: {
        projectId: process.env.INFURA_PROJECT_ID,
        endpoint: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      },
      supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
      },
      resend: {
        apiKey: process.env.RESEND_API_KEY,
      },
      moralis: {
        apiKeys: [
          process.env.MORALIS_API_KEY_1,
          process.env.MORALIS_API_KEY_2
        ],
        endpoint: 'https://deep-index.moralis.io/api/v2'
      },
      etherscan: {
        apiKeys: [
          process.env.ETHERSCAN_API_KEY,
          process.env.ETHERSCAN_API_KEY1
        ],
        // Etherscan's V1 API (separate hostname per chain) was fully
        // deprecated in 2025 and now always returns {status:"0",
        // message:"NOTOK"}. V2 is one endpoint for every chain,
        // selected via the `chainid` query param instead.
        // https://docs.etherscan.io/v2-migration
        endpoint: 'https://api.etherscan.io/v2/api',
        chainIds: {
          mainnet: 1,
          goerli: 5,
          sepolia: 11155111,
          polygon: 137,
        }
      }
    };

    // Mark as initialized so future calls won't reinitialize
    isConfigInitialized = true;
    resolve();
  });
}