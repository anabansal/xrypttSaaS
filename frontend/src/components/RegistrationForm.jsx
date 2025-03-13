import React, { useState } from 'react';
import { validateWalletAddress } from '../utils/validation';
import { useToast } from '../hooks/useToast';
import { registerUser } from '../utils/api';
import { DEFAULT_WALLET } from '../utils/constants';

const RegistrationForm = ({ user, onTrackingStarted, onLimitError }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const [wallets, setWallets] = useState([]);
  const [checkInterval, setCheckInterval] = useState(60000);
  const { showSuccess, showError } = useToast();

  const handleAddWallet = (e) => {
    e.preventDefault();

    if (!validateWalletAddress(walletAddress)) {
      showError('Please enter a valid wallet address');
      return;
    }

    const newWallet = {
      ...DEFAULT_WALLET,
      address: walletAddress,
      nickname: nickname || walletAddress,
    };

    setWallets([...wallets, newWallet]);
    setWalletAddress('');
    setNickname('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (wallets.length === 0) {
      showError('Please add at least one wallet');
      return;
    }

    try {
      await registerUser({ 
        email: user.email, 
        wallets, 
        checkInterval 
      });
      showSuccess('Registration successful!');
      onTrackingStarted();
    } catch (error) {
      if (error.message?.includes('Subscription limit reached')) {
        onLimitError('You have reached your plan\'s wallet limit. Please upgrade your subscription.');
      } else {
        showError(error.message || 'Registration failed');
      }
    }
  };

  const removeWallet = (index) => {
    setWallets(wallets.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary">
          Check Interval (milliseconds)
        </label>
        <input
          type="number"
          value={checkInterval}
          onChange={(e) => setCheckInterval(parseInt(e.target.value))}
          min="1000"
          required
          className="mt-1 block w-full rounded-lg border-primary/10 shadow-sm focus:border-primary focus:ring-primary bg-background text-primary"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-medium text-primary">Add Wallet</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="flex-1 px-4 py-2 rounded-lg border border-primary/10 bg-background text-primary"
            />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter nickname (optional)"
              className="flex-1 px-4 py-2 rounded-lg border border-primary/10 bg-background text-primary"
            />
            <button
              type="button"
              onClick={handleAddWallet}
              className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary-hover"
            >
              Add Wallet
            </button>
          </div>
        </div>

        {/* Display added wallets */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium text-primary">Added Wallets</h3>
          {wallets.map((wallet, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-background-secondary rounded-lg">
              <div>
                <p className="font-medium text-primary">{wallet.nickname}</p>
                <p className="text-sm text-primary/60 font-mono">{wallet.address}</p>
              </div>
              <button
                type="button"
                onClick={() => removeWallet(index)}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-background bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
      >
        Register Wallets
      </button>
    </form>
  );
};

export default RegistrationForm;