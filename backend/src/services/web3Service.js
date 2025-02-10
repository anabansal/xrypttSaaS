import Web3 from 'web3';
import { config, initializeConfig } from '../config/index.js'; // Import the config and initializeConfig

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
export const decodeTokenTransaction = async (inputData) => {
  if (!inputData || inputData === '0x') return null;

  try {
    // Ensure config is initialized before accessing it
    await initializeConfig();

    const infuraEndpoint = config.infura.endpoint; // Get Infura endpoint from config

    if (!infuraEndpoint) {
      throw new Error('Infura endpoint is not configured properly');
    }

    const web3 = new Web3(infuraEndpoint); // Initialize Web3 instance with the Infura endpoint

    const methodId = inputData.slice(0, 10); // First 4 bytes of the input data
    const params = inputData.slice(10); // Remaining data

    // Check for 'transfer' method
    if (methodId === '0xa9059cbb') {
      const to = `0x${params.slice(24, 64).padStart(40, '0')}`; // Decode 'to' address with padding
      const value = web3.utils.hexToNumberString(`0x${params.slice(64).padStart(64, '0')}`); // Decode value
      return { method: 'transfer', to, value };
    } 
    // Check for 'approve' method
    else if (methodId === '0x095ea7b3') {
      const spender = `0x${params.slice(24, 64).padStart(40, '0')}`; // Decode spender address with padding
      const value = web3.utils.hexToNumberString(`0x${params.slice(64).padStart(64, '0')}`); // Decode value
      return { method: 'approve', spender, value };
    }

    // Unknown method
    return { method: 'unknown', rawData: inputData };
  } catch (error) {
    console.error('Error decoding token transaction:', error);
    return null;
  }
};
