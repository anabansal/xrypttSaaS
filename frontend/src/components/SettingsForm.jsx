import React, { useState, useEffect } from 'react';
import WalletForm from './WalletForm';
import { getUserSettings, updateUserSettings } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from './LoadingSpinner';


const SettingsForm = ({ email, onTrackingStarted }) => {
  console.log('SettingsForm mounted');
  const [wallets, setWallets] = useState([]);
  const [checkInterval, setCheckInterval] = useState(60000);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    console.log('useEffect triggered with email:', email);
    if (email) {
      loadSettings();
    }
  }, [email]);
  

  const loadSettings = async () => {
    try {
      //console.log("function called");
      const settings = await getUserSettings(email);
      if (settings) {
        setWallets(settings.wallets || []);
        setCheckInterval(settings.check_interval || 60000);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showError(error.message || 'Failed to load settings');
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateUserSettings({ email, wallets, checkInterval });
      showSuccess('Settings updated successfully!');
      onTrackingStarted();
    } catch (error) {
      showError(error.message || 'Failed to update settings');
    }
  };

  const updateWallet = (index, updatedWallet) => {
    const newWallets = [...wallets];
    newWallets[index] = updatedWallet;
    setWallets(newWallets);
  };

  const removeWallet = async (index) => {
    const newWallets = wallets.filter((_, i) => i !== index);
    setWallets(newWallets);
    try {
      await updateUserSettings({email, wallets: newWallets, checkInterval });
      showSuccess('Wallet removed successfully!');
      onTrackingStarted();
    } catch (error) {
      showError(error.message || 'Failed to remove wallet');
      // Revert the state if the API call fails
      setWallets(wallets);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <form className="space-y-6">
      <div>
        <div className="flex items-end gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-primary mb-2">
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
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-hover transition-colors duration-200"
          >
            Set Interval
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-primary">Wallets</h3>
        {wallets.map((wallet, index) => (
          <WalletForm
            key={index}
            wallet={wallet}
            onChange={(updated) => updateWallet(index, updated)}
            onRemove={() => removeWallet(index)}
            onSaveSettings={handleSaveSettings}
          />
        ))}
      </div>
    </form>
  );
};

export default SettingsForm;