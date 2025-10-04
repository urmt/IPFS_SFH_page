
/**
 * Sentient-Field Braintrust - Professional Scientific Website
 * Home page featuring SFH research with scientific credibility and visual impact
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Download, Play, BookOpen, Brain, Atom, Zap, Globe, Users, ShoppingCart, ExternalLink, Heart, Copy, Wallet, Github, Code, Star, GitFork, Calendar, Menu, X } from 'lucide-react';
import PayPalPurchaseModal from '../components/PayPalPurchaseModal';
import QRCode from 'qrcode';

// Enhanced PayPal Button Component with Email Collection
const PayPalButton = ({ containerId, buttonId, title, description, price, requireEmail = false }: {
  containerId: string;
  buttonId: string;
  title: string;
  description: string;
  price?: string;
  requireEmail?: boolean;
}) => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [showPayPal, setShowPayPal] = useState(!requireEmail);
  
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(email));
    } else {
      setEmailValid(false);
    }
  }, [email]);

  useEffect(() => {
    if (showPayPal && window.paypal && document.getElementById(containerId)) {
      window.paypal.HostedButtons({
        hostedButtonId: buttonId,
      }).render(`#${containerId}`);
    }
  }, [containerId, buttonId, showPayPal]);
  
  const handleEmailSubmit = () => {
    if (emailValid) {
      setShowPayPal(true);
      // Store email for later use in delivery
      localStorage.setItem(`purchase-email-${containerId}`, email);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold mb-2 text-slate-900">{title}</h3>
        <p className="text-slate-700 mb-4">{description}</p>
        {price && (
          <div className="text-2xl font-bold text-purple-600 mb-4">{price}</div>
        )}
      </div>
      
      {requireEmail && !showPayPal && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            📧 Email for PDF delivery:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
            />
            <button
              onClick={handleEmailSubmit}
              disabled={!emailValid}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✓
            </button>
          </div>
          {email && !emailValid && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
          )}
        </div>
      )}
      
      {showPayPal && (
        <>
          {requireEmail && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              ✅ PDF will be delivered to: <strong>{email}</strong>
            </div>
          )}
          <div id={containerId} className="paypal-button-wrapper">
            {/* PayPal button will be inserted here */}
          </div>
        </>
      )}
    </div>
  );
};

