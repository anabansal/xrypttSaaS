import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import TokenAnalyzerPage from './TokenAnalyzerPage';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PricingPage from './components/PricingPage';
import AboutUsPage from './components/AboutUsPage';
import UserDashboard from './components/UserDashboard';
import WalletTrackingPage from './components/WalletTrackingPage';
import StealthWalletPage from './components/StealthWalletPage';
import PortfolioViewer from './components/PortfolioViewer';
import RefundPolicyPage from './components/RefundPolicyPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import { ThemeProvider } from './context/ThemeContext';
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');

  // Add useEffect for handling auth redirects
  useEffect(() => {
    if (window.location.pathname.startsWith('/auth')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
  
      const token = 
        queryParams.get('token') || 
        hashParams.get('access_token') || 
        window.location.href.split("token=")[1]?.split("&")[0];
  
      const type = queryParams.get('type') || hashParams.get('type');
  
      console.log("Detected token:", token);
      console.log("Detected type:", type);
  
      if (token && type === 'recovery') {
        sessionStorage.setItem('recoveryToken', token);
        console.log("Recovery token stored and auth view set.");
  
        // ✅ Force React to update the state
        setTimeout(() => setView('auth'), 100);
      }
    }
  }, []);
  
  

  const handleAuthSuccess = (user) => {
    setUser(user);
    setView('home');
    // Clean up any stored recovery tokens
    sessionStorage.removeItem('recoveryToken');
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    // Clean up any stored tokens
    sessionStorage.removeItem('recoveryToken');
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <HomePage onGetStarted={() => setView(user ? 'register' : 'auth')} />;
      case 'auth':
        return <AuthForm onAuthSuccess={handleAuthSuccess} />;
      case 'register':
        return user ? <WalletTrackingPage user={user} /> : <AuthForm onAuthSuccess={handleAuthSuccess} />;
      case 'analyzer':
        return <TokenAnalyzerPage />;
      case 'pricing':
        return <PricingPage />;
      case 'about':
        return <AboutUsPage />;
      case 'stealth':
        return user ? <StealthWalletPage user={user} /> : <AuthForm onAuthSuccess={handleAuthSuccess} />;
      case 'dashboard':
        return user ? <UserDashboard user={user} /> : <AuthForm onAuthSuccess={handleAuthSuccess} />;
      case 'portfolio':
        return user ? <PortfolioViewer /> : <AuthForm onAuthSuccess={handleAuthSuccess} />;
      case 'refund-policy':
        return <RefundPolicyPage />;
      case 'privacy-policy':
        return <PrivacyPolicyPage />;
      case 'terms-of-service':
        return <TermsOfServicePage />;
      default:
        return <HomePage onGetStarted={() => setView(user ? 'register' : 'auth')} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-200">
        <Navbar
          user={user}
          currentView={view}
          onViewChange={setView}
          onLogout={handleLogout}
        />

        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-background text-primary',
          }}
        />

        <Footer onViewChange={setView} />
        
        {/* Large XRYPTT Text */}
        <div 
          style={{
            paddingTop: '0px',
            paddingBottom: '0px',
            marginBottom: '0px'
          }} 
          className="w-full bg-background py-20"
        >
          <h1 
            className="text-[20vw] font-black text-primary leading-none tracking-tighter text-center" 
            style={{ fontFamily: 'Arial Black, sans-serif' }}
          >
            XRYPTT
          </h1>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;