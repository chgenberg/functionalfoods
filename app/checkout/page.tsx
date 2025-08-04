"use client";
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCreditCard, FiLock, FiUser, FiMail, FiCheck } from 'react-icons/fi';
import { GiSparkles } from 'react-icons/gi';

import { FaCreditCard } from 'react-icons/fa';
import Link from 'next/link';

export default function Checkout() {
  const { items, total, clearCart, isLoaded } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'klarna' | 'swish' | 'stripe' | null>(null);
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



  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Kortbetalning',
      description: 'Betala säkert med Visa, Mastercard eller American Express',
      icon: <FaCreditCard className="text-2xl" />,
      enabled: true,
      badge: 'Säker betalning'
    }
  ];

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError('');

    if (guestMode && !validateGuestForm()) {
      setIsProcessing(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const requestBody: any = {
        items: items,
        paymentMethod: selectedPayment,
        customerInfo: guestMode ? {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim().toLowerCase()
        } : null,
        createAccount: guestMode ? customerInfo.createAccount : null
      };

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

      // Handle different response types
      if (data.requiresRedirect && data.redirectUrl) {
        // For Stripe, redirect to payment page
        if (selectedPayment === 'stripe') {
          window.location.href = data.redirectUrl;
        } else {
          // For other payment methods that need external redirect
          window.location.href = data.redirectUrl;
        }
      } else if (data.success) {
        // Payment completed immediately
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        clearCart();
        router.push('/checkout/success?new=' + (data.user?.isNewUser ? 'true' : 'false'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel med betalningen');
    } finally {
      setIsProcessing(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back button */}
        <Link href="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors group">
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Tillbaka till varukorg
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Info & Payment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <FiUser className="mr-3" />
                  Dina uppgifter
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {guestMode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Namn *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Christopher Genberg"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-post *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="ch.genberg@gmail.com"
                        required
                      />
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customerInfo.createAccount}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, createAccount: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700">
                          Skapa ett konto åt mig så jag slipper fylla i detta igen (rekommenderas)
                        </span>
                      </label>
                    </div>
                    
                    <p className="text-sm text-gray-500 flex items-center">
                      Har du redan ett konto? <Link href="/login" className="text-blue-600 hover:underline ml-1">Logga in här</Link>
                    </p>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 flex items-center">
                      <FiCheck className="mr-2" />
                      Inloggad som <span className="font-semibold ml-1">{user?.email}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <FiCreditCard className="mr-3" />
                  Betalningsmetod
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id as any)}
                      disabled={!method.enabled}
                      className={`relative p-5 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                        selectedPayment === method.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            selectedPayment === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                          }`}>
                            {method.icon}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {method.name}
                              {method.badge && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  {method.badge}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        {selectedPayment === method.id && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <FiCheck className="text-white text-sm" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-pink-600 to-orange-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Din beställning</h2>
              </div>
              
              <div className="p-6">
                {/* Order items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.type === 'course' ? 'Kurs' : 'Bok'} • Antal: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{item.price * item.quantity} kr</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">{item.price} kr/st</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-gray-800">Totalt</span>
                    <span className="text-2xl font-bold text-blue-600">{total} kr</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Inklusive moms</p>

                  {/* Security badges */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <FiLock className="text-green-600" />
                      <span>Säker betalning med 256-bit SSL-kryptering</span>
                    </div>
                  </div>

                  {/* Checkout button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || !selectedPayment || (guestMode && (!customerInfo.name || !customerInfo.email))}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all transform ${
                      isProcessing || !selectedPayment || (guestMode && (!customerInfo.name || !customerInfo.email))
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Bearbetar...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <GiSparkles className="mr-2" />
                        Slutför beställning
                      </span>
                    )}
                  </button>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 