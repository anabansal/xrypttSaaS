class TokenBalanceChecker {
  constructor() {
    // Retrieve the comma-separated API keys string from the Vite environment variable
    const keysString = import.meta.env.VITE_ETHERSCAN_API_KEYS;

    if (!keysString) {
      console.error('Missing VITE_ETHERSCAN_API_KEYS environment variable');
      this.apiKeys = [];
    } else {
      // Split the string into an array of keys and trim any extra whitespace
      this.apiKeys = keysString.split(',').map(key => key.trim());
    }
    
    this.currentKeyIndex = 0;
    this.baseUrl = "https://api.etherscan.io/api";
  }
  async getTokenBalance(walletAddress) {
    try {
      const apiKey = this.apiKeys[this.currentKeyIndex];
      const params = new URLSearchParams({
        module: 'account',
        action: 'tokentx',
        address: walletAddress,
        sort: 'desc',
        apikey: apiKey
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();

      if (response.status === 429) {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        await new Promise(resolve => setTimeout(resolve, 200));
        return this.getTokenBalance(walletAddress);
      }

      if (data.status === '1') {
        const uniqueTokens = new Set();
        const tokens = [];

        for (const tx of data.result || []) {
          const tokenAddress = tx.contractAddress;
          if (!uniqueTokens.has(tokenAddress)) {
            uniqueTokens.add(tokenAddress);
            tokens.push({
              name: tx.tokenName,
              symbol: tx.tokenSymbol,
              contract: tokenAddress,
              decimals: tx.tokenDecimal
            });
          }
        }
        return tokens;
      }
      return [];

    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }
}

export default TokenBalanceChecker;