"use client";
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { useT } from '../lib/i18n/LanguageProvider';
import { ArrowLeft, Lock, CreditCard, User, Tag, X, ShoppingCart, ArrowRight, Book } from 'lucide-react';
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
  const searchParams = useSearchParams();
  const { items, addItem, clearCart, discount, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const splitFullName = (fullName?: string | null) => {
    const trimmed = (fullName || '').trim();
    if (!trimmed) return { firstName: '', lastName: '' };
    const parts = trimmed.split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    };
  };
  const initialName = splitFullName(user?.name);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('svea');
  const [showOtherPayments, setShowOtherPayments] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  
  	const grillCheckoutUpsellBook = {
    id: 'grill-sommarmat',
    name: 'Grill- & Sommarmat – E-bok av Ulrika Davidsson',
    price: 140.57,
    quantity: 1,
    type: 'book' as const,
    image: '/grill-sommarmat-square.png'
  };
	
	const hasGrillSommarmatInCart = items.some((item) => item.id === 'grill-sommarmat');
	const hasOtherCourseOrBookInCart = items.some(
	    (item) =>
	      (item.type === 'course' || item.type === 'book') &&
	      item.id !== 'grill-sommarmat'
	);
	const showGrillCheckoutUpsell =
	    !hasGrillSommarmatInCart &&
	    hasOtherCourseOrBookInCart;

	const checkoutUpsellBook = showGrillCheckoutUpsell
    ? grillCheckoutUpsellBook
    : null;

  	const campaignId = searchParams.get('campaign') || undefined;
	const recoverOrderId = searchParams.get('recover') || undefined;
  	const recoverAttemptedRef = useRef(false);
  	const campaignItems = items;
  	const getPricedItem = (item: (typeof items)[number]) =>
  		campaignItems.find((pricedItem) => pricedItem.id === item.id) || item;

	
  // Guest checkout form data
  const [guestMode, setGuestMode] = useState(!user);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    email: user?.email || '',
    createAccount: false
  });

  const firstNameIsValid = customerInfo.firstName.trim().length > 1;
  const lastNameIsValid = customerInfo.lastName.trim().length > 1;
  const fullName = `${customerInfo.firstName.trim()} ${customerInfo.lastName.trim()}`.trim();
  const emailIsValid = customerInfo.email.trim().length > 3;
  const canCheckout = !isProcessing && (
    guestMode
      ? (firstNameIsValid && lastNameIsValid && emailIsValid)
      : (!!user && firstNameIsValid && lastNameIsValid)
  );

  useEffect(() => {
    if (user) {
      const userName = splitFullName(user.name);
      setGuestMode(false);
      setCustomerInfo({
        firstName: userName.firstName,
        lastName: userName.lastName,
        email: user.email || '',
        createAccount: false
      });
    }
  }, [user]);

	useEffect(() => {
    if (!recoverOrderId || recoverAttemptedRef.current) return;
    recoverAttemptedRef.current = true;

    const recoverCart = async () => {
      try {
        const res = await fetch(`/api/checkout/recover-cart?orderId=${encodeURIComponent(recoverOrderId)}`);
        const data = await res.json();

        if (!res.ok || !Array.isArray(data.items)) {
          throw new Error(data.error || 'Kundvagnen kunde inte återställas');
        }

        clearCart();
        for (const item of data.items) {
          const quantity = Math.max(1, Number(item.quantity || 1));
          for (let i = 0; i < quantity; i += 1) {
            addItem({
              id: item.id,
              name: item.name,
              price: Number(item.price || 0),
              quantity: 1,
              type: item.type === 'book' ? 'book' : 'course',
            });
          }
        }

        const recoveredName = splitFullName(data.customerName);
        setGuestMode(true);
        setCustomerInfo((current) => ({
          ...current,
          firstName: recoveredName.firstName || current.firstName,
          lastName: recoveredName.lastName || current.lastName,
          email: data.customerEmail || current.email,
        }));
      } catch (recoverError: any) {
        setError(recoverError?.message || 'Kundvagnen kunde inte återställas');
      }
    };

    recoverCart();
  }, [recoverOrderId, addItem, clearCart]);

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
      // Validate required fields
      if (!firstNameIsValid) {
        setError('Vänligen fyll i ditt förnamn');
        setIsProcessing(false);
        return;
      }
      if (!lastNameIsValid) {
        setError('Vänligen fyll i ditt efternamn');
        setIsProcessing(false);
        return;
      }
      if (guestMode && !emailIsValid) {
        setError('Vänligen fyll i din e-postadress');
        setIsProcessing(false);
        return;
      }

      // Build checkout payload (compatible with Stripe /api/checkout endpoint)
      const attribution = readAttribution();
      const checkoutData = {
        items: campaignItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type
        })),
        customer: guestMode ? {
          name: fullName,
          email: customerInfo.email
        } : (user ? {
          name: fullName,
          email: user.email,
          id: user.id
        } : undefined),
        couponCode: appliedCoupon?.code || undefined,
        campaignId,
        attribution
      };

      // Fire analytics: Initiate Checkout / begin_checkout before redirect
      try {
        trackInitiateCheckout({
          items: campaignItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          value: campaignItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
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
  
  // VAT rates
  const BOOK_VAT_RATE = 0.06;
  const COURSE_VAT_RATE = 0.25;
  
  // Calculate VAT per item type
  const bookItems = campaignItems.filter(item => item.type === 'book');
  const courseItems = campaignItems.filter(item => item.type === 'course');
  
  const bookSubtotalExVat = bookItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const courseSubtotalExVat = courseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotalExVat = campaignItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Distribute discount proportionally
  const discountExVat = discount;
  const bookDiscountRatio = subtotalExVat > 0 ? bookSubtotalExVat / subtotalExVat : 0;
  const courseDiscountRatio = subtotalExVat > 0 ? courseSubtotalExVat / subtotalExVat : 0;
  const bookDiscount = discount * bookDiscountRatio;
  const courseDiscount = discount * courseDiscountRatio;
  
  const bookTaxableBase = Math.max(0, bookSubtotalExVat - bookDiscount);
  const courseTaxableBase = Math.max(0, courseSubtotalExVat - courseDiscount);
  
  const bookVat = Math.round(bookTaxableBase * BOOK_VAT_RATE * 100) / 100;
  const courseVat = Math.round(courseTaxableBase * COURSE_VAT_RATE * 100) / 100;
  const vatAmount = Math.round((bookVat + courseVat) * 100) / 100;
  
  const taxableBaseExVat = Math.max(0, subtotalExVat - discountExVat);
  const totalInclVat = Math.round((taxableBaseExVat + vatAmount) * 100) / 100;
  
  // Determine which VAT label to show
  const hasBooks = bookItems.length > 0;
  const hasCourses = courseItems.length > 0;
  const vatLabel = hasBooks && hasCourses ? 'Moms (6% & 25%)' : hasBooks ? 'Moms (6%)' : 'Moms (25%)';

  return (
    <main className="min-h-screen bg-[#F7F5F0] py-6 sm:py-12 pb-32 lg:pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Simplified Header */}
        <div className="mb-6 sm:mb-12 text-center">
          <Link href="/cart" className="inline-flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors">
            <ArrowLeft className="mr-1.5 sm:mr-2 w-4 h-4" />
            {t('checkout.backToCart','Tillbaka till varukorg')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900">{t('checkout.title','Slutför ditt köp')}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content - Customer & Payment */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Customer Information - Simplified */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                {t('checkout.yourDetails','Dina uppgifter')}
              </h2>

              {guestMode ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#93C560] transition-colors"
                      placeholder="Förnamn *"
                      required
                    />
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#93C560] transition-colors"
                      placeholder="Efternamn *"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#93C560] transition-colors"
                      placeholder="E-post *"
                      required
                    />
                  </div>

                  <label className="flex items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customerInfo.createAccount}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, createAccount: e.target.checked })}
                      className="w-4 h-4 text-[#014421] rounded focus:ring-[#93C560] mt-0.5 sm:mt-0"
                    />
                    <span>{t('checkout.createAccount','Skapa ett konto för enklare köp nästa gång')}</span>
                  </label>

                  <p className="text-xs sm:text-sm text-gray-500">
                    {t('checkout.haveAccount','Har du redan ett konto?')} 
                    <Link href="/login" className="text-[#014421] hover:underline ml-1">
                      {t('checkout.loginHere','Logga in här')}
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">{t('checkout.loggedInAs','Inloggad som')}</p>
                      <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#93C560] transition-colors"
                      placeholder="Förnamn *"
                      required
                    />
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#93C560] transition-colors"
                      placeholder="Efternamn *"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                {t('checkout.paymentMethod','Betalningsmetod')}
              </h2>

              <div className="space-y-2 sm:space-y-3">
                {/* Svea - Primary payment method */}
                <label 
                  className={`flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPayment === 'svea'
                      ? 'border-[#014421] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="svea"
                    checked={selectedPayment === 'svea'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedPayment === 'svea' ? 'bg-[#014421] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-gray-900">Svea Ekonomi</p>
                      <p className="text-xs sm:text-sm text-gray-500">Betala med kort, faktura eller delbetalning</p>
                    </div>
                  </div>
                </label>

                {/* Show other payment methods link */}
                <button
                  type="button"
                  onClick={() => setShowOtherPayments(!showOtherPayments)}
                  className="text-xs sm:text-sm text-gray-600 hover:text-[#014421] underline transition-colors pl-2"
                >
                  {showOtherPayments ? '▼ Dölj övriga betalningsvillkor' : '▶ Övriga betalningsvillkor'}
                </button>

                {/* Stripe - Hidden by default */}
                {showOtherPayments && (
                  <label 
                    className={`flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPayment === 'stripe'
                        ? 'border-[#014421] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={selectedPayment === 'stripe'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedPayment === 'stripe' ? 'bg-[#014421] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900">Kort (Stripe)</p>
                        <p className="text-xs sm:text-sm text-gray-500">Betala med Visa, Mastercard, Apple Pay eller Google Pay</p>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* Payment method logos */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Accepterade betalningsmetoder:</p>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Visa */}
                  <div className="h-6 sm:h-7 bg-white border border-gray-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/visa.png"
                      alt="Visa"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* Mastercard */}
                  <div className="h-6 sm:h-7 bg-white border border-gray-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/mastercard.png"
                      alt="Mastercard"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* American Express */}
                  <div className="h-6 sm:h-7 bg-white border border-gray-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/amex.png"
                      alt="American Express"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* Apple Pay */}
                  <div className="h-6 sm:h-7 bg-white border border-gray-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/apple.png"
                      alt="Apple Pay"
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  {/* Google Pay */}
                  <div className="h-6 sm:h-7 bg-white border border-gray-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center justify-center">
                    <img
                      src="/payment_icons/google.png"
                      alt="Google Pay"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3">
                  Apple Pay och Google Pay visas automatiskt vid betalning om de är tillgängliga på din enhet.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary - Simplified */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-8">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-medium">{t('checkout.orderSummary','Din beställning')}</h2>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Items */}
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                          <Book className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {item.type === 'course' ? 'Kurs' : 'Bok'} • {item.quantity} st
                      </p>
                      <p className="font-medium text-sm sm:text-base text-gray-900 mt-0.5 sm:mt-1">{Math.round(getPricedItem(item).price * (1 + (item.type === 'book' ? BOOK_VAT_RATE : COURSE_VAT_RATE))).toLocaleString()} kr</p>
                    </div>
                  </div>
                ))}

                 {checkoutUpsellBook && (
                  <div className="rounded-xl border border-[#93C560] bg-[#93C560]/10 p-3 sm:p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        <Image
                          src={checkoutUpsellBook.image}
                          alt={checkoutUpsellBook.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#014421]">
                          Rekommenderat tillägg
                        </p>
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                        	Lägg till {checkoutUpsellBook.name.replace(' – E-bok av Ulrika Davidsson', '')}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          För vardag, fest och grillkvällar.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(checkoutUpsellBook)}
                      className="mt-3 w-full rounded-lg bg-[#014421] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1a5530] transition-colors"
                    >
                      Lägg i varukorgen
                    </button>
                  </div>
                )}

                {/* Coupon */}
                <div className="pt-3 sm:pt-4 border-t border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-green-50 text-green-700">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">{appliedCoupon.code}</span>
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
                        className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#93C560]"
                      />
                      <button 
                        onClick={handleApplyCoupon} 
                        disabled={applying}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
                      >
                        {applying ? '...' : 'Använd'}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-600 text-xs sm:text-sm mt-2">{couponError}</p>
                  )}
                </div>

                {/* Totals with VAT breakdown */}
                <div className="pt-3 sm:pt-4 border-t border-gray-100 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Delsumma (exkl. moms)</span>
                    <span className="text-gray-900 whitespace-nowrap">{subtotalExVat.toLocaleString()} kr</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Rabatt</span>
                      <span className="text-green-600 whitespace-nowrap">
                        -{discountExVat.toLocaleString()} kr
                      </span>
	                  </div>
	                )}
                  <div className="flex justify-between text-xs sm:text-sm pb-2 border-b">
                    <span className="text-gray-600">{vatLabel}</span>
                    <span className="text-gray-900 whitespace-nowrap">{vatAmount.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kr</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-sm sm:text-lg font-medium">Totalt (inkl. moms)</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">{Math.round(totalInclVat).toLocaleString()} kr</span>
                  </div>
                </div>

                {/* Checkout Button - Desktop */}
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className="hidden lg:flex w-full py-3 sm:py-4 bg-[#014421] text-white rounded-lg sm:rounded-xl font-medium hover:bg-[#1a5530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
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
                  <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Security badges */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
                  <Lock className="w-3 h-3" />
                  <span>Säker betalning med SSL-kryptering</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom checkout button for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 lg:hidden shadow-lg z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Totalt att betala</p>
            <p className="text-lg font-bold text-[#014421]">{Math.round(totalInclVat).toLocaleString()} kr</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!canCheckout}
            className="flex-1 py-3 bg-[#014421] text-white rounded-lg font-medium hover:bg-[#1a5530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Behandlar...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Betala</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
