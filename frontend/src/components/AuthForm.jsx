import React, { useState, useEffect } from 'react';
import { initiateSignUp, completeSignUp, signIn, initiatePasswordReset, completePasswordReset } from '../services/authService';
import { useToast } from '../hooks/useToast';
import { validateEmail } from '../utils/validation';

const AuthForm = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const { showSuccess, showError } = useToast();

  // Enhanced token detection on component mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    // Check for token in multiple locations
    const token = 
      hashParams.get('access_token') || 
      queryParams.get('token') ||
      sessionStorage.getItem('recoveryToken') ||
      window.location.hash.split('access_token=')[1]?.split('&')[0];

    // Check if this is a recovery flow
    // const type = queryParams.get('type') || hashParams.get('type');

    if (token) {
      setResetToken(token);
      setMode('reset');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Store token temporarily if needed
      sessionStorage.setItem('recoveryToken', token);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateEmail(email) && mode !== 'reset') {
      showError('Please enter a valid email address');
      return;
    }
  
    try {
      switch (mode) {
        case 'signin':
          if (!password || password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
          }
          const { user } = await signIn(email, password);
          showSuccess('Successfully signed in!');
          onAuthSuccess(user);
          break;
  
        case 'signup':
          if (!password || password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
          }
          await initiateSignUp(email, password);
          showSuccess('Verification code sent to your email');
          setMode('verify');
          break;

        case 'verify':
          if (!otp) {
            showError('Please enter the verification code');
            return;
          }
          const signUpData = await completeSignUp(email, otp);
          showSuccess('Email verified and account created!');
          onAuthSuccess(signUpData.user);
          break;
  
        case 'forgot':
          await initiatePasswordReset(email);
          showSuccess('Password reset instructions sent to your email');
          break;
  
        case 'reset':
          if (!newPassword || newPassword.length < 6) {
            showError('New password must be at least 6 characters');
            return;
          }
          if (!resetToken) {
            showError('Invalid reset token. Please use the link from your email.');
            return;
          }
          try {
            await completePasswordReset( newPassword);
            showSuccess('Password reset successful!');
            setMode('signin');
            // Clear the recovery token from storage
            sessionStorage.removeItem('recoveryToken');
            // Clear the reset token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            showError(error.message || 'Failed to reset password');
          }
          break;
      }
    } catch (error) {
      showError(error.message);
    }
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    setResetToken('');
    // Clear any stored tokens
    sessionStorage.removeItem('recoveryToken');
    // Clear the reset token from URL when going back to sign in
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[600px] rounded-lg overflow-hidden shadow-2xl">
      {/* Form Section - Moved to top on mobile */}
      <div className="w-full md:w-1/2 bg-background p-6 md:p-12 order-1 md:order-2">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-primary mb-8">
            {mode === 'signin' ? 'Sign In' : 
             mode === 'signup' ? 'Create Account' :
             mode === 'verify' ? 'Verify Email' :
             mode === 'forgot' ? 'Reset Password' :
             'Set New Password'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields remain the same */}
            {(mode !== 'reset') && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={mode !== 'reset'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {['signin', 'signup'].includes(mode) && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {mode === 'verify' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {mode === 'reset' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 border border-transparent rounded-md text-background bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {mode === 'signin' ? 'Sign In' :
               mode === 'signup' ? 'Sign Up' :
               mode === 'verify' ? 'Verify Email' :
               mode === 'forgot' ? 'Send Reset Instructions' :
               'Reset Password'}
            </button>

            <div className="flex justify-center space-x-4 text-sm">
              {mode === 'signin' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:text-primary-hover"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-primary hover:text-primary-hover"
                  >
                    Forgot Password?
                  </button>
                </>
              )}
              {['signup', 'verify', 'forgot', 'reset'].includes(mode) && (
                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="text-primary hover:text-primary-hover"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Welcome Section - Moved to bottom on mobile */}
      <div className="w-full md:w-1/2 bg-primary p-6 md:p-12 order-2 md:order-1">
        {mode === 'signup' ? (
          <>
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-6">
              Your Demo Will Include:
            </h2>
            <ul className="space-y-4 text-background">
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>A complete walkthrough – Learn how to track Ethereum wallets, analyze token holders, and monitor whale portfolios.</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Q&A session – Get direct answers from our experts on how to maximize insights from wallet tracking and token analytics.</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Interactive discussion – Tell us about your needs, and we'll show you how our platform can help you stay ahead in the crypto market.</span>
              </li>
            </ul>
          </>
        ) : (
          <>
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-6">
              Welcome to Wallet Monitor
            </h2>
            <p className="text-background text-lg mb-8">
              Track Ethereum wallet transactions, analyze tokens, and monitor your digital assets in real-time.
            </p>
            <ul className="space-y-4 text-background">
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time transaction monitoring</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Token analysis and insights</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Instant notifications</span>
              </li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;