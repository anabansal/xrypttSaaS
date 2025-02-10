class TokenInfo {
  constructor(decimals, name, symbol) {
    this.decimals = decimals;
    this.name = name;
    this.symbol = symbol;
  }
}

class APIKeyManager {
  constructor() {
    // Instead of hardcoding API keys, we'll load them from environment variables
    this.apiKeys = this.loadApiKeys();
    this.keyStatus = Object.fromEntries(
      this.apiKeys.map((key) => [key, { lastUsed: 0, retryAfter: 0 }])
    );
    this.minDelay = 200;
    this.baseBackoff = 1000;
  }

  loadApiKeys() {
    // Load API keys from environment variables
    const keys = [];
    for (let i = 1; i <= 20; i++) {
      const key = import.meta.env[`VITE_ETHERSCAN_API_KEY_${i}`];
      if (key) {
        keys.push(key);
      }
    }

    // If no keys are found in environment variables, use the fallback key
    if (keys.length === 0) {
      const fallbackKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
      if (fallbackKey) {
        keys.push(fallbackKey);
      } else {
        console.error('No API keys found in environment variables');
      }
    }

    return keys;
  }

  getAvailableKey() {
    const currentTime = Date.now();
    const availableKeys = this.apiKeys.filter(
      (key) => currentTime >= this.keyStatus[key].retryAfter
    );

    if (availableKeys.length === 0) return null;

    return availableKeys.reduce((a, b) =>
      this.keyStatus[a].lastUsed < this.keyStatus[b].lastUsed ? a : b
    );
  }

  markKeyUsed(key) {
    this.keyStatus[key].lastUsed = Date.now();
  }

  markKeyRateLimited(key, attempt) {
    const backoff = Math.min(300000, this.baseBackoff * Math.pow(2, attempt));
    const jitter = Math.random() * 0.1 * backoff;
    this.keyStatus[key].retryAfter = Date.now() + backoff + jitter;
  }
}

class TokenAnalyzer {
  constructor() {
    this.etherscanUrl = 'https://api.etherscan.io/api';
    this.keyManager = new APIKeyManager();
  }

  async fetchTransfersPage(tokenAddress, page, retryCount = 0) {
    const apiKey = this.keyManager.getAvailableKey();
    if (!apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [[], false, null];
    }

    const params = new URLSearchParams({
      module: 'account',
      action: 'tokentx',
      contractaddress: tokenAddress,
      page: page.toString(),
      offset: '1000',
      sort: 'desc',
      apikey: apiKey,
    });

    try {
      this.keyManager.markKeyUsed(apiKey);
      const response = await fetch(`${this.etherscanUrl}?${params}`);
      const data = await response.json();

      if (data.status === '1' && data.result) {
        let tokenInfo = null;
        if (data.result.length > 0) {
          const firstTx = data.result[0];
          tokenInfo = new TokenInfo(
            parseInt(firstTx.tokenDecimal || '18'),
            firstTx.tokenName || 'Unknown',
            firstTx.tokenSymbol || ''
          );
        }
        return [data.result, true, tokenInfo];
      } else if (
        data.result &&
        data.result.includes('Max rate limit reached')
      ) {
        this.keyManager.markKeyRateLimited(apiKey, retryCount);
        if (retryCount < 5) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return this.fetchTransfersPage(tokenAddress, page, retryCount + 1);
        }
      }
      return [[], true, null];
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      if (retryCount < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.fetchTransfersPage(tokenAddress, page, retryCount + 1);
      }
      return [[], false, null];
    }
  }

  async getTopHolders(tokenAddress, numHolders = 3) {
    const holders = new Map();
    let currentPage = 1;
    let totalTransactionsProcessed = 0;
    let tokenInfo = null;
    const maxTransactions = 100000;

    while (totalTransactionsProcessed < maxTransactions) {
      const [transfers, success, newTokenInfo] = await this.fetchTransfersPage(
        tokenAddress,
        currentPage
      );

      if (!success) {
        console.log(`Failed to fetch page ${currentPage}`);
        break;
      }

      if (transfers.length === 0) {
        console.log(`No more transfers on page ${currentPage}. Stopping.`);
        break;
      }

      if (newTokenInfo && !tokenInfo) {
        tokenInfo = newTokenInfo;
      }

      for (const tx of transfers) {
        const value = BigInt(tx.value);
        const fromAddr = tx.from.toLowerCase();
        const toAddr = tx.to.toLowerCase();

        holders.set(fromAddr, (holders.get(fromAddr) || BigInt(0)) - value);
        holders.set(toAddr, (holders.get(toAddr) || BigInt(0)) + value);
      }

      totalTransactionsProcessed += transfers.length;
      console.log(
        `Processed page ${currentPage}, transfers: ${transfers.length}, ` +
          `total processed: ${totalTransactionsProcessed}/${maxTransactions}`
      );

      currentPage++;

      if (
        transfers.length === 0 ||
        totalTransactionsProcessed >= maxTransactions
      ) {
        break;
      }
    }

    if (!tokenInfo) {
      tokenInfo = new TokenInfo(18, 'Unknown', 'Unknown');
    }

    const positiveHolders = Array.from(holders.entries())
      .filter(([_, balance]) => balance > BigInt(0))
      .sort(([, a], [, b]) => (b > a ? 1 : -1))
      .slice(0, numHolders)
      .map(([address, balance]) => ({
        address,
        balance: balance.toString(),
        actualBalance: Number(balance) / Math.pow(10, tokenInfo.decimals),
        tokenInfo: {
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
        },
      }));

    return positiveHolders;
  }
}

export default TokenAnalyzer;