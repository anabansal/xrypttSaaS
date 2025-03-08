import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{paddingBottom:'0px'}} className="bg-background py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">CONTACT</h3>
            <address className="not-italic text-gray-600 space-y-2">
              {/* <p>3rd Floor 86-90</p>
              <p>Paul Street,</p>
              <p>London, England,</p>
              <p>EC2A 4NE</p> */}
              <div className="h-4" />
              <p>xryptt@gmail.com</p>
              <div className="h-4" />
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-primary">X (Twitter)</a>
                <a href="#" className="block text-gray-600 hover:text-primary">LinkedIn</a>
              </div>
            </address>
          </div>

          {/* Products Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">PRODUCTS</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Wallet Monitor</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Token Analyzer</a>
              </li>
            </ul>
          </div>

          {/* Use Cases Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">USE CASES</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Launch crypto products, fast</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Scale operations & tech with ease</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Control multiple wallets & custodians</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Improve Capital Efficiency</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Intelligent Risk Management</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Know your data</a>
              </li>
            </ul>
          </div>

          {/* Developer Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">DEVELOPER</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Docs</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">API Reference</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Join Wallet Monitor marketplace</a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/refund-policy" className="text-gray-600 hover:text-primary">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-600 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="mt-8">
              <p className="text-gray-600">© 2024 Wallet Monitor Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;