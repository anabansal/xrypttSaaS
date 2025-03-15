import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import Success from './components/PaymentSuccessPage';

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle auth redirects on first load
 // In your App.js file, modify the useEffect hook that handles auth redirects

useEffect(() => {
  if (location.pathname.startsWith('/authorisation')) {
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const queryParams = new URLSearchParams(location.search);

    const token =
      queryParams.get('token') ||
      hashParams.get('access_token') ||
      (location.search.includes('token=') 
        ? location.search.split('token=')[1]?.split('&')[0]
        : null);

    const type = queryParams.get('type') || hashParams.get('type');

    console.log("Detected token:", token);
    console.log("Detected type:", type);

    if (token && type === 'recovery') {
      sessionStorage.setItem('recoveryToken', token);
      console.log("Recovery token stored.");
    }
    
    // Add this to redirect to auth form
    navigate('/auth', { state: { from: location.pathname } });
  }
}, [location, navigate]); // Make sure to include navigate in dependencies

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    // Navigate to the attempted protected route if it exists, otherwise go home
    const intendedPath = location.state?.from || '/';
    navigate(intendedPath);
    sessionStorage.removeItem('recoveryToken');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    sessionStorage.removeItem('recoveryToken');
  };

  const handleGetStarted = () => {
    navigate(user ? '/register' : '/auth');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-200">
        <Navbar
          user={user}
          onLogout={handleLogout}
        />

        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage onGetStarted={handleGetStarted} />} />
              <Route path="/auth" element={<AuthForm onAuthSuccess={handleAuthSuccess} />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/success" element={<Success />} />

              {/* Protected Routes */}
              <Route
                path="/register"
                element={
                  <ProtectedRoute user={user}>
                    <WalletTrackingPage user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyzer"
                element={
                  <ProtectedRoute user={user}>
                    <TokenAnalyzerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stealth"
                element={
                  <ProtectedRoute user={user}>
                    <StealthWalletPage user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute user={user}>
                    <UserDashboard user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute user={user}>
                    <PortfolioViewer />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route for non-existent paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-background text-primary',
          }}
        />

        <Footer />
        
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