/**
 * Enhanced PayPal purchase component with modal interface for Braintrust site
 */

import React, { useState } from 'react';
import { Mail, CreditCard, Download, AlertCircle, CheckCircle, X } from 'lucide-react';

interface PayPalPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  price: string;
  buttonId: string;
}

export default function PayPalPurchaseModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  price,
  buttonId 
}: PayPalPurchaseModalProps) {
  const [email, setEmail] = useState('');
  const [emailCollected, setEmailCollected] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handleEmailSubmit = async () => {
    if (!isValidEmail) return;

    setIsLoading(true);
    
    // Store email in localStorage for later use
    localStorage.setItem('braintrust_purchaser_email', email);
    
    setEmailCollected(true);
    setIsLoading(false);
    
    // Initialize PayPal button after email collection
    setTimeout(() => {
      if (window.paypal && document.getElementById(`paypal-modal-container-${buttonId}`)) {
        window.paypal.HostedButtons({
          hostedButtonId: buttonId,
        }).render(`#paypal-modal-container-${buttonId}`);
      }
    }, 100);
  };

  const handlePayPalRedirect = () => {
    // If PayPal hosted buttons don't work, fallback to direct URL
    const paypalUrl = `https://www.paypal.com/ncp/payment/${buttonId}`;
    window.open(paypalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white border-slate-200 rounded-lg shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  {title}
                </h3>
                <p className="text-slate-600 text-sm mt-1">{description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {!emailCollected ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Email Required for Delivery</p>
                        <p className="text-blue-600">
                          We need your email address to send you the encrypted PDF book after purchase.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    {email && !isValidEmail && (
                      <p className="text-sm text-red-600">Please enter a valid email address</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEmailSubmit}
                      disabled={!isValidEmail || isLoading}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Please wait...' : 'Continue to Payment'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-800 mb-1">Email Confirmed</p>
                        <p className="text-green-600">
                          PDF will be sent to: <strong>{email}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-center">
                      <h3 className="font-medium text-slate-800 mb-2">The Sentience-Field Hypothesis</h3>
                      <p className="text-2xl font-bold text-purple-600 mb-1">{price}</p>
                      <p className="text-sm text-slate-600">Complete PDF + Research Materials</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* PayPal Hosted Button Container */}
                    <div id={`paypal-modal-container-${buttonId}`} className="paypal-button-wrapper">
                      {/* PayPal button will be inserted here */}
                    </div>
                    
                    {/* Fallback button if hosted buttons don't load */}
                    <button
                      onClick={handlePayPalRedirect}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      Pay with PayPal
                    </button>
                    
                    <div className="text-center">
                      <button 
                        onClick={() => setEmailCollected(false)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Change Email Address
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 text-center space-y-1">
                    <p>🔒 You will receive the encrypted PDF via email within minutes after payment confirmation.</p>
                    <p>📧 Contact thesfh@proton.me if you don't receive your book within 24 hours.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}