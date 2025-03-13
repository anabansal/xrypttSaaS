import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { config, initializeConfig } from '../config/index.js';

// ABI fragment for getting token decimals
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

// Get decimals for a token contract, ensuring it's a number (not a BigInt)
export const getTokenDecimals = async (tokenAddress) => {
  try {
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
    
    // Call the decimals() function from the contract
    const decimals = await tokenContract.methods.decimals().call();
    // Convert decimals to a Number to avoid BigInt serialization issues
    const decimalsNumber = Number(decimals);
    tokenDecimalsCache.set(tokenAddress, decimalsNumber);
    
    return decimalsNumber;
  } catch (error) {
    console.error(`Error getting token decimals for ${tokenAddress}:`, error.message);
    return 18; // Default to 18 decimals if unable to fetch
  }
};

// Convert token value based on its decimals using BigNumber for fractional amounts
export const convertTokenValue = (value, decimals) => {
  try {
    const valueBN = new BigNumber(value);
    const divisor = new BigNumber(10).exponentiatedBy(decimals);
    const convertedValue = valueBN.dividedBy(divisor);
    return convertedValue.toString();
  } catch (error) {
    console.error('Error converting token value:', error.message);
    throw new Error('Failed to convert token value');
  }
};

// Convert Wei to Ether (for ETH transactions)
export const weiToEther = async (wei) => {
  try {
    await initializeConfig();
    const infuraEndpoint = config.infura.endpoint;
    if (!infuraEndpoint) {
      throw new Error('Infura endpoint is not configured properly');
    }
    
    const web3 = new Web3(infuraEndpoint);
    // Ensure wei is a string before converting
    return web3.utils.fromWei(wei.toString(), 'ether');
  } catch (error) {
    console.error('Error converting Wei to Ether:', error.message);
    throw new Error('Failed to convert Wei to Ether');
  }
};

// Enhanced token transaction decoder with proper value conversion for fractional amounts
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

    // Get token decimals (now guaranteed to be a Number)
    const decimals = await getTokenDecimals(tokenAddress);

    // Function to decode and convert value using BigNumber for fractional amounts
    const decodeValue = (hexValue) => {
      const rawValue = web3.utils.hexToNumberString(`0x${hexValue.padStart(64, '0')}`);
      return convertTokenValue(rawValue, decimals);
    };

    if (methodId === '0xa9059cbb') {
      // Transfer method: address parameter is at bytes 4-36
      const to = `0x${params.slice(24, 64).padStart(40, '0')}`;
      const value = decodeValue(params.slice(64));
      return { 
        method: 'transfer', 
        to, 
        value, 
        decimals, // already a number
        tokenAddress 
      };
    } else if (methodId === '0x095ea7b3') {
      // Approve method: spender parameter is at bytes 4-36
      const spender = `0x${params.slice(24, 64).padStart(40, '0')}`;
      const value = decodeValue(params.slice(64));
      return { 
        method: 'approve', 
        spender, 
        value, 
        decimals, // already a number
        tokenAddress 
      };
    }

    return { method: 'unknown', rawData: inputData };
  } catch (error) {
    console.error('Error decoding token transaction:', error);
    return null;
  }
};
