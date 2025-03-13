import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import RegistrationForm from './RegistrationForm';
import SettingsForm from './SettingsForm';

const WalletTrackingPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('register');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const handleTrackingStarted = () => {
    setNotificationMessage('Wallet Tracking Has Started');
    setNotificationType('success');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLimitError = (message) => {
    setNotificationMessage(message);
    setNotificationType('error');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-background text-primary border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                Wallet Tracking
              </h1>
              <p className="text-xl md:text-2xl text-primary/80 mb-8">
                Monitor Ethereum wallets and receive real-time notifications
              </p>
            </div>
            <div className="hidden lg:block">
              <DotLottieReact
                src="https://lottie.host/ca90d117-6724-411f-8839-714a34644c6c/5fqvJQzs8q.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 mt-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('register')}
              className={`${
                activeTab === 'register'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/40'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200`}
            >
              Register Wallets
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/40'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Content Section */}
        <div className="py-8">
          {activeTab === 'register' ? (
            <RegistrationForm 
              user={user} 
              onTrackingStarted={handleTrackingStarted}
              onLimitError={handleLimitError}
            />
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-primary mb-6">
                Manage Your Tracked Wallets
              </h2>
              <SettingsForm 
                email={user.email} 
                onTrackingStarted={handleTrackingStarted}
                onLimitError={handleLimitError}
              />
            </>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${
            notificationType === 'success' ? 'bg-white/90' : 'bg-red-50/90'
          } backdrop-blur-sm px-8 py-4 rounded-lg shadow-lg`}>
            <p className={`text-2xl font-bold ${
              notificationType === 'success' ? 'text-primary' : 'text-red-600'
            }`}>
              {notificationMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTrackingPage;