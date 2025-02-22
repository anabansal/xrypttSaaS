import Web3 from 'web3';
import { config, initializeConfig } from '../config/index.js'; // Import the config and initializeConfig

const ERC20_DECIMALS_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
];

// Cache for token decimals to reduce API calls
const tokenDecimalsCache = new Map();

// Get decimals for a token contract
export const getTokenDecimals = async (tokenAddress) => {
  try {
    // Check cache first
    if (tokenDecimalsCache.has(tokenAddress)) {
      return tokenDecimalsCache.get(tokenAddress);
    }

    await initializeConfig();
    const infuraEndpoint = config.infura.endpoint;

    if (!infuraEndpoint) {
      throw new Error('Infura endpoint is not configured properly');
    }

    const web3 = new Web3(infuraEndpoint);
    const tokenContract = new web3.eth.Contract(ERC20_DECIMALS_ABI, tokenAddress);
    
    const decimals = await tokenContract.methods.decimals().call();
    
    // Cache the result
    tokenDecimalsCache.set(tokenAddress, decimals);
    
    return decimals;
  } catch (error) {
    console.error(`Error getting token decimals for ${tokenAddress}:`, error.message);
    return 18; // Default to 18 decimals if unable to fetch
  }
};

// Convert token value based on its decimals
export const convertTokenValue = (value, decimals) => {
  try {
    const divisor = new Web3.utils.BN(10).pow(new Web3.utils.BN(decimals));
    const valueBN = new Web3.utils.BN(value);
    const convertedValue = valueBN.div(divisor);
    return convertedValue.toString();
  } catch (error) {
    console.error('Error converting token value:', error.message);
    throw new Error('Failed to convert token value');
  }
};
// Convert Wei to Ether
export const weiToEther = async (wei) => {
  try {
    // Ensure config is initialized before accessing it
    await initializeConfig();

    const infuraEndpoint = config.infura.endpoint; // Get Infura endpoint from config

    if (!infuraEndpoint) {
      throw new Error('Infura endpoint is not configured properly');
    }

    const web3 = new Web3(infuraEndpoint); // Initialize Web3 instance with the Infura endpoint

    // Convert Wei to Ether
    return web3.utils.fromWei(wei, 'ether');
  } catch (error) {
    console.error('Error converting Wei to Ether:', error.message);
    throw new Error('Failed to convert Wei to Ether');
  }
};

// Decode token transaction input data
export const decodeTokenTransaction = async (inputData, tokenAddress) => {
  if (!inputData || inputData === '0x') return null;

  try {
    await initializeConfig();
    const infuraEndpoint = config.infura.endpoint;

    if (!infuraEndpoint) {
      throw new Error('Infura endpoint is not configured properly');
    }

    const web3 = new Web3(infuraEndpoint);
    const methodId = inputData.slice(0, 10);
    const params = inputData.slice(10);

    // Get token decimals
    const decimals = await getTokenDecimals(tokenAddress);

    // Function to convert the value based on token decimals
    const convertValue = (rawValue) => {
      const value = web3.utils.hexToNumberString(`0x${rawValue.padStart(64, '0')}`);
      return convertTokenValue(value, decimals);
    };

    if (methodId === '0xa9059cbb') {
      const to = `0x${params.slice(24, 64).padStart(40, '0')}`;
      const value = convertValue(params.slice(64));
      return { method: 'transfer', to, value, decimals };
    } 
    else if (methodId === '0x095ea7b3') {
      const spender = `0x${params.slice(24, 64).padStart(40, '0')}`;
      const value = convertValue(params.slice(64));
      return { method: 'approve', spender, value, decimals };
    }

    return { method: 'unknown', rawData: inputData };
  } catch (error) {
    console.error('Error decoding token transaction:', error);
    return null;
  }
};