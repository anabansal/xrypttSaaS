import React from 'react';
import './index.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import image from '../assets/image.png';
import portfolio from '../assets/portfolio.svg';
import tokenAnalysis from '../assets/tokenAnalysis.svg';
import tracker from '../assets/tracker.svg';
import chainlink from '../assets/chainlink.webp';
import cnbc from '../assets/cnbc.png';
import deribit from '../assets/deribit.png';
import forbes from '../assets/forbes.png';
import gemini from '../assets/gemini.png';
import genesisVision from '../assets/genesisVision.png';
import ibm from '../assets/ibm.png';
import paycom from '../assets/paycom.jpg';
import walletconnect from '../assets/walletconnect.png';
import wired from '../assets/wired.png';
import kraken from '../assets/kraken.png';

const LogoSlider = () => {
  const logos = [
    { src: chainlink, alt: "WalletConnect" },
    { src: cnbc, alt: "Pay.com" },
    { src: deribit, alt: "0x" },
    { src: forbes, alt: "Genesis" },
    { src: gemini, alt: "Gemini" },
    { src: genesisVision, alt: "Deribit" },
    { src: ibm, alt: "Kraken" },
    { src: paycom, alt: "Chainlink" },
    { src: walletconnect, alt: "Forbes" },
    { src: wired, alt: "CNBC" },
    { src: kraken, alt: "Wired" },
  ];

  return (
    <div id="homepageLogoSlider" className="relative w-full overflow-hidden bg-background py-10" style={{ width: '90vw', marginLeft: '-5vw' }}>
      <div className="flex animate-scroll space-x-16">
        <div className="flex space-x-10 whitespace-nowrap">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ minWidth: "100px", textAlign: "center" }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 mx-auto"
              />
            </div>
          ))}
        </div>

        <div className="flex space-x-10 whitespace-nowrap">
          {logos.map((logo, index) => (
            <div
              key={`duplicate-${index}`}
              className="flex-shrink-0"
              style={{ minWidth: "100px", textAlign: "center" }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 mx-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ onGetStarted }) => {
  return (
    <div>
      <div className="text-center space-y-24">
        <div className="max-w-6xl mx-auto">
          <div id="homepageFlex" className="flex items-center justify-between">
            <div className="text-left max-w-2xl">
              <h1 id="homepageMainHeading" style={{ fontSize: '58px' }} className="text-5xl font-extrabold text-primary sm:text-6xl md:text-7xl leading-tight">
                The World's First All-in-One Ethereum Monitoring Solution.
              </h1>

              <p id="homepageParaText" style={{ fontSize: '28px' }} className="mt-6 text-xl text-primary/80 sm:text-2xl md:text-3xl leading-relaxed">
                Track wallets, analyze portfolios, and receive alerts for transactions – redefining Ethereum transparency.
              </p>

              <div id="homepageGetStarted" className="mt-10">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 text-lg font-medium text-background bg-primary hover:bg-primary-hover transition-colors duration-200 rounded-lg shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              </div>
            </div>

            <div id="homepageAnimation" style={{ marginTop: '-40px', height: '460px', marginLeft: '30px' }} className="w-[500px] h-[500px]">
              <DotLottieReact
                src="https://lottie.host/be3d9bee-4cb7-489a-8cfd-e540b3e07807/7Zd8rmSOND.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>

        <LogoSlider />

        <div id="homepageHero2Image" style={{ borderRadius: '20px', position: 'relative', width: '89vw' }}>
          <img 
            style={{ 
              borderRadius: '20px',
              position: 'absolute',
              height: '300px',
              width: '100%',
              top: '-40px',
              overflow: 'visible',
              marginLeft: '-5vw',
              zIndex: 1
            }}
            src={image}
            alt=""
          />
          <div 
            id="homepageHero2TextBox"
            style={{ 
              border: '1px solid rgba(132, 132, 132, 0.55)',
              borderRadius: '20px',
              position: 'relative',
              zIndex: 2,
              width: '80vw',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
            className="bg-background-secondary py-16"
          >
            <div id="homepageHero2" className="max-w-4xl mx-auto">
              <h2 id="homepageHero2Heading" style={{ fontSize: '40px' }} className="text-3xl font-bold text-primary sm:text-4xl md:text-5xl leading-tight">
                Stay Ahead of the Game – Monitor Ethereum Wallets and Tokens Seamlessly.
              </h2>
            </div>
          </div>
        </div>

        <div id="homepageUsecase" className="max-w-6xl mx-auto px-4 space-y-8">
          <div id="homepageUsecaseBox" className="flex items-center justify-between p-8 border border-primary/10 rounded-xl">
            <div id="homepageUsecaseContent" className="w-1/2 pr-8">
              <h3 id="homepageUsecaseHeading" className="text-2xl font-bold text-primary mb-4">Wallet Tracking</h3>
              <p id="homepageUsecasePara" className="text-lg text-primary/70">
                Track Whale Wallets and Copy Their Moves. Get real-time notifications when whales make transactions. Copy their moves and make smarter investment decisions.
              </p>
            </div>
            <div id="homepageUsecaseImage" className="w-1/2">
              <img src={tracker} style={{ width: '300px', height: '300px', marginLeft: '100px' }} alt="Tracker" />
            </div>
          </div>

          <div id="homepageUsecaseBox" className="flex items-center justify-between p-8 border border-primary/10 rounded-xl">
            <div id="homepageUsecaseImage" className="w-1/2">
              <img src={tokenAnalysis} style={{ width: '300px', height: '300px', marginLeft: '20px' }} alt="Token Analysis" />
            </div>
            <div  id="homepageUsecaseContent2" className="w-1/2 pl-8">
              <h3 id="homepageUsecaseHeading" className="text-2xl font-bold text-primary mb-4">Identify Short-Term Whales</h3>
              <p id="homepageUsecasePara" className="text-lg text-primary/70">
                Track recent transactions to find token holders with the largest amounts. Spot potential short-term whales and make timely investment moves.
              </p>
            </div>
          </div>

          <div id="homepageUsecaseBox" className="flex items-center justify-between p-8 border border-primary/10 rounded-xl">
            <div id="homepageUsecaseContent" className="w-1/2 pr-8">
              <h3 id="homepageUsecaseHeading" className="text-2xl font-bold text-primary mb-4">View Wallet Portfolio</h3>
              <p id="homepageUsecasePara" className="text-lg text-primary/70">
                Get a detailed view of any wallet's portfolio. Analyze assets, track holdings, and understand the investment strategy behind a wallet address.
              </p>
            </div>
            <div id="homepageUsecaseImage" className="w-1/2">
              <img src={portfolio} style={{ width: '300px', height: '300px', marginLeft: '100px' }} alt="Portfolio" />
            </div>
          </div>
        </div>

        <div 
          id="homepageGreenSection"
          style={{
            backgroundColor: '#01E255',
            width: '90vw',
            marginLeft: '-5vw',
            borderRadius: '20px',
            height: '450px'
          }}
          className="bg-green-500 py-20 w-full"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div id="homepageGreenFlex" className="text-left space-y-8">
              <h2 
              id="homepageGreenSectionHeading"
                style={{
                  width: '45vw',
                  lineHeight: '60px',
                  textAlign: 'left',
                  marginLeft: '3vw',
                  fontWeight: '600'
                }}
                className="text-4xl md:text-5xl font-bold text-center text-black"
              >
                Transform Your Crypto Compliance Today!
              </h2>
              <p 
                id="homepageGreenSectionPara"
                style={{
                  marginLeft: '3vw',
                  fontFamily: 'Bebas Neue',
                  fontWeight: '400',
                  fontSize: '30px'
                }}
                className="text-xl md:text-2xl text-black"
              >
                Simplify your digital asset compliance with Xryptt's cutting-edge solutions!
              </p>

              <div id="homepageGreenSectionButton" className="mt-8">
                <button 
                  style={{ borderRadius: '100px', marginLeft: '3vw' }}
                  className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-900 transition-colors duration-200"
                >
                  Request a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;