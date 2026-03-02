'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Book, Download, X, Loader2, Mail, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackPurchase } from '@/app/lib/analytics';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';

function SveaSuccessContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 20; // Max 1 minute (20 * 3 seconds);
  const { clearCart } = useCart();

  useEffect(() => {
    const orderId = searchParams?.get('orderId');
    const checkoutOrderId = searchParams?.get('checkoutOrderId');
    
    if (orderId) {
      // If we have orderId, fetch checkoutOrderId from database if needed
      if (checkoutOrderId && checkoutOrderId !== '{checkout.order.id}') {
        verifyPayment(checkoutOrderId, orderId);
      } else {
        // Fetch checkoutOrderId from session storage or database
        const storedCheckoutId = sessionStorage.getItem('svea_checkout_id');
        
        if (storedCheckoutId) {
          verifyPayment(storedCheckoutId, orderId);
        } else {
          // Fetch from database using orderId
          fetchCheckoutOrderId(orderId);
        }
      }
    } else {
      // Try to get from session storage as fallback
      const storedOrderId = sessionStorage.getItem('svea_order_id');
      const storedCheckoutId = sessionStorage.getItem('svea_checkout_id');
      
      if (storedOrderId && storedCheckoutId) {
        verifyPayment(storedCheckoutId, storedOrderId);
      } else {
        setError('Ingen orderinformation hittades');
        setLoading(false);
      }
    }
  }, [searchParams]);

  const fetchCheckoutOrderId = async (orderId: string) => {
    try {
      // Fetch order from database to get checkoutOrderId
      const response = await fetch(`/api/orders/lookup?orderId=${orderId}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.checkoutOrderId) {
          verifyPayment(data.checkoutOrderId, orderId);
        } else {
          setError('Kunde inte hitta Svea order ID');
          setLoading(false);
        }
      } else {
        setError('Kunde inte hämta orderinformation');
        setLoading(false);
      }
    } catch (err) {
      setError('Ett fel uppstod vid hämtning av orderinformation');
      setLoading(false);
    }
  };

  const verifyPayment = async (checkoutOrderId: string, orderId: string) => {
    try {
      console.log('🔍 Verifying payment:', { checkoutOrderId, orderId });
      
      const response = await fetch('/api/checkout/verify-svea-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutOrderId, orderId })
      });

      const data = await response.json();
      console.log('📥 Verify response:', data);
      console.log('🔍 Response check:', {
        success: data.success,
        paymentCompleted: data.paymentCompleted,
        hasOrder: !!data.order,
        orderStatus: data.order?.status
      });
      
      if (data.success && data.paymentCompleted) {
        console.log('✅ Payment completed! Setting order details and stopping loader');
        setOrderDetails(data.order);
        setRetryCount(0);

        // 1) Clear cart + session
        clearCart(); // från CartContext (importera/useCart)
        
        sessionStorage.removeItem('svea_order_id');
        sessionStorage.removeItem('svea_checkout_id');
        sessionStorage.removeItem('checkout_data');

        // 2) Then stop loader
        setLoading(false); // IMPORTANT: Stop loading when payment is completed
        
        // GA4: purchase event
        try {
          const normalizeGaItemId = (rawId: string | undefined) => rawId;

          const items = Array.isArray(data.order?.items) ? data.order.items.map((i: any) => ({
            id: normalizeGaItemId(i.productId, i.productName),
            name: i.productName,
            quantity: i.quantity,
            price: i.price,
          })) : [];
          trackPurchase({
            transactionId: data.order?.id,
            value: Number(data.order?.totalAmount) || 0,
            currency: 'SEK',
            items,
          });
        } catch {}
      } else if (data.success && !data.paymentCompleted) {
        // Payment is still pending
        if (retryCount < maxRetries) {
          setError(`Betalningen behandlas fortfarande. Vänligen vänta... (${retryCount + 1}/${maxRetries})`);
          setRetryCount(retryCount + 1);
          // Retry after a delay
          setTimeout(() => verifyPayment(checkoutOrderId, orderId), 3000);
        } else {
          // After max retries, show manual instruction
          setError('Betalningen tar längre tid än förväntat. Din order är registrerad och du får ett bekräftelsemail när betalningen är slutförd.');
          setLoading(false);
        }
      } else {
        const errorMsg = data.error || data.details || 'Kunde inte verifiera betalningen';
        console.error('❌ Verify failed:', data);
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Verify exception:', err);
      setError(`Ett fel uppstod vid verifiering av betalningen: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#014421] mx-auto mb-4" />
          <p className="text-gray-600">Verifierar din betalning...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Något gick fel</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#1a5530] transition-colors"
            >
              Försök igen
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kontakta support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if order contains e-books
  const hasEbooks = orderDetails?.items?.some((item: any) => 
    item.productType === 'book' || item.productName?.toLowerCase().includes('e-bok') || item.productName?.toLowerCase().includes('brodboken')
  );
  const hasCourses = orderDetails?.items?.some((item: any) => item.productType === 'course');
  const onlyEbooks = hasEbooks && !hasCourses;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {onlyEbooks ? (
          <>
            <p className="text-xl text-gray-600 mb-4">
                Din e-bok är på väg till din inkorg!
              </p>
              
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <Mail className="w-4 h-4" />
                Kolla din e-post för nerladdningslänken
              </div>
            </>
          ) : (
            <>
              
          {/* Course purchase header */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tack för ditt köp!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Din betalning har genomförts och du har nu tillgång till dina kurser.
          </p>
        </>
        )}
        </motion.div>

        {orderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Orderdetaljer</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Beställning</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order-ID:</span>
                    <span className="font-medium font-mono">{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Betalningsmetod:</span>
                    <span className="font-medium">Svea Ekonomi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">
                      {orderDetails.status === 'COMPLETED' ? 'Betald' : 'Behandlas'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Kunduppgifter</h3>
                <div className="space-y-2 text-sm">
                  {orderDetails.customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">E-post:</span>
                      <span className="font-medium">{orderDetails.customerEmail}</span>
                    </div>
                  )}
                  {orderDetails.customerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Namn:</span>
                      <span className="font-medium">{orderDetails.customerName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {orderDetails.items && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Köpta produkter</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Book className="w-5 h-5 text-[#014421]" />
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            {item.productType === 'course' ? 'Kurs' : 'Bok'} • {item.quantity} st
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.price} kr</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Totalt:</span>
                  <span className="text-2xl font-bold text-[#014421]">{orderDetails.totalAmount} kr</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Next Steps - Conditional based on product type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Vad händer nu?</h2>

          {onlyEbooks ? (
            /* E-book specific steps */
            <div className="space-y-6">
              {/* Step 1: Email sent */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">📧 E-post på väg</h3>
                  <p className="text-gray-600 text-sm">
                    Ett mejl med din personliga nerladdningslänk skickas till <strong>{orderDetails?.customerEmail}</strong>.
                    Det kan ta upp till 30 minuter innan mejlet når dig.
                  </p>
                </div>
              </div>

              {/* Step 2: Download link */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">📥 Ladda ner din e-bok</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Klicka på länken i mejlet för att ladda ner din e-bok som PDF. Länken är unik för dig och fungerar i 30 dagar.
                  </p>
                </div>
              </div>

              {/* Step 3: Enjoy */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1"> Njut av att baka glutenfritt!</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Upptäck Ulrikas väg till mer hälsosam brödbakning.
                  </p>
                </div>
              </div>

              {/* Tips box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tips:</strong> Det kan ta upp till 30 minuter innan mejlet når din inkorg. 
                  Kolla även din skräppost-mapp! Mejlet kommer från <strong>Ulrika Davidsson / Functional Foods</strong>.
                </p>
              </div>

              {/* E-book preview */}
              <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-green-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                    <Image
                      src="/baka-glutenfritt.png"
                      alt="Baka Glutenfritt E-bok"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Din e-bok</h4>
                    <p className="text-sm text-gray-600">Baka Glutenfritt – E-bok av Ulrika Davidsson</p>
                    <p className="text-xs text-gray-500 mt-1">PDF-format • 21 recept</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          
          <div className="space-y-6">
              {/* Step 1: Order Confirmation */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">✅ Beställningen är bekräftad</h3>
                  <p className="text-gray-600 text-sm">
                    Din order är genomförd och bekräftad. Du har nu omedelbar tillgång till kursmaterialet.
                  </p>
                </div>
              </div>

              {/* Step 2: Email with credentials */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">📧 Orderbekräftelse via email</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Ett orderkvitto med dina inloggningsuppgifter skickas till <strong>{orderDetails?.customerEmail}</strong>.
                    Det kan ta upp till 30 minuter innan mejlet når dig.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tips:</strong> Kolla även din skräppost-mapp! Mejlet kommer från Ulrika Davidsson / Functional Foods.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Login alternative */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">🔑 Har du inte fått email?</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Inga problem! Du kan alltid återställa ditt lösenord via "Glömt lösenord" på inloggningssidan.
                  </p>
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-sm text-[#014421] hover:text-[#1a5530] font-medium"
                  >
                    Återställ lösenord →
                  </Link>
                </div>
              </div>

              {/* Step 4: Access course */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Book className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">🎓 Kom åt din kurs</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Logga in på ditt konto för att börja din hälsoresa idag!
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#1a5530] transition-colors font-medium"
                  >
                    Logga in och börja
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              {/* If order also has e-books, show download info */}
              {hasEbooks && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">E-bok ingår i din beställning</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Du får ett separat mejl med nerladdningslänk för din e-bok till {orderDetails?.customerEmail}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ett kvitto har skickats till din e-post. Har du frågor?
          </p>
          <Link
            href="/kontakt"
            className="text-[#014421] hover:text-[#1a5530] font-medium"
          >
            Kontakta oss →
          </Link>
        </div>
      </div>
    </div>
  ); 
}
        
export default function SveaSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#014421] mx-auto mb-4" />
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    }>
      <SveaSuccessContent />
    </Suspense>
  );
}
