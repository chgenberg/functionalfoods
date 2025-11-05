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

      // Create Stripe Checkout Session (Svea temporarily disabled)
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
                    name: 'Kort & Swish (Stripe)',
                    desc: 'Betala med Visa, Mastercard, Apple Pay, Google Pay eller Swish',
                    icon: CreditCard,
                    recommended: true
                  }
                  // Svea temporarily disabled
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
                <div className="flex flex-wrap items-center gap-3">
                  {/* Visa - Official Logo */}
                  <div className="h-8 w-14 bg-white border border-gray-200 rounded p-1 flex items-center justify-center">
                    <svg viewBox="0 0 141.732 141.732" className="h-full w-full">
                      <g fill="#1434CB">
                        <path d="M62.943 91.214l-8.7-52.7h-13.4l8.7 52.7h13.4zm40.8 0l-7.5-52.7h-12.5l-5.7 39.5-6.2-39.5h-13.4l-7.5 52.7h10.1l5.9-40.4 6.1 40.4h10.1zm54.3-52.7h-11.1c-3.4 0-5.7 1.8-6.8 5.1l-20.1 47.6h13.4l2.8-7.8h17.5l1.6 7.8h11.8l-17.1-52.7zm-16.1 33.5l7-18.8 4 18.8h-11z"/>
                      </g>
                    </svg>
                  </div>
                  {/* Mastercard - Official Logo */}
                  <div className="h-8 w-14 bg-white border border-gray-200 rounded p-1 flex items-center justify-center">
                    <svg viewBox="0 0 152.407 96" className="h-full w-full">
                      <g fill="none">
                        <rect width="152.407" height="96" rx="3" fill="#fff"/>
                        <path fill="#EB001B" d="M60.412 29.694h31.577a48.109 48.109 0 00-15.773-10.643 47.904 47.904 0 00-15.804-2.589z"/>
                        <path fill="#F79E1B" d="M92.027 29.694H60.412a48.109 48.109 0 0115.773-10.643A47.904 47.904 0 0192.027 29.694z"/>
                        <path fill="#FF5F00" d="M92.027 29.694a48.109 48.109 0 00-15.773-10.643 47.904 47.904 0 00-15.804-2.589 47.904 47.904 0 00-15.804 2.589A48.109 48.109 0 0060.412 29.694h31.615z"/>
                        <circle fill="#EB001B" cx="76.203" cy="48" r="24"/>
                        <circle fill="#F79E1B" cx="76.203" cy="48" r="24" transform="rotate(180 76.203 48)"/>
                      </g>
                    </svg>
                  </div>
                  {/* American Express - Official Logo */}
                  <div className="h-8 w-14 bg-white border border-gray-200 rounded p-1 flex items-center justify-center">
                    <svg viewBox="0 0 216 72" className="h-full w-full">
                      <path fill="#006FCF" d="M0 0h216v72H0z"/>
                      <path fill="#FFF" d="M50.4 36l-5.1-3.6 5.1-3.6v7.2zm14.4-7.2h-2.7l-1.8 4.3-1.8-4.3h-2.7v7.2h1.8v-4.3l1.8 4.3h1.3l1.8-4.3v4.3h1.8v-7.2zm11.7 0h-2.7v7.2h2.7v-7.2zm9.9 0h-2.7l-2.7 4.3v-4.3h-1.8v7.2h1.8l2.7-4.3v4.3h1.8v-7.2zm11.7 5.4c0 1-.9 1.8-1.8 1.8s-1.8-.8-1.8-1.8.9-1.8 1.8-1.8 1.8.8 1.8 1.8zm-12.6-5.4h-2.7c-1.5 0-2.7 1.2-2.7 2.7v1.8c0 1.5 1.2 2.7 2.7 2.7h2.7v-1.8h-2.7v-1.8h2.7v-1.8zm19.8 0h-6.3v1.8h4.5v1.2h-4.5v1.8h4.5v1.2h-4.5v1.8h6.3v-7.2zm8.1 0h-2.7v7.2h2.7v-2.7h2.7c1.5 0 2.7-1.2 2.7-2.7v-1.8c0-1.5-1.2-2.7-2.7-2.7zm0 4.5h-2.7v-1.8h2.7v1.8zm9.9-4.5h-2.7l-2.7 4.3v-4.3h-1.8v7.2h1.8l2.7-4.3v4.3h1.8v-7.2zm11.7 0h-2.7v7.2h2.7v-2.7h2.7c1.5 0 2.7-1.2 2.7-2.7v-1.8c0-1.5-1.2-2.7-2.7-2.7zm0 4.5h-2.7v-1.8h2.7v1.8z"/>
                    </svg>
                  </div>
                  {/* Stripe - Official Logo */}
                  <div className="h-8 px-3 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <svg viewBox="0 0 468 222.5" className="h-4 w-auto">
                      <path fill="#635BFF" d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5l-3.8-11.3c-5.6 2.9-14.1 4.9-23.2 4.9-9.3 0-17.3-3.5-18.4-14.8h53.7c0-1.3.2-6.5.2-7.9zm-53.8-10.6c.2-9.3 5.6-15.3 14.2-15.3 8.9 0 14.3 6 14.1 15.3h-28.3zm-89.3 10.3c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5l-3.8-11.3c-5.6 2.9-14.1 4.9-23.2 4.9-9.3 0-17.3-3.5-18.4-14.8h53.7c0-1.3.2-6.5.2-7.9zm-53.8-10.6c.2-9.3 5.6-15.3 14.2-15.3 8.9 0 14.3 6 14.1 15.3h-28.3zm-83.1 4.8c-3.3-3.3-8.9-7.8-18.5-7.8-12.5 0-23.3 8.3-23.3 24.2 0 15.9 10.5 24.4 23.3 24.4 9.3 0 15.4-4.8 18.8-8.2l8.7 7.4c-6.2 7.5-15.6 13.6-27.6 13.6-18.8 0-35.1-11.4-35.1-37.8 0-26.1 16.5-38.2 35.1-38.2 12.3 0 21.8 5.8 27.9 13.3l-8.7 7.5zm-65.3-7.2c-13.6 0-24.1 8.4-24.1 24.2 0 15.9 10.5 24.4 24.1 24.4 13.6 0 24.1-8.5 24.1-24.4 0-15.8-10.5-24.2-24.1-24.2zm-12.5 40.1c-2.9 0-5.2-2.3-5.2-5.5 0-3.2 2.3-5.5 5.2-5.5 2.9 0 5.2 2.3 5.2 5.5 0 3.2-2.3 5.5-5.2 5.5zm133.5-40.1c-17.2 0-30.5 13.3-30.5 30.6 0 17.2 13.3 30.5 30.5 30.5 17.2 0 30.5-13.3 30.5-30.5 0-17.3-13.3-30.6-30.5-30.6zm0 48.1c-9.8 0-17.5-7.7-17.5-17.5s7.7-17.5 17.5-17.5 17.5 7.7 17.5 17.5-7.7 17.5-17.5 17.5zm90.1-48.1c-13.6 0-24.1 8.4-24.1 24.2 0 15.9 10.5 24.4 24.1 24.4 13.6 0 24.1-8.5 24.1-24.4 0-15.8-10.5-24.2-24.1-24.2zm-12.5 40.1c-2.9 0-5.2-2.3-5.2-5.5 0-3.2 2.3-5.5 5.2-5.5 2.9 0 5.2 2.3 5.2 5.5 0 3.2-2.3 5.5-5.2 5.5zm74.3-40.1c-9.3 0-17.1 5.8-20.1 14.2l-13.3-6.1c5.2-10.5 16.4-17.8 33.4-17.8 19.4 0 32.5 11.4 32.5 27.3v47.5h-15.2v-11.8c-2.1 7.8-9.9 12.8-20.1 12.8-11.3 0-20.6-7.2-20.6-19.8 0-13.3 9.8-20.1 20.6-20.1 9.8 0 17.3 5.3 19.8 11.8v-11.8h15.2v37.6zm-183.1-7.2h-14.9v-11.8h14.9v11.8zm0 28.6h-14.9v-40.1h-15.2v51.9h30.1v-11.8z"/>
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
                  {/* Swish - Show if enabled */}
                  {(process.env.ENABLE_SWISH === 'true' || process.env.STRIPE_ENABLE_SWISH === 'true') && (
                    <div className="h-8 px-3 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <svg viewBox="0 0 200 60" className="h-5 w-auto">
                        <path fill="#006EC9" d="M10 10h180v40H10z" rx="3"/>
                        <path fill="#FFF" d="M30 25h35v10H30zm50 0h40v10H80zm70 0h40v10H150z"/>
                        <path fill="#006EC9" d="M30 40h130v5H30z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Apple Pay och Google Pay visas automatiskt vid betalning om de är tillgängliga på din enhet
                  {process.env.ENABLE_SWISH === 'true' || process.env.STRIPE_ENABLE_SWISH === 'true' ? '. Swish visas automatiskt för svenska kunder.' : ''}
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
