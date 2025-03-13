const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getStealthWallets = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_URL}/stealth`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};

export const addStealthWallet = async (walletAddress) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_URL}/stealth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};

export const removeStealthWallet = async (walletAddress) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_URL}/stealth/${walletAddress}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};