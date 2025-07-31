"use client";
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCreditCard, FiLock, FiUser, FiMail } from 'react-icons/fi';
import { GiSparkles } from 'react-icons/gi';
import Link from 'next/link';

export default function Checkout() {
  const { items, total, clearCart, isLoaded } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'klarna' | 'swish' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Guest checkout form data
  const [guestMode, setGuestMode] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    createAccount: true
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    } else {
      setGuestMode(true);
    }
  }, []);

  const getRedirectPath = () => {
    // Check if there's a functional-basics course in the cart
    const hasFunctionalBasics = items.some(item => item.id === 'functional-basics');
    const hasFunctionalFlow = items.some(item => item.id === 'functional-flow');
    
    if (hasFunctionalBasics && !hasFunctionalFlow) {
      return '/dashboard/courses/functional-basics';
    } else if (hasFunctionalFlow && !hasFunctionalBasics) {
      return '/dashboard/courses/functional-flow';
    } else if (hasFunctionalFlow) {
      // If both or just flow, prioritize flow
      return '/dashboard/courses/functional-flow';
    } else {
      return '/dashboard';
    }
  };

  const validateGuestForm = () => {
    if (!customerInfo.name.trim()) {
      setError('Namn är obligatoriskt');
      return false;
    }
    if (!customerInfo.email.trim()) {
      setError('E-post är obligatoriskt');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      setError('Ange en giltig e-postadress');
      return false;
    }
    return true;
  };

  const handlePayment = async (provider: 'klarna' | 'swish') => {
    setIsProcessing(true);
    setSelectedPayment(provider);
    setError('');

    // Validate guest form if in guest mode
    if (guestMode && !validateGuestForm()) {
      setIsProcessing(false);
      setSelectedPayment(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare request body
      const requestBody: any = {
        items: items,
        paymentMethod: provider
      };

      // Add customer info for guest checkout
      if (guestMode) {
        requestBody.customerInfo = {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim().toLowerCase()
        };
        requestBody.createAccount = customerInfo.createAccount;
      }

      // Send purchase to API
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel med betalningen');
      }

      // If we got a JWT token (new user), store it for automatic login
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Clear cart
      clearCart();
      
      // Redirect to success page
      router.push('/checkout/success?new=' + (data.user?.isNewUser ? 'true' : 'false'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel med betalningen');
    } finally {
      setIsProcessing(false);
      setSelectedPayment(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-text-secondary">Laddar checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 animate-fade-in">
        <h2 className="text-2xl font-light mb-4">Din varukorg är tom</h2>
        <p className="text-text-secondary mb-6">Du har inga produkter i din varukorg.</p>
        <Link href="/utbildning" className="btn-primary">
          Utforska våra kurser
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-light mb-4">
              Kassa
            </h1>
            <p className="text-text-secondary">
              Nästan klar! Fyll i dina uppgifter och välj betalningsmetod för att slutföra din beställning.
            </p>
          </div>

          {/* Guest Checkout Form */}
          {guestMode && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-primary" />
                Dina uppgifter
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Namn *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ditt fullständiga namn"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-post *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="din@email.se"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="createAccount"
                  checked={customerInfo.createAccount}
                  onChange={(e) => setCustomerInfo({...customerInfo, createAccount: e.target.checked})}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="createAccount" className="text-sm text-gray-700">
                  Skapa ett konto åt mig så jag slipper fylla i detta igen (rekommenderas)
                </label>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Har du redan ett konto?{' '}
                  <Link 
                    href={`/login?redirect=${encodeURIComponent('/checkout')}`}
                    className="text-primary hover:underline"
                  >
                    Logga in här
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Show error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fade-in">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h3 className="text-lg font-medium mb-4">Din beställning</h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Antal: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{(item.price * item.quantity).toLocaleString()} kr</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Totalt</span>
                  <span>{total.toLocaleString()} kr</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Inklusive moms</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FiCreditCard className="w-5 h-5 text-primary" />
                Betalningsmetod
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment('klarna')}
                  disabled={isProcessing || (guestMode && (!customerInfo.name || !customerInfo.email))}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {isProcessing && selectedPayment === 'klarna' && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="w-4 h-4 text-pink-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Klarna</p>
                        <p className="text-sm text-gray-600">Betala senare eller dela upp</p>
                      </div>
                    </div>
                    <GiSparkles className="w-5 h-5 text-pink-500" />
                  </div>
                </button>

                <button
                  onClick={() => handlePayment('swish')}
                  disabled={isProcessing || (guestMode && (!customerInfo.name || !customerInfo.email))}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {isProcessing && selectedPayment === 'swish' && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Swish</p>
                        <p className="text-sm text-gray-600">Betala med din telefon</p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">SWISH</span>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiLock className="w-4 h-4" />
                  <span>Säker betalning med 256-bit SSL-kryptering</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center animate-fade-in">
            <Link 
              href="/cart" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Tillbaka till varukorg
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 