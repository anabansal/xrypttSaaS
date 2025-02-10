import React, { useState, useRef, useEffect } from 'react';
import TokenAnalyzer from './TokenAnalyzer';
import TokenBalanceChecker from './TokenBalanceChecker';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const EXAMPLE_TOKENS = [
  {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    name: 'DAI Stablecoin'
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'USD Coin (USDC)'
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    name: 'Tether USD (USDT)'
  },
  {
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    name: 'ChainLink Token'
  },
  {
    address: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
    name: 'Basic Attention Token'
  },
  {
    address: '0x111111111117dc0aa78b770fa6a738034120c302',
    name: '1inch'
  },
  {
    address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    name: 'Compound'
  },
  {
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    name: 'SHIBA INU'
  },
  {
    address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    name: 'Binance USD'
  },
  {
    address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    name: 'Compound DAI'
  }
];

function TokenAnalyzerPage() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHolder, setSelectedHolder] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (holders.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [holders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const analyzer = new TokenAnalyzer();
      const topHolders = await analyzer.getTopHolders(tokenAddress);
      setHolders(topHolders);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPortfolio = async (holder) => {
    setSelectedHolder(holder);
    setLoadingPortfolio(true);
    try {
      const checker = new TokenBalanceChecker();
      const tokens = await checker.getTokenBalance(holder.address);
      setPortfolio(tokens);
    } catch (err) {
      setError('Failed to fetch portfolio: ' + err.message);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handleExampleClick = (address) => {
    setTokenAddress(address);
  };

  const closePortfolio = () => {
    setSelectedHolder(null);
    setPortfolio([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-background text-primary border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                Ethereum Token Analyzer
              </h1>
              <p className="text-xl md:text-2xl text-primary/80 mb-8">
                Analyze any ERC-20 token's top holders and their portfolios in real-time
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="Enter Ethereum token address (0x...)"
                    className="flex-1 px-6 py-4 rounded-lg text-primary bg-background placeholder-primary/50 text-lg focus:ring-2 focus:ring-primary focus:outline-none border border-primary/10"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-primary text-background rounded-lg font-semibold text-lg hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Token'}
                  </button>
                </div>
              </form>
            </div>
            <div className="hidden lg:block">
              <DotLottieReact
                src="https://lottie.host/155f4e75-ff8e-460b-a9ca-9b5570cb85ff/B5pncLHBJj.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>
      </div>

      {/* Example Tokens Section - Only show when no holders are displayed */}
      {holders.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-primary mb-8">Popular Token Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXAMPLE_TOKENS.map((token) => (
              <button
                key={token.address}
                onClick={() => handleExampleClick(token.address)}
                className="p-6 bg-background rounded-lg hover:bg-background-secondary transition-colors duration-200 text-left border border-primary/10"
              >
                <h3 className="text-lg font-semibold text-primary mb-2">{token.name}</h3>
                <p className="text-sm text-primary/60 font-mono break-all">{token.address}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <div className="bg-red-100 text-red-900 p-4 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Results Section */}
      {holders.length > 0 && (
        <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-primary mb-8">Top Token Holders</h2>
          <div className="space-y-6">
            {holders.slice(0, 3).map((holder, index) => (
              <div 
                key={holder.address}
                className="bg-background rounded-lg overflow-hidden border border-primary/10"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl font-bold text-primary mr-6">#{index + 1}</span>
                    <div className="flex-grow">
                      <div className="font-mono text-sm bg-background-secondary p-3 rounded break-all text-primary/80">
                        {holder.address}
                      </div>
                      <p className="mt-3 text-lg font-medium text-primary">
                        Net Inflow: {holder.actualBalance.toLocaleString()} {holder.tokenInfo.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewPortfolio(holder)}
                      className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-md text-background bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      View Portfolio
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {selectedHolder && (
        <div 
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closePortfolio}
        >
          <div 
            className="bg-background rounded-lg border border-primary/10 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary">
                  Portfolio for {selectedHolder.address}
                </h3>
                <button
                  onClick={closePortfolio}
                  className="text-primary/60 hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {loadingPortfolio ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-primary/60">Loading portfolio...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.map((token, index) => (
                    <div key={index} className="bg-background-secondary rounded-lg p-6 border border-primary/10">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-primary">{token.name}</h4>
                        <p className="text-sm text-primary/60">{token.symbol}</p>
                        <p className="font-mono text-sm text-primary/40 break-all mt-2">
                          {token.contract}
                        </p>
                      </div>
                    </div>
                  ))}
                  {portfolio.length === 0 && (
                    <p className="col-span-full text-center text-primary/60 py-8">
                      No tokens found in this wallet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TokenAnalyzerPage;