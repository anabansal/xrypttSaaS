import axios from 'axios';
import { config, initializeConfig } from '../config/index.js';

// const MORALIS_API_KEYS = [
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjBlMzFjNzVjLTk3NWUtNDY0Zi1hZjUyLWFjMDcwM2U5NjQzZCIsIm9yZ0lkIjoiNDI1NjkzIiwidXNlcklkIjoiNDM3ODQ0IiwidHlwZUlkIjoiOGJmMDk5Y2EtN2VlNy00NDE0LWE2ZjYtNTFkMGIxYWZkYzBlIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzY4NTk5ODUsImV4cCI6NDg5MjYxOTk4NX0.KEVATziSLfvdiKjI21PjkPKnRKQaFUrWTs2LTFqt7ro",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImU1Y2RmN2Y0LTNmYTUtNGI2YS04ODZjLWM2ZmZlZGNmN2YyMiIsIm9yZ0lkIjoiNDI3MTMxIiwidXNlcklkIjoiNDM5MzUxIiwidHlwZUlkIjoiOTQwNjQ4MDUtZTExYi00OGVhLWI1ZjQtZjMwOTNmNDVjNmVlIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Mzc2MzAzMTgsImV4cCI6NDg5MzM5MDMxOH0._iWfiKTCh-_x8nEn6QoRTrsy-ffX4mLuYIvWPwvLcK8"
// ];

// const ETHERSCAN_API_KEY = "HJXMFSUP35NHENSP9A42IXA1XCTJRSZ78K";

export async function fetchFromMoralis(address, apiKey) {
  try {
    
    
    const response = await axios.get(
      `${config.moralis.endpoint}/${address}/erc20?chain=eth`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      return null; // Rate limit reached
    }
    throw error;
  }
}

export async function fetchTokenPrice(symbol) {
  try {
    
    
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`
    );
    return response.data[symbol.toLowerCase()]?.usd;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

export async function fetchNativeBalance(address) {
  try {
    await initializeConfig();
    
    const apiKey = config.etherscan.apiKeys[0];
    
    const response = await axios.get(
      `${config.etherscan.endpoint}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    
    if (response.data.status !== "1") {
      throw new Error(response.data.result);
    }
    
    return parseInt(response.data.result) / (10 ** 18); // Convert Wei to ETH
  } catch (error) {
    console.error('Error fetching native balance:', error);
    throw error;
  }
}

