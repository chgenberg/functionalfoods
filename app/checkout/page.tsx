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
import { readAttribution } from '../lib/attribution';

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
      const attribution = readAttribution();
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
        couponCode: appliedCoupon?.code || undefined,
        attribution
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

      // Route to appropriate payment provider
      if (selectedPayment === 'svea') {
        // Redirect to Svea checkout page
        window.location.href = '/checkout/svea';
      } else {
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
      }
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

            {/* Payment Method */}
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
                    desc: 'Betala med Visa, Mastercard, Apple Pay eller Google Pay',
                    icon: CreditCard,
                    recommended: true
                  }
                  // TEMPORARILY HIDDEN: Svea payment method
                  // {
                  //   id: 'svea',
                  //   name: 'Svea Ekonomi',
                  //   desc: 'Betala med kort, faktura eller delbetalning',
                  //   icon: CreditCard,
                  //   recommended: false
                  // }
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
                <div className="flex flex-wrap items-center gap-2">
                  {/* Visa */}
                  <div className="h-7 bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/visa.png"
                      alt="Visa"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* Mastercard */}
                  <div className="h-7 bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/mastercard.png"
                      alt="Mastercard"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* American Express */}
                  <div className="h-7 bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/amex.png"
                      alt="American Express"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* Apple Pay */}
                  <div className="h-7 bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/apple.png"
                      alt="Apple Pay"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* Google Pay */}
                  <div className="h-7 bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/google.png"
                      alt="Google Pay"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Apple Pay och Google Pay visas automatiskt vid betalning om de är tillgängliga på din enhet.
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
