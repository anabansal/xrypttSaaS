import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/xrypttt-removebg-preview.png';

const Navbar = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const MobileMenuItem = ({ to, label, onClick, isActive }) => (
    <Link
      to={to}
      onClick={() => {
        if (onClick) onClick();
        setIsMobileMenuOpen(false);
      }}
      className={`block w-full text-left px-4 py-2 text-sm ${
        isActive ? 'bg-primary text-background' : 'text-primary hover:bg-background-secondary'
      }`}
    >
      {label}
    </Link>
  );

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <nav style={{position: 'sticky', top: 0, zIndex: 100}} className="bg-background shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 flex items-center"
            >
              <img src={logo} alt="" style={{width:'50px',height:'40px'}} className="h-8 w-8 mr-2" />
              XRYPTT
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isCurrentPath('/about')
                  ? 'bg-primary text-background'
                  : 'text-primary hover:bg-background-secondary'
              }`}
            >
              About Us
            </Link>

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
                        <Link
                          to="/analyzer"
                          onClick={() => setIsProductsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Token Analyzer
                        </Link>
                        <Link
                          to="/portfolio"
                          onClick={() => setIsProductsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Portfolio Viewer
                        </Link>
                        <Link
                          to="/stealth"
                          onClick={() => setIsProductsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          StealthWallet
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsProductsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Wallet Tracking
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/pricing"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isCurrentPath('/pricing')
                      ? 'bg-primary text-background'
                      : 'text-primary hover:bg-background-secondary'
                  }`}
                >
                  Pricing
                </Link>
                <Link
                  to="/news"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isCurrentPath('/news')
                      ? 'bg-primary text-background'
                      : 'text-primary hover:bg-background-secondary'
                  }`}
                >
                  AI News
                </Link>
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
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onLogout();
                            navigate('/');
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
                <Link
                  to="/pricing"
                  className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-background-secondary"
                >
                  Pricing
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-md text-sm font-medium text-background bg-primary hover:bg-primary-hover"
                >
                  Sign In
                </Link>
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
              to="/about"
              label="About Us"
              isActive={isCurrentPath('/about')}
            />
            
            {user ? (
              <>
                <div className="px-4 py-2 text-sm font-medium text-primary">Products</div>
                <MobileMenuItem
                  to="/analyzer"
                  label="Token Analyzer"
                  isActive={isCurrentPath('/analyzer')}
                />
                <MobileMenuItem
                  to="/portfolio"
                  label="Portfolio Viewer"
                  isActive={isCurrentPath('/portfolio')}
                />
                <MobileMenuItem
                  to="/stealth"
                  label="StealthWallet"
                  isActive={isCurrentPath('/stealth')}
                />
                <MobileMenuItem
                  to="/register"
                  label="Wallet Tracking"
                  isActive={isCurrentPath('/register')}
                />
                <MobileMenuItem
                  to="/pricing"
                  label="Pricing"
                  isActive={isCurrentPath('/pricing')}
                />
                <MobileMenuItem
                  to="/news"
                  label="AI News"
                  isActive={isCurrentPath('/news')}
                />
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-4 py-2 text-sm text-primary">{user.email}</div>
                <MobileMenuItem
                  to="/dashboard"
                  label="Dashboard"
                  isActive={isCurrentPath('/dashboard')}
                />
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                    navigate('/');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-background-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileMenuItem
                  to="/pricing"
                  label="Pricing"
                  isActive={isCurrentPath('/pricing')}
                />
                <MobileMenuItem
                  to="/auth"
                  label="Sign In"
                  isActive={isCurrentPath('/auth')}
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