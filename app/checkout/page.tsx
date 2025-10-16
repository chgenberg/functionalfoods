"use client";
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

import { GiSparkles } from 'react-icons/gi';
import { useT } from '../lib/i18n/LanguageProvider';
import { ArrowLeft, Lock, CreditCard, User, Mail, Tag, X, Smartphone, ShoppingCart, ArrowRight, Book } from 'lucide-react';
import { trackInitiateCheckout } from '../lib/analytics';

// Course images mapping
const courseImages: Record<string, string> = {
  'functional-flow': '/Kurser_bilder/Functional_Gut Health.jpg',
  'functional-basics': '/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg',
  'functional-energy': '/Kurser_bilder/Functional_insulin balance.jpg'
};

export default function Checkout() {
  const t = useT();
  const { items, total, discount, finalTotal, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  
  // Guest checkout form data
  const [guestMode, setGuestMode] = useState(!user);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    createAccount: false
  });

  useEffect(() => {
    if (user) {
      setGuestMode(false);
      setCustomerInfo({
        name: user.name || '',
        email: user.email || '',
        createAccount: false
      });
    }
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError(null);
    const res = await applyCoupon(couponInput.trim());
    if (!res.success) setCouponError(res.message || 'Ogiltig rabattkod');
    setApplying(false);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate form if guest mode
      if (guestMode) {
        if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
          setError('Vänligen fyll i alla obligatoriska fält');
          setIsProcessing(false);
          return;
        }
      }

      // Build checkout payload (compatible with Stripe /api/checkout endpoint)
      const checkoutData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type
        })),
        customer: guestMode ? { 
          name: customerInfo.name, 
          email: customerInfo.email 
        } : (user ? { 
          name: user.name, 
          email: user.email, 
          id: user.id 
        } : undefined),
        couponCode: appliedCoupon?.code || undefined
      };

      // Fire analytics: Initiate Checkout / begin_checkout before redirect
      try {
        trackInitiateCheckout({
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          value: finalTotal
        });
      } catch {}

      // Store checkout data temporarily
      sessionStorage.setItem('checkout_data', JSON.stringify(checkoutData));

      // Create Stripe Checkout Session
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Kunde inte skapa Stripe‑betalning');
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Något gick fel');
      setIsProcessing(false);
    }
  };

  if (false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-text-secondary">{t('checkout.loading','Laddar checkout...')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <h2 className="text-2xl font-light mb-2">{t('checkout.empty','Din varukorg är tom')}</h2>
          <p className="text-gray-600 mb-8">{t('checkout.emptyDesc','Du har inga produkter i din varukorg.')}</p>
          <Link href="/utbildning" className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-full hover:bg-[#1a5530] transition-colors">
            {t('checkout.exploreCourses','Utforska våra kurser')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate if we have a discount
  const hasDiscount = discount > 0;
  // VAT breakdown for display
  const VAT_RATE = 0.25;
  const subtotalExVat = total;
  const discountExVat = discount;
  const taxableBaseExVat = Math.max(0, subtotalExVat - discountExVat);
  const vatAmount = Math.round(taxableBaseExVat * VAT_RATE);
  const totalInclVat = taxableBaseExVat + vatAmount;

  return (
    <main className="min-h-screen bg-[#F7F5F0] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simplified Header */}
        <div className="mb-12 text-center">
          <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t('checkout.backToCart','Tillbaka')}
          </Link>
          <h1 className="text-3xl font-light text-gray-900">{t('checkout.title','Slutför ditt köp')}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Customer & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information - Simplified */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                {t('checkout.yourDetails','Dina uppgifter')}
              </h2>

              {guestMode ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#93C560] transition-colors"
                      placeholder="Namn *"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#93C560] transition-colors"
                      placeholder="E-post *"
                      required
                    />
                  </div>

                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customerInfo.createAccount}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, createAccount: e.target.checked })}
                      className="w-4 h-4 text-[#014421] rounded focus:ring-[#93C560]"
                    />
                    {t('checkout.createAccount','Skapa ett konto för enklare köp nästa gång')}
                  </label>

                  <p className="text-sm text-gray-500">
                    {t('checkout.haveAccount','Har du redan ett konto?')} 
                    <Link href="/login" className="text-[#014421] hover:underline ml-1">
                      {t('checkout.loginHere','Logga in här')}
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('checkout.loggedInAs','Inloggad som')}</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method - Simplified with Swish */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                {t('checkout.paymentMethod','Betalningsmetod')}
              </h2>

              <div className="space-y-3">
                {[
                  {
                    id: 'stripe',
                    name: 'Kort (Stripe)',
                    desc: 'Betala med Visa, Mastercard, Apple Pay, Google Pay',
                    icon: CreditCard,
                    recommended: true
                  }
                ].map((method) => (
                  <label 
                    key={method.id} 
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? 'border-[#014421] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedPayment === method.id ? 'bg-[#014421] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                      {method.recommended && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Rekommenderas
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Payment method logos */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Accepterade betalningsmetoder:</p>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Visa */}
                  <div className="h-8 w-12 bg-white border border-gray-200 rounded p-1 flex items-center justify-center">
                    <svg viewBox="0 0 48 32" className="h-full">
                      <path fill="#1A1F71" d="M24.5 19.3l-1.6-7.5h-2.7l2.5 11.7h3.6l3.6-11.7h-2.6l-2.8 7.5zm-7.5-7.5l-2.1 8-1.2-6.3c-.1-.6-.6-1.7-1.8-1.7H7.6l-.1.5c.9.2 1.9.5 2.5.8.4.2.5.3.6.8l2 9.6h2.7l4.1-11.7h-2.4zm20.6 7.6c0-.2.1-.3.2-.4.1-.1.3-.2.5-.2.5 0 1.2.2 1.9.6l.4-2.2c-.6-.2-1.3-.4-2.1-.4-2.3 0-3.9 1.2-3.9 2.9 0 1.3 1.1 2 2 2.3.9.4 1.2.6 1.2.9 0 .5-.7.7-1.4.7-.9 0-1.4-.2-2.1-.5l-.4 2.2c.7.3 1.9.5 3.2.5 2.4 0 4-1.2 4-3 0-2.3-3.5-2.4-3.5-3.4zm-4.5-5.5c-1.5 0-2.5.4-3.2 1.9l-4.5 9.8h2.7l.6-1.7h3.3l.4 1.7h2.4l-2.1-11.7h-2zm-1.2 7.8l1.4-3.8.8 3.8h-2.2z"/>
                    </svg>
                  </div>
                  {/* Mastercard */}
                  <div className="h-8 w-12 bg-white border border-gray-200 rounded p-1 flex items-center justify-center">
                    <svg viewBox="0 0 48 32" className="h-full">
                      <circle fill="#EB001B" cx="16" cy="16" r="13"/>
                      <circle fill="#F79E1B" cx="32" cy="16" r="13"/>
                      <path fill="#FF5F00" d="M24 5.5c3.3 2.5 5.5 6.4 5.5 10.5s-2.2 8-5.5 10.5c-3.3-2.5-5.5-6.4-5.5-10.5s2.2-8 5.5-10.5z"/>
                    </svg>
                  </div>
                  {/* Amex */}
                  <div className="h-8 w-12 bg-white border border-gray-200 rounded p-1 flex items-center justify-center">
                    <svg viewBox="0 0 48 32" className="h-full">
                      <path fill="#2E77BB" d="M0 0h48v32H0z"/>
                      <path fill="#FFF" d="M10.7 13.5L8.9 9.3 7.1 13.5h3.6zm13.5 0l-1.8-4.2-1.8 4.2h3.6zm-7.5 6.1h-2.3l-1.1-2.7H9.5l-1.1 2.7H6.1L9.9 11h2.5l3.8 8.6h-2.5zm7.5 0l-3.8-8.6h2.5l2.2 5.3 2.2-5.3h2.5l-3.8 8.6h-1.8zm15.5-5.3l-1.7 2.1 1.7 3.2h-2.6l-1.6-3.2-1.6 3.2h-2.6l1.7-3.2-1.7-2.1h2.6l1.6 2.1 1.6-2.1h2.6z"/>
                    </svg>
                  </div>
                  {/* Apple Pay */}
                  <div className="h-8 px-3 bg-black text-white rounded flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span className="text-xs font-medium">Pay</span>
                  </div>
                  {/* Google Pay */}
                  <div className="h-8 px-3 bg-white border border-gray-200 rounded flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                      <path fill="#34A853" d="M5.27 14.31c-.456-1.337-.717-2.764-.717-4.31s.261-2.973.717-4.31l-3.826-2.978C.489 4.898 0 7.379 0 10s.489 5.102 1.444 7.29l3.826-2.98z"/>
                      <path fill="#FBBC05" d="M12.24 24c3.24 0 5.956-1.075 7.94-2.912l-3.771-3.009c-1.075.72-2.449 1.146-4.169 1.146-3.214 0-5.938-2.162-6.911-5.068l-3.826 2.98C3.515 20.569 7.586 24 12.24 24z"/>
                      <path fill="#EA4335" d="M19.18 21.088c1.984-1.837 3.34-4.459 3.34-7.814 0-.788-.085-1.39-.189-1.989H12.24V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-1.72 0-3.279-.574-4.399-1.417l-3.826 2.98c1.974 1.986 4.747 3.173 7.401 3.173 3.24 0 5.956-1.075 7.94-2.912l-3.771-3.009z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Pay</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Apple Pay och Google Pay visas automatiskt vid betalning om de är tillgängliga på din enhet
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary - Simplified */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-medium">{t('checkout.orderSummary','Din beställning')}</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Items */}
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {(item.image || courseImages[item.id]) ? (
                        <Image 
                          src={item.image || courseImages[item.id] || '/images/blog-placeholder.jpg'} 
                          alt={item.name} 
                          width={64} 
                          height={64} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Book className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.type === 'course' ? 'Kurs' : 'Bok'} • {item.quantity} st
                      </p>
                      <p className="font-medium text-gray-900 mt-1">{Math.ceil(item.price * (1 + VAT_RATE)).toLocaleString()} kr</p>
                    </div>
                  </div>
                ))}

                {/* Coupon */}
                <div className="pt-4 border-t border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 text-green-700">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-medium">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={removeCoupon} className="hover:text-green-900">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Rabattkod"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#93C560]"
                      />
                      <button 
                        onClick={handleApplyCoupon} 
                        disabled={applying}
                        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                      >
                        {applying ? '...' : 'Använd'}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-600 text-sm mt-2">{couponError}</p>
                  )}
                </div>

                {/* Totals with VAT breakdown */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delsumma (exkl. moms)</span>
                    <span className="text-gray-900">{subtotalExVat.toLocaleString()} kr</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rabatt</span>
                      <span className="text-green-600">-{discountExVat.toLocaleString()} kr</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pb-2 border-b">
                    <span className="text-gray-600">Moms (25%)</span>
                    <span className="text-gray-900">{vatAmount.toLocaleString()} kr</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-lg font-medium">Totalt (inkl. moms)</span>
                    <span className="text-lg font-bold text-gray-900">{totalInclVat.toLocaleString()} kr</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || (!guestMode && !user)}
                  className="w-full py-4 bg-[#014421] text-white rounded-xl font-medium hover:bg-[#1a5530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      {t('checkout.processing','Behandlar...')}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {t('checkout.proceedToPayment','Gå till betalning')}
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Security badges */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                  <Lock className="w-3 h-3" />
                  <span>Säker betalning med SSL-kryptering</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