// Crypto Payment Component with QR Codes
const CryptoPayment = ({ type, title, description }: {
  type: 'donation' | 'purchase';
  title: string;
  description: string;
}) => {
  const [qrCodes, setQrCodes] = useState<{[key: string]: string}>({});
  const [copied, setCopied] = useState('');
  const [email, setEmail] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const walletAddress = '0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79';
  const price = type === 'purchase' ? '$19.99 equivalent' : 'Any amount';
  
  const cryptoOptions = [
    {
      name: 'Ethereum (ETH)',
      symbol: 'ETH',
      address: walletAddress,
      network: 'Ethereum Mainnet',
      color: 'text-blue-400'
    },
    {
      name: 'Chainlink (LINK)',
      symbol: 'LINK', 
      address: walletAddress,
      network: 'Ethereum Mainnet',
      color: 'text-blue-500'
    }
  ];
  
  useEffect(() => {
    const generateQRCodes = async () => {
      const newQrCodes: {[key: string]: string} = {};
      for (const crypto of cryptoOptions) {
        try {
          const qrDataUrl = await QRCode.toDataURL(crypto.address, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          newQrCodes[crypto.symbol] = qrDataUrl;
        } catch (error) {
          console.error(`Failed to generate QR code for ${crypto.symbol}:`, error);
        }
      }
      setQrCodes(newQrCodes);
    };
    
    generateQRCodes();
  }, []);
  
  const copyToClipboard = (address: string, symbol: string) => {
    navigator.clipboard.writeText(address);
    setCopied(symbol);
    setTimeout(() => setCopied(''), 2000);
  };
  
  const handlePaymentSubmission = async () => {
    if (!email || (!transactionHash && type === 'purchase')) {
      alert('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Send payment verification to backend service
      const response = await fetch('http://localhost:3001/verify-crypto-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionHash,
          walletAddress,
          type,
          email
        })
      });
      
      if (response.ok) {
        setSubmitted(true);
        alert(type === 'purchase' 
          ? '✅ Payment submitted! You will receive your PDF via email within a few minutes.' 
          : '❤️ Thank you for your donation! A confirmation email will be sent shortly.'
        );
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert('❌ There was an error processing your payment. Please contact thesfh@proton.me with your transaction details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 hover:border-purple-400/30 transition-all">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <Wallet className="h-6 w-6 text-purple-400 mr-2" />
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-gray-300 mb-2">{description}</p>
        {type === 'purchase' && (
          <div className="text-2xl font-bold text-purple-400 mb-4">{price}</div>
        )}
      </div>
      
      <div className="space-y-4">
        {cryptoOptions.map((crypto) => (
          <div key={crypto.symbol} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${crypto.color}`}>{crypto.name}</span>
                <span className="text-xs text-gray-400 px-2 py-1 bg-slate-700 rounded">
                  {crypto.network}
                </span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* QR Code */}
              <div className="flex flex-col items-center">
                {qrCodes[crypto.symbol] ? (
                  <div className="bg-white p-2 rounded-lg">
                    <img 
                      src={qrCodes[crypto.symbol]} 
                      alt={`${crypto.name} QR Code`}
                      className="w-32 h-32"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Loading QR...</span>
                  </div>
                )}
                <span className="text-xs text-gray-400 mt-2 text-center">Scan with wallet app</span>
              </div>
              
              {/* Address */}
              <div className="flex flex-col justify-center">
                <label className="text-xs text-gray-400 mb-2">Wallet Address:</label>
                <code className="text-xs bg-slate-800 p-2 rounded text-gray-300 break-all mb-2">
                  {crypto.address}
                </code>
                <button
                  onClick={() => copyToClipboard(crypto.address, crypto.symbol)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-sm"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied === crypto.symbol ? 'Copied!' : 'Copy Address'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!submitted && (
        <>
          {/* Email Collection Form */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <h4 className="text-sm font-semibold mb-3 text-purple-300">
              {type === 'purchase' ? '📧 Email for PDF Delivery:' : '📧 Email for Confirmation:'}
            </h4>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm"
              required
            />
          </div>
          
          {type === 'purchase' && (
            <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <h4 className="text-sm font-semibold mb-3 text-blue-300">🔗 Transaction Hash:</h4>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="0x1234567890abcdef..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-2">Enter your transaction hash after sending payment</p>
            </div>
          )}
          
          <button
            onClick={handlePaymentSubmission}
            disabled={isSubmitting || !email || (type === 'purchase' && !transactionHash)}
            className={`w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
              isSubmitting || !email || (type === 'purchase' && !transactionHash)
                ? 'bg-gray-600 cursor-not-allowed'
                : type === 'purchase'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                {type === 'purchase' ? (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Confirm Purchase & Get PDF</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    <span>Confirm Donation</span>
                  </>
                )}
              </>
            )}
          </button>
        </>
      )}
      
      {submitted && (
        <div className="mt-6 p-4 bg-green-900/30 border border-green-400/30 rounded-lg text-center">
          <div className="text-green-400 mb-2">
            {type === 'purchase' ? '✅ Purchase Confirmed!' : '❤️ Donation Received!'}
          </div>
          <p className="text-sm text-gray-300">
            {type === 'purchase' 
              ? 'Your PDF will be delivered to your email within a few minutes.'
              : 'Thank you for supporting our consciousness research! A confirmation email has been sent.'}
          </p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
        <p>🔒 Scan QR or send to wallet address above</p>
        <p>⚡ Transactions confirmed on blockchain</p>
        {!submitted && (
          <p>📧 Complete the form below after sending payment</p>
        )}
        {type === 'purchase' && (
          <p>📄 PDF delivery is fully automated</p>
        )}
      </div>
    </div>
  );
};

// Book data
const bookData = {
  title: "The Sentience-Field Hypothesis: Consciousness as the Fabric of Reality",
  author: "Mark Rowe Traver",
  price: "$19.99",
  description: "Pre-Published Latest Updates version - A groundbreaking exploration of consciousness as the fundamental substrate of reality, complete with mathematical frameworks, experimental protocols, and philosophical implications. This is the latest pre-publication version with the most current research updates.",
  features: [
    "Latest pre-publication updates and research",
    "Complete mathematical formalization of the SFH",
    "Falsifiable experimental protocols",
    "Philosophical implications and frameworks",
    "Interdisciplinary research methodologies",
    "Digital PDF format for immediate secure delivery",
    "Automatic email delivery after payment confirmation"
  ],
  ingramSparkAccount: "9798513"
};

// Mock data - replace with actual content
const researchPapers = [
  {
    title: "Field Phenomenology: Operationalizing the Sentience-Field Hypothesis",
    author: "Mark Rowe Traver",
    date: "July 2026",
    description: "Integrating phenomenological tools from QRI to map consciousness as reality's fabric",
    downloadUrl: "#",
    readUrl: "#"
  },
  {
    title: "The Sentience-Field Hypothesis: Consciousness as the Fabric of Reality",
    author: "Mark Rowe Traver", 
    date: "July 2025",
    description: "Mathematical foundations and experimental protocols for SFH",
    downloadUrl: "#",
    readUrl: "#"
  }
];

// Enhanced Video Player Component with IPFS support
const VideoPlayer = ({ video, onClose }: { video: any; onClose: () => void }) => {
  if (!video) return null;
  
  const getVideoUrl = () => {
    if (video.youtubeId && video.youtubeId !== 'demo') {
      return `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
    } else if (video.ipfsHash) {
      // Use the same gateway as the current page
      const currentHost = window.location.host;
      if (currentHost.includes('ipfs.io')) {
        return `https://ipfs.io/ipfs/${video.ipfsHash}`;
      } else if (currentHost.includes('gateway.pinata.cloud')) {
        return `https://gateway.pinata.cloud/ipfs/${video.ipfsHash}`;
      } else if (currentHost.includes('cloudflare-ipfs.com')) {
        return `https://cloudflare-ipfs.com/ipfs/${video.ipfsHash}`;
      } else if (currentHost.includes('dweb.link')) {
        return `https://dweb.link/ipfs/${video.ipfsHash}`;
      } else if (currentHost.includes('localhost')) {
        return `http://localhost:8080/ipfs/${video.ipfsHash}`;
      } else {
        // Default to ipfs.io if we can't detect the gateway
        return `https://ipfs.io/ipfs/${video.ipfsHash}`;
      }
    }
    return null;
  };
  
  const videoUrl = getVideoUrl();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl z-10"
        >
          ✕
        </button>
        
        <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
          {videoUrl ? (
            video.type === 'youtube' ? (
              <iframe
                className="w-full h-full"
                src={videoUrl}
                title={video.title}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full"
                controls
                autoPlay
                src={videoUrl}
                title={video.title}
              >
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <p className="text-xl mb-4">Video Not Available</p>
                <p className="text-gray-300">Unable to load video content</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-white text-center">
          <h3 className="text-lg font-semibold">{video.title}</h3>
          <p className="text-gray-300 text-sm mt-1">{video.description}</p>
          <p className="text-gray-400 text-xs mt-1">{video.duration}</p>
        </div>
      </div>
    </div>
  );
};

// GitHub repositories data
const githubRepos = [
  {
    name: "SwarmLab 2.0",
    description: "Updated improved swarm lab experiment using WeaveLang",
    language: "WeaveLang",
    framework: "Custom SFH Framework",
    stars: 0,
    forks: 0,
    updated: "2024-10-04",
    status: "active",
    githubUrl: "https://github.com/urmt/SwarmLab2.0",
    demoUrl: null,
    docsUrl: null
  },
  {
    name: "SFH Python Code",
    description: "Random Universe Examination - Python implementations of SFH concepts",
    language: "Python",
    framework: "NumPy, SciPy, Custom Modules",
    stars: 0,
    forks: 0,
    updated: "2024-10-04",
    status: "active",
    githubUrl: "https://github.com/urmt/SFH_Python_CODE",
    demoUrl: null,
    docsUrl: null
  }
];

// SFH Videos data with actual IPFS hashes
const videos = [
  {
    title: "SFH Introduction",
    description: "Overview of the Sentience-Field Hypothesis core concepts",
    thumbnail: "https://pub-cdn.sider.ai/u/U0NWHZY739J/web-coder/68d58c1ab54d8be52a84fb1d/resource/5b03b993-4583-40b2-a7fa-613cc2bca441.jpg",
    ipfsHash: "QmRG8T5W4b5f1WqKYmUSxUiti1W53os8LgLhnhFscqjcnU",
    duration: "~15 min",
    type: "ipfs"
  },
  {
    title: "Interaction: The Source of Sentience", 
    description: "How interactions give rise to consciousness in the SFH framework",
    thumbnail: "https://pub-cdn.sider.ai/u/U0NWHZY739J/web-coder/68d58c1ab54d8be52a84fb1d/resource/dffb60ea-616b-4a52-8342-87d89bf08969.jpg",
    ipfsHash: "QmeRGeNS1HH2PUaK383QWdM94DXTxDHAyxGe1WwjU5EANZ",
    duration: "~12 min",
    type: "ipfs"
  },
  {
    title: "SFH Cosmology",
    description: "Cosmological implications of the Sentience-Field Hypothesis",
    thumbnail: "https://pub-cdn.sider.ai/u/U0NWHZY739J/web-coder/68d58c1ab54d8be52a84fb1d/resource/5b03b993-4583-40b2-a7fa-613cc2bca441.jpg",
    ipfsHash: "QmbCj77voq4eCc61dEkdKUnRstHXNaRF19WE7eEEzEYLu6",
    duration: "~18 min", 
    type: "ipfs"
  },
  {
    title: "SFH Ecology",
    description: "Ecological perspectives through the SFH lens",
    thumbnail: "https://pub-cdn.sider.ai/u/U0NWHZY739J/web-coder/68d58c1ab54d8be52a84fb1d/resource/dffb60ea-616b-4a52-8342-87d89bf08969.jpg",
    ipfsHash: "QmVvsjLueyJKEoLPoQKGBwffkUGG2KQBZi4jBSjYccHerz",
    duration: "~25 min",
    type: "ipfs"
  },
  {
    title: "SFH and Artificial Intelligence",
    description: "AI implications within the Sentience-Field framework",
    thumbnail: "https://pub-cdn.sider.ai/u/U0NWHZY739J/web-coder/68d58c1ab54d8be52a84fb1d/resource/5b03b993-4583-40b2-a7fa-613cc2bca441.jpg",
    ipfsHash: "QmdViTHDUzpjDkPF19HcfLaz2RufEbUFxWCZJ9JWqyj2pd", 
    duration: "~20 min",
    type: "ipfs"
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  const [selectedPayPalProduct, setSelectedPayPalProduct] = useState<{title: string; description: string; price: string; buttonId: string} | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Smooth scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-md py-2 shadow-lg border-b border-slate-700' : 'bg-slate-900/90 backdrop-blur-sm py-4 shadow-sm'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Atom className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sentient-Field Braintrust
            </span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            {['Overview', 'Research', 'Books', 'Media', 'Publications', 'Contact'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-gray-300 hover:text-purple-400 font-medium transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-purple-400 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {['Overview', 'Research', 'Books', 'Media', 'Publications', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item.toLowerCase());
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-4 text-gray-300 hover:text-purple-400 hover:bg-slate-800/50 rounded-lg font-medium transition-all"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="overview" className="min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 mb-8 px-6 py-3 rounded-full bg-purple-900/30 border border-purple-400/30 shadow-sm">
              <Zap className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Groundbreaking Research in Consciousness Studies</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Consciousness as the{' '}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Fabric of Reality
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
              The Sentience-Field Hypothesis proposes a radical reimagining of reality: 
              consciousness is not an emergent property but the fundamental substrate 
              from which all physical phenomena are woven.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => scrollToSection('books')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <BookOpen className="h-5 w-5" />
                <span>Get the Book</span>
              </button>
              <button
                onClick={() => setSelectedVideo(videos[0])}
                className="border-2 border-purple-400 text-purple-400 px-8 py-4 rounded-lg font-semibold hover:bg-purple-900/20 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Play className="h-5 w-5" />
                <span>Watch Introduction</span>
              </button>
              <a
                href="https://wt3000.substack.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-900/20 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Read on Substack</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Book Overview Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Book Overview</h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                The Sentience-Field Hypothesis: Consciousness as the Fabric of Reality presents a comprehensive framework for understanding consciousness as the fundamental substrate of reality. This more than 200 page work combines rigorous mathematical formalism with accessible explanations, making complex ideas available to both specialists and general readers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Core Contributions */}
              <div className="bg-slate-900/50 p-6 rounded-xl border border-purple-400/30">
                <h3 className="text-xl font-bold mb-4 text-purple-300">Core Contributions</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm"><strong>Mathematical Foundation:</strong> Develops a rigorous framework using Hardy-Ramanujan partition theory, principal fiber bundles, and stochastic processes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm"><strong>Experimental Predictions:</strong> Provides testable hypotheses across quantum mechanics, neuroscience, and cosmology</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm"><strong>Computational Models:</strong> Includes complete source code for simulations and WeaveLang programming language</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm"><strong>Philosophical Integration:</strong> Bridges the gap between subjective experience and interpreted objective reality</span>
                  </li>
                </ul>
              </div>
              
              {/* Book Structure */}
              <div className="bg-slate-900/50 p-6 rounded-xl border border-blue-400/30">
                <h3 className="text-xl font-bold mb-4 text-blue-300">Book Structure</h3>
                <p className="text-gray-300 text-sm mb-3">
                  The book is organized into <strong>35 comprehensive chapters</strong> covering theoretical foundations, mathematical formalisms, experimental protocols, and practical applications.
                </p>
                <p className="text-gray-300 text-sm">
                  Each chapter builds upon previous concepts while remaining accessible to readers with varying backgrounds.
                </p>
              </div>
              
              {/* Appendix Materials */}
              <div className="bg-slate-900/50 p-6 rounded-xl border border-cyan-400/30">
                <h3 className="text-xl font-bold mb-4 text-cyan-300">Appendix Materials</h3>
                <p className="text-gray-300 text-sm mb-3">
                  <strong>Nine detailed appendices</strong> provide additional mathematical rigor, experimental protocols, computational implementations, and extended discussions.
                </p>
                <p className="text-gray-300 text-sm">
                  Appendixes A through I cover topics ranging from WeaveLang programming language specifications to cosmological implications and recent developments in quantum-consciousness research.
                </p>
              </div>
              
              {/* Access */}
              <div className="bg-slate-900/50 p-6 rounded-xl border border-green-400/30">
                <h3 className="text-xl font-bold mb-4 text-green-300">Get the Book</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Available as a digital PDF with immediate delivery or print edition through professional publishing.
                </p>
                <button
                  onClick={() => scrollToSection('books')}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 text-sm cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Purchase the Book</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Concepts */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Core Scientific Principles</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <Atom className="h-16 w-16 text-purple-600" />,
                title: "Qualic Field Φ",
                description: "A universal sentient field underlying physical reality, partitioning itself into discrete experiential configurations through coherence-fertility optimization.",
                color: "purple"
              },
              {
                icon: <Brain className="h-16 w-16 text-blue-600" />,
                title: "Coherence-Fertility Optimization",
                description: "J(q) = αC(q) + βF(q) - the mathematical framework balancing structural stability (coherence) with generative potential (fertility).",
                color: "blue"
              },
              {
                icon: <Globe className="h-16 w-16 text-indigo-600" />,
                title: "Falsifiable Protocols",
                description: "Rigorous experimental designs including BEC anomalies, neural fractal shifts, and cosmological outliers for empirical validation.",
                color: "indigo"
              }
            ].map((concept, index) => (
              <div key={index} className={`bg-slate-800/30 p-8 rounded-2xl border-2 border-${concept.color}-400/30 hover:border-${concept.color}-400/50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1`}>
                <div className="mb-6 flex justify-center">{concept.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-center">{concept.title}</h3>
                <p className="text-gray-300 leading-relaxed text-center text-lg">{concept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Section - GitHub Simulations */}
      <section id="research" className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">SFH Simulations & Implementations</h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                Explore our open-source simulations and tools that demonstrate and implement the principles of the Sentience-Field Hypothesis.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {githubRepos.map((repo, index) => (
                <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-600 hover:border-purple-400/30 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold">{repo.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          repo.status === 'active' 
                            ? 'bg-green-900/30 text-green-400 border border-green-400/30'
                            : 'bg-orange-900/30 text-orange-400 border border-orange-400/30'
                        }`}>
                          {repo.status}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3 text-sm">{repo.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <Code className="h-4 w-4" />
                          <span>{repo.language}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="h-4 w-4" />
                          <span>{repo.forks}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Updated: {repo.updated}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-4">
                        <strong>Framework:</strong> {repo.framework}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <a
                        href={repo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border border-slate-600 hover:border-purple-400/30"
                      >
                        <Github className="h-4 w-4" />
                        <span>View on GitHub</span>
                      </a>
                      {repo.demoUrl && (
                        <a
                          href={repo.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                        >
                          <Play className="h-4 w-4" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                    {repo.docsUrl && (
                      <a
                        href={repo.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full border border-slate-600 hover:border-cyan-400/30 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 hover:bg-slate-800/50"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Documentation</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Contributing Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-xl border border-purple-400/20">
                <h3 className="text-xl font-bold mb-4 text-purple-300">For Researchers</h3>
                <p className="text-gray-300 mb-4">
                  We welcome contributions from the scientific community. Whether you're extending existing simulations or creating new ones, your expertise helps advance SFH research.
                </p>
                <a
                  href="mailto:thesfh@proton.me?subject=Research Collaboration - SFH Simulations"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  <Users className="h-4 w-4" />
                  <span>Collaborate</span>
                </a>
              </div>
              
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-cyan-300">For Developers</h3>
                <p className="text-gray-300 mb-4">
                  Join our open-source development community. We're always looking for contributors to improve simulations, fix bugs, and add new features.
                </p>
                <div className="flex space-x-2">
                  <a
                    href="https://github.com/sentient-field"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors border border-slate-600 hover:border-cyan-400/30"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub Org</span>
                  </a>
                  <a
                    href="mailto:thesfh@proton.me?subject=Development Contribution - SFH Project"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    <Code className="h-4 w-4" />
                    <span>Contribute</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Books & Publications</h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Access the complete research in book format - available as digital PDF or print edition
          </p>
          
          <div className="max-w-6xl mx-auto">
            {/* Main Book Display */}
            <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700 mb-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Book Details */}
                <div>
                  <div className="inline-flex items-center space-x-2 mb-4 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-400/30">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">Featured Publication</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-2">{bookData.title}</h3>
                  <p className="text-gray-400 mb-4">by {bookData.author}</p>
                  <p className="text-gray-300 mb-6">{bookData.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {bookData.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Purchase Options */}
                <div className="space-y-6">
                  {/* PDF Download - PayPal */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold mb-2 text-slate-900">Digital PDF Edition (Pre-Published)</h3>
                      <p className="text-slate-700 mb-4">Latest updates version - Secure delivery to your email</p>
                      <div className="text-2xl font-bold text-purple-600 mb-4">{bookData.price}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPayPalProduct({
                          title: "Digital PDF Edition (Pre-Published)",
                          description: "Latest updates version - Secure delivery to your email",
                          price: bookData.price,
                          buttonId: "UR27PB2VA8XFW"
                        });
                        setPaypalModalOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Download className="h-5 w-5" />
                      <span>Purchase PDF Now</span>
                    </button>
                  </div>
                  
                  {/* PDF Download - Crypto */}
                  <CryptoPayment
                    type="purchase"
                    title="Digital PDF - Crypto Payment"
                    description="Pay with ETH, LINK, or BTC ($19.99 equivalent)"
                  />
                  
                  {/* Print Edition - IngramSpark */}
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-green-400/30 transition-all">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold mb-2">Print Edition</h3>
                      <p className="text-gray-300 mb-4">Professional paperback and hardcover options</p>
                    </div>
                    <a
                      href={`https://www.ingramspark.com/search?query=${encodeURIComponent(bookData.title)}&account=${bookData.ingramSparkAccount}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>BUY the BOOK</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Available through IngramSpark Publishing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Papers */}
      <section id="publications" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Scientific Publications</h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Current research projects in development and preprints seeking publication through the Open Science Framework
          </p>
          
          {/* Main OSF Project Card */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 p-8 rounded-2xl border border-purple-400/30 hover:border-purple-400/50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">The Sentient-Field Hypothesis</h3>
                  <p className="text-purple-300 font-medium">Open Science Framework Project</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Our ongoing research project hosted on OSF contains preliminary findings, mathematical formulations, 
                and experimental protocols for the Sentience-Field Hypothesis. This includes work seeking peer-review 
                and publication in academic journals.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2 text-purple-300">Current Components:</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li className="flex items-center"><div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>Mathematical Foundations</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>Experimental Protocols</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>Interdisciplinary Applications</li>
                  </ul>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2 text-blue-300">Status:</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li className="flex items-center"><div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>Preprint Development</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>Peer Review Preparation</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>Open Access</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://osf.io/x5bf4/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>View on OSF</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://osf.io/x5bf4/files/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border-2 border-purple-400 text-purple-400 px-6 py-4 rounded-lg font-semibold hover:bg-purple-900/20 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  <span>Access Files</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Future Publications Info */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-600">
              <h4 className="text-xl font-semibold mb-3 text-cyan-400">Future Publications</h4>
              <p className="text-gray-300 mb-4">
                As research progresses and papers are accepted for publication, 
                this section will be updated with direct links to published articles in academic journals.
              </p>
              <div className="text-sm text-gray-400">
                <p className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Stay updated: <a href="mailto:thesfh@proton.me" className="text-purple-400 hover:text-purple-300 ml-1">thesfh@proton.me</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Section */}
      <section id="media" className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">Educational Media</h2>
          <p className="text-xl text-gray-300 text-center mb-4 max-w-3xl mx-auto">
            Video presentations, simulations, and explanatory content
          </p>
          
          {/* YouTube Channel Link */}
          <div className="text-center mb-12">
            <a
              href="https://www.youtube.com/@TheSentient-Field"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Play className="h-5 w-5" />
              <span>Visit Our YouTube Channel</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          
          {/* Video List Without Thumbnails */}
          <div className="max-w-4xl mx-auto space-y-4">
            {videos.map((video, index) => (
              <div key={index} className="bg-slate-700/30 p-6 rounded-xl border border-slate-600 hover:border-purple-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                    <p className="text-gray-300 mb-2">{video.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Duration: {video.duration}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        video.type === 'youtube' ? 'bg-red-600 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {video.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="ml-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play className="h-5 w-5" />
                    <span>Watch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
      
      {/* PayPal Purchase Modal */}
      {paypalModalOpen && selectedPayPalProduct && (
        <PayPalPurchaseModal
          isOpen={paypalModalOpen}
          onClose={() => {
            setPaypalModalOpen(false);
            setSelectedPayPalProduct(null);
          }}
          title={selectedPayPalProduct.title}
          description={selectedPayPalProduct.description}
          price={selectedPayPalProduct.price}
          buttonId={selectedPayPalProduct.buttonId}
        />
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Join the Scientific Discussion</h2>
            <p className="text-xl text-gray-300 mb-8">
              Contact The Sentient-Field Braintrust for collaboration, questions, or media inquiries
            </p>
            
            <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Mail className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-semibold">thesfh@proton.me</span>
              </div>
              
              <p className="text-gray-300 mb-6">
                We welcome serious scientific inquiry, collaboration proposals, and discussions 
                about the implications of the Sentience-Field Hypothesis across disciplines.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:thesfh@proton.me?subject=Inquiry about the Sentience-Field Hypothesis&body=Hello,%0D%0A%0D%0AI am writing to inquire about your research on the Sentience-Field Hypothesis.%0D%0A%0D%0A[Please describe your question or area of interest]%0D%0A%0D%0ABest regards,%0D%0A[Your name]"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Mail className="h-5 w-5" />
                  <span>Send Email</span>
                </a>
                <a
                  href="mailto:thesfh@proton.me?subject=Research Collaboration Proposal&body=Hello,%0D%0A%0D%0AI am interested in exploring potential research collaboration opportunities related to the Sentience-Field Hypothesis.%0D%0A%0D%0ABackground:%0D%0A[Please describe your research background and affiliation]%0D%0A%0D%0ACollaboration Interest:%0D%0A[Please describe the type of collaboration you envision]%0D%0A%0D%0AProposed Timeline:%0D%0A[If applicable]%0D%0A%0D%0ABest regards,%0D%0A[Your name and institution]"
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-600 rounded-lg hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Users className="h-5 w-5" />
                  <span>Research Collaboration</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Atom className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-semibold">Sentient-Field Braintrust</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2025 The Sentient-Field Braintrust. All rights reserved. 
              <span className="ml-2">Research published under open access principles.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
