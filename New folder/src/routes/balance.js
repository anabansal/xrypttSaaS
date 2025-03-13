// routes/balance.js

import express from 'express';
import { fetchFromMoralis, fetchTokenPrice, fetchNativeBalance } from '../services/portfolioService.js';
import { config, initializeConfig } from '../config/index.js';

const router = express.Router();

// GET /api/balance/portfolio/:address
router.get('/portfolio/:address', async (req, res) => {
  try {
    await initializeConfig();
    
    const { address } = req.params;

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }

    let erc20Tokens = null;

    // Try each Moralis API key until we get a successful response
    for (const apiKey of config.moralis.apiKeys) {
      erc20Tokens = await fetchFromMoralis(address, apiKey);
      if (erc20Tokens) break;
    }

    if (!erc20Tokens) {
      throw new Error("Failed to fetch token data: All API keys rate limited");
    }

    // Fetch native ETH balance
    const nativeBalance = await fetchNativeBalance(address);
    const ethPrice = await fetchTokenPrice("ethereum");

    // Prepare portfolio data
    const portfolio = {
      nativeToken: {
        name: "Ethereum",
        symbol: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        balance: nativeBalance,
        priceUsd: ethPrice,
        valueUsd: ethPrice ? nativeBalance * ethPrice : null
      },
      tokens: []
    };

    // Process ERC20 tokens
    for (const token of erc20Tokens) {
      const tokenPrice = await fetchTokenPrice(token.symbol.toLowerCase());
      const balance = parseFloat(token.balance) / (10 ** parseInt(token.decimals));
      
      portfolio.tokens.push({
        name: token.name,
        symbol: token.symbol,
        address: token.token_address,
        balance: balance,
        priceUsd: tokenPrice,
        valueUsd: tokenPrice ? balance * tokenPrice : null
      });
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;