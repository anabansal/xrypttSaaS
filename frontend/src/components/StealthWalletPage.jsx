import React, { useState, useEffect } from 'react';
import { validateWalletAddress } from '../utils/validation';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from './LoadingSpinner';
import { getStealthWallets, addStealthWallet, removeStealthWallet } from '../services/stealthService';

const StealthWalletPage = ({ user }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [stealthWallets, setStealthWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadStealthWallets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadStealthWallets = async () => {
    try {
      const data = await getStealthWallets();
      setStealthWallets(data || []);
    } catch (error) {
      console.error('Error loading stealth wallets:', error);
      showError('Failed to load stealth wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateWalletAddress(walletAddress)) {
      showError('Please enter a valid wallet address');
      return;
    }

    try {
      await addStealthWallet(walletAddress);
      showSuccess('Wallet added to stealth list');
      setWalletAddress('');
      loadStealthWallets();
    } catch (error) {
      if (error.message?.includes('Subscription limit reached')) {
        showError('You have reached your plan\'s stealth wallet limit. Please upgrade to Privacy Shield plan.');
      } else {
        showError('Failed to add wallet to stealth list');
      }
    }
  };

  const handleRemove = async (walletAddress) => {
    try {
      await removeStealthWallet(walletAddress);
      showSuccess('Wallet removed from stealth list');
      setStealthWallets(stealthWallets.filter(wallet => wallet.wallet_address !== walletAddress));
    } catch (error) {
      console.error('Error removing wallet:', error);
      showError('Failed to remove wallet from stealth list');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Please Sign In</h2>
          <p className="text-primary/70">You need to be signed in to access the StealthWallet feature.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-background text-primary border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              StealthWallet
            </h1>
            <p className="text-xl md:text-2xl text-primary/80 mb-8">
              Protect your wallets from being tracked by others
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Add Wallet Form */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Add Wallet to Stealth List</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter Ethereum wallet address (0x...)"
                  className="w-full px-4 py-2 rounded-lg border border-primary/10 bg-background text-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-background bg-primary hover:bg-primary-hover"
              >
                Add to Stealth List
              </button>
            </form>
          </section>

          {/* Stealth Wallets List */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Your Stealth Wallets</h2>
            {stealthWallets.length === 0 ? (
              <p className="text-primary/70">No wallets in your stealth list yet.</p>
            ) : (
              <div className="space-y-4">
                {stealthWallets.map((wallet) => (
                  <div
                    key={wallet.wallet_address}
                    className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
                  >
                    <span className="font-mono text-primary/80">{wallet.wallet_address}</span>
                    <button
                      onClick={() => handleRemove(wallet.wallet_address)}
                      className="ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default StealthWalletPage;