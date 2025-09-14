"use client";
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

import { GiSparkles } from 'react-icons/gi';
import { useT } from '../lib/i18n/LanguageProvider';
import { ArrowLeft, Lock, CreditCard, User, Mail, Tag, X } from 'lucide-react';

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
      // Create Checkout Session
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: guestMode ? { name: customerInfo.name, email: customerInfo.email } : (user ? { name: user.name, email: user.email, id: user.id } : undefined),
          couponCode: appliedCoupon?.code || undefined
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h2 className="text-2xl font-light mb-4">{t('checkout.empty','Din varukorg är tom')}</h2>
          <p className="text-text-secondary mb-6">{t('checkout.emptyDesc','Du har inga produkter i din varukorg.')}</p>
          <Link href="/utbildning" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors">
            {t('checkout.exploreCourses','Utforska våra kurser')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-primary hover:text-accent mb-4 transition-colors">
            <ArrowLeft className="mr-2" />
            {t('checkout.backToCart','Tillbaka till varukorg')}
          </Link>
          <h1 className="text-3xl font-bold text-primary">{t('checkout.title','Slutför ditt köp')}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#014421] p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('checkout.yourDetails','Dina uppgifter')}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {guestMode && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('checkout.name','Namn')} *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                        placeholder="Ditt fullständiga namn"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('checkout.email','E-post')} *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                        placeholder="din@email.se"
                        required
                      />
                    </div>

                    <div className="bg-[#93C560]/10 border border-[#93C560]/30 rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customerInfo.createAccount}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, createAccount: e.target.checked })}
                          className="w-5 h-5 text-[#014421] rounded focus:ring-[#93C560]"
                        />
                        <span className="text-sm text-gray-700">
                          {t('checkout.createAccount','Skapa ett konto åt mig så jag slipper fylla i detta igen (rekommenderas)')}
                        </span>
                      </label>
                    </div>

                    <p className="text-sm text-gray-600">
                      {t('checkout.haveAccount','Har du redan ett konto?')} <Link href="/login" className="text-[#014421] hover:underline ml-1">{t('checkout.loginHere','Logga in här')}</Link>
                    </p>
                  </>
                )}

                {!guestMode && user && (
                  <div className="bg-[#93C560]/10 border border-[#93C560]/30 rounded-lg p-4">
                    <p className="text-[#014421] flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      {t('checkout.loggedInAs','Inloggad som')} <span className="font-semibold ml-1">{user?.email}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#014421] p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('checkout.paymentMethod','Betalningsmetod')}
                </h2>
              </div>

              <div className="p-6">
                {['stripe'].map((method) => {
                  const methodData = {
                    stripe: { name: 'Kort (Visa, Mastercard, Amex)', icon: CreditCard, desc: 'Säker kortbetalning via Stripe' }
                  }[method];

                  if (!methodData) return null;
                  
                  // TypeScript assertion after null check
                  const data = methodData as NonNullable<typeof methodData>;

                  return (
                    <div key={method} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPayment === method 
                        ? 'border-[#014421] bg-[#93C560]/10 shadow-lg'
                        : 'border-gray-200 hover:border-[#93C560] hover:shadow-md'
                    }`} onClick={() => setSelectedPayment(method)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedPayment === method ? 'bg-[#93C560]/20 text-[#014421]' : 'bg-gray-100'
                          }`}>
                            <data.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-gray-600">{data.desc}</p>
                            <span className="px-2 py-1 bg-[#93C560] text-[#014421] text-xs rounded-full font-medium">
                              Rekommenderas
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedPayment === method ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {selectedPayment === method && (
                            <div className="w-6 h-6 bg-[#014421] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
              <div className="bg-[#014421] p-6 text-white">
                <h2 className="text-xl font-bold">{t('checkout.orderSummary','Din beställning')}</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 leading-tight">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            {(item.type === 'course' ? t('checkout.course','Kurs') : t('checkout.book','Bok'))} • {t('checkout.quantity','Antal')}: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{(item.price * item.quantity).toLocaleString()} kr</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Tag className="w-4 h-4" />
                        <span>Rabattkod tillämpad: <strong>{appliedCoupon.code}</strong></span>
                      </div>
                      <button onClick={removeCoupon} className="text-green-700 hover:text-green-900" aria-label="Ta bort rabattkod">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Rabattkod"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#93C560]"
                      />
                      <button onClick={handleApplyCoupon} disabled={applying} className="px-4 py-2 bg-[#014421] text-white rounded-lg disabled:opacity-60">
                        {applying ? 'Lägger till...' : 'Lägg till'}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium text-gray-700">{t('checkout.subtotal','Delsumma')}</span>
                    <span className="text-lg font-semibold text-gray-900">{total.toLocaleString()} kr</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-green-700">
                      <span className="font-medium">{t('checkout.discount','Rabatt')}</span>
                      <span>-{discount.toLocaleString()} kr</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-gray-800">{t('checkout.total','Totalt')}</span>
                    <span className="text-2xl font-bold text-[#014421]">{finalTotal.toLocaleString()} kr</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">{t('checkout.vatIncluded','Inklusive moms')}</p>

                  <div className="bg-[#93C560]/10 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-sm text-[#014421]">
                      <Lock className="text-[#014421]" />
                      <span>{t('checkout.secure','Säker betalning med 256-bit SSL-kryptering')}</span>
                    </div>
                  </div>

                  {/* Checkout button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || !selectedPayment || (guestMode && (!customerInfo.name || !customerInfo.email))}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all transform ${
                      isProcessing || !selectedPayment || (guestMode && (!customerInfo.name || !customerInfo.email))
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#FF7e70] hover:bg-[#e56b5e] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        {t('checkout.processing','Bearbetar...')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <GiSparkles className="mr-2" />
                        {t('checkout.placeOrder','Slutför beställning')}
                      </span>
                    )}
                  </button>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
