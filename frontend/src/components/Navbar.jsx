import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/xrypttt-removebg-preview.png'

const Navbar = ({ user, currentView, onViewChange, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MobileMenuItem = ({ label, onClick, isActive }) => (
    <button
      onClick={() => {
        onClick();
        setIsMobileMenuOpen(false);
      }}
      className={`w-full text-left px-4 py-2 text-sm ${
        isActive ? 'bg-primary text-background' : 'text-primary hover:bg-background-secondary'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav style={{position: 'sticky', top: 0, zIndex: 100}} className="bg-background shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onViewChange('home')}
              className="text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 flex items-center"
            >
              <img src={logo} alt="" style={{width:'50px',height:'40px'}} className="h-8 w-8 mr-2" />
              XRYPTT
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => onViewChange('about')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentView === 'about'
                  ? 'bg-primary text-background'
                  : 'text-primary hover:bg-background-secondary'
              }`}
            >
              About Us
            </button>

            {user ? (
              <>
                <div className="relative" ref={productsDropdownRef}>
                  <button
                    onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-background-secondary focus:outline-none"
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
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5">
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
                  }`}
                >
                  Pricing
                </button>
                <button
                  onClick={() => onViewChange('news')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'news'
                      ? 'bg-primary text-background'
                      : 'text-primary hover:bg-background-secondary'
                  }`}
                >
                  AI News
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-background-secondary focus:outline-none"
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
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-primary border-b">
                          {user.email}
                        </div>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onViewChange('dashboard');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
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
                  className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-background-secondary"
                >
                  Pricing
                </button>
                <button
                  onClick={() => onViewChange('auth')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-background bg-primary hover:bg-primary-hover"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div id="navbarMobile" className="flex md:hidden items-center">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-background-secondary focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="navbarMobile" className="md:hidden" ref={mobileMenuRef}>
          <div id="navbarMainDiv" className="px-2 pt-2 pb-3 space-y-1 bg-background shadow-lg">
            <MobileMenuItem
              label="About Us"
              onClick={() => onViewChange('about')}
              isActive={currentView === 'about'}
            />
            
            {user ? (
              <>
                <div className="px-4 py-2 text-sm font-medium text-primary">Products</div>
                <MobileMenuItem
                  label="Token Analyzer"
                  onClick={() => onViewChange('analyzer')}
                  isActive={currentView === 'analyzer'}
                />
                <MobileMenuItem
                  label="Portfolio Viewer"
                  onClick={() => onViewChange('portfolio')}
                  isActive={currentView === 'portfolio'}
                />
                <MobileMenuItem
                  label="StealthWallet"
                  onClick={() => onViewChange('stealth')}
                  isActive={currentView === 'stealth'}
                />
                <MobileMenuItem
                  label="Wallet Tracking"
                  onClick={() => onViewChange('register')}
                  isActive={currentView === 'register'}
                />
                <MobileMenuItem
                  label="Pricing"
                  onClick={() => onViewChange('pricing')}
                  isActive={currentView === 'pricing'}
                />
                <MobileMenuItem
                  label="AI News"
                  onClick={() => onViewChange('news')}
                  isActive={currentView === 'news'}
                />
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-4 py-2 text-sm text-primary">{user.email}</div>
                <MobileMenuItem
                  label="Dashboard"
                  onClick={() => onViewChange('dashboard')}
                  isActive={currentView === 'dashboard'}
                />
                <MobileMenuItem
                  label="Sign Out"
                  onClick={onLogout}
                  isActive={false}
                />
              </>
            ) : (
              <>
                <MobileMenuItem
                  label="Pricing"
                  onClick={() => onViewChange('pricing')}
                  isActive={currentView === 'pricing'}
                />
                <MobileMenuItem
                  label="Sign In"
                  onClick={() => onViewChange('auth')}
                  isActive={currentView === 'auth'}
                />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;