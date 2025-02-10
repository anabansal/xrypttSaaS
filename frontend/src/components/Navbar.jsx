import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/xrypttt-removebg-preview.png'

const Navbar = ({ user, currentView, onViewChange, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={{position:'sticky', top:0, zIndex:100}} className="bg-background shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onViewChange('home')}
              className="text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 flex items-center"
            >
              <img src={logo} alt="" style={{width:'50px',height:'40px'}} className="h-8 w-8 mr-2" viewBox="0 0 510 422" fill="currentColor" />
              XRYPTT
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => onViewChange('about')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentView === 'about'
                  ? 'bg-primary text-background'
                  : 'text-primary hover:bg-background-secondary'
              } transition-colors duration-200`}
            >
              About Us
            </button>

            {user ? (
              <>
                {/* Products Dropdown */}
                <div className="relative" ref={productsDropdownRef}>
                  <button
                    onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-background-secondary focus:outline-none transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <span>Products</span>
                      <svg
                        className={`ml-2 h-4 w-4 transition-transform ${
                          isProductsDropdownOpen ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {isProductsDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 transition-colors duration-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProductsDropdownOpen(false);
                            onViewChange('analyzer');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Token Analyzer
                        </button>
                        <button
                          onClick={() => {
                            setIsProductsDropdownOpen(false);
                            onViewChange('portfolio');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Portfolio Viewer
                        </button>
                        <button
                          onClick={() => {
                            setIsProductsDropdownOpen(false);
                            onViewChange('stealth');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          StealthWallet
                        </button>
                        <button
                          onClick={() => {
                            setIsProductsDropdownOpen(false);
                            onViewChange('register');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Wallet Tracking
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onViewChange('pricing')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'pricing'
                      ? 'bg-primary text-background'
                      : 'text-primary hover:bg-background-secondary'
                  } transition-colors duration-200`}
                >
                  Pricing
                </button>
                <button
                  onClick={() => onViewChange('news')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'news'
                      ? 'bg-primary text-background'
                      : 'text-primary hover:bg-background-secondary'
                  } transition-colors duration-200`}
                >
                  AI News
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-background-secondary focus:outline-none transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <span>Account</span>
                      <svg
                        className={`ml-2 h-4 w-4 transition-transform ${
                          isDropdownOpen ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 transition-colors duration-200">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-primary border-b">
                          {user.email}
                        </div>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onViewChange('dashboard');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary transition-colors duration-200"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onViewChange('pricing')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-background-secondary transition-colors duration-200"
                >
                  Pricing
                </button>
                <button
                  onClick={() => onViewChange('auth')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-background bg-primary hover:bg-primary-hover transition-colors duration-200"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;