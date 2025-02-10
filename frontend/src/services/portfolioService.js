import axios from 'axios';


export async function getWalletPortfolio(address) {
  try {
    
    
    // Determine the API base URL - in development it might be localhost
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    const response = await axios.get(`${API_BASE_URL}/balance/portfolio/${address}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch portfolio');
    }
    throw error;
  }
}