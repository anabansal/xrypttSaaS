import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { validateWalletAddress } from '../utils/validation';
import { useToast } from '../hooks/useToast';
import { getWalletPortfolio } from '../services/portfolioService';
import { LoadingSpinner } from './LoadingSpinner';

const PortfolioViewer = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateWalletAddress(walletAddress)) {
      showError('Please enter a valid wallet address');
      return;
    }

    setLoading(true);
    try {
      const result = await getWalletPortfolio(walletAddress);
      setPortfolio(result);
      showSuccess('Portfolio loaded successfully');
    } catch (error) {
      showError(error.message || 'Failed to fetch portfolio');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatBalance = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-background text-primary border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                Portfolio Viewer
              </h1>
              <p className="text-xl md:text-2xl text-primary/80 mb-8">
                View any Ethereum wallet's complete token portfolio
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter Ethereum wallet address (0x...)"
                    className="flex-1 px-6 py-4 rounded-lg text-primary bg-background placeholder-primary/50 text-lg focus:ring-2 focus:ring-primary focus:outline-none border border-primary/10"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-primary text-background rounded-lg font-semibold text-lg hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'View Portfolio'}
                  </button>
                </div>
              </form>
            </div>
            <div className="hidden lg:block">
              <DotLottieReact
                src="https://lottie.host/068059ff-a9dc-4af4-9347-77641ffb6693/ZlziiBWp9S.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Results */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LoadingSpinner />
        </div>
      ) : portfolio && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-primary mb-8">Token Portfolio</h2>
          
          {/* Native Token Card */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-primary mb-4">Native Token</h3>
            <div className="bg-background-secondary rounded-lg p-6 border border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-primary/60">Token</p>
                  <p className="font-semibold text-primary">{portfolio.nativeToken.name} ({portfolio.nativeToken.symbol})</p>
                </div>
                <div>
                  <p className="text-sm text-primary/60">Balance</p>
                  <p className="font-semibold text-primary">{formatBalance(portfolio.nativeToken.balance)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary/60">Price</p>
                  <p className="font-semibold text-primary">{formatValue(portfolio.nativeToken.priceUsd)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary/60">Value</p>
                  <p className="font-semibold text-primary">{formatValue(portfolio.nativeToken.valueUsd)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ERC20 Tokens */}
          <h3 className="text-xl font-semibold text-primary mb-4">ERC20 Tokens</h3>
          <div className="space-y-4">
            {portfolio.tokens.map((token, index) => (
              <div key={index} className="bg-background-secondary rounded-lg p-6 border border-primary/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-primary/60">Token</p>
                    <p className="font-semibold text-primary">{token.name} ({token.symbol})</p>
                    <p className="text-xs text-primary/40 break-all mt-1">{token.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">Balance</p>
                    <p className="font-semibold text-primary">{formatBalance(token.balance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">Price</p>
                    <p className="font-semibold text-primary">{formatValue(token.priceUsd)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">Value</p>
                    <p className="font-semibold text-primary">{formatValue(token.valueUsd)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">Contract</p>
                    <a
                      href={`https://etherscan.io/token/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover text-sm break-all"
                    >
                      View on Etherscan
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {portfolio.tokens.length === 0 && (
              <p className="text-center text-primary/60 py-8">
                No ERC20 tokens found in this wallet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioViewer;