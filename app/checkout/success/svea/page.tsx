'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Book, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

function SveaSuccessContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkoutOrderId = searchParams?.get('checkoutOrderId');
    const orderId = searchParams?.get('orderId');
    
    if (checkoutOrderId || orderId) {
      verifyPayment(checkoutOrderId, orderId);
    } else {
      setError('Ingen orderinformation hittades');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (checkoutOrderId: string | null, orderId: string | null) => {
    try {
      const response = await fetch('/api/checkout/verify-svea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutOrderId, orderId })
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderDetails(data.order);
      } else {
        setError(data.error || 'Kunde inte verifiera betalningen');
      }
    } catch (err) {
      setError('Ett fel uppstod vid verifiering av betalningen');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto mb-4"></div>
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
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#1a5530] transition-colors"
          >
            Försök igen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tack för ditt köp!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Din betalning har genomförts och du har nu tillgång till dina kurser.
          </p>
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
                    <span className="font-medium">{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Betalningsmetod:</span>
                    <span className="font-medium">Svea Ekonomi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Betald</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Kunduppgifter</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">E-post:</span>
                    <span className="font-medium">{orderDetails.customerEmail}</span>
                  </div>
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
                <h3 className="font-semibold text-gray-900 mb-4">Köpta kurser</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Book className="w-5 h-5 text-[#014421]" />
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">Kvantitet: {item.quantity}</p>
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

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nästa steg</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#014421] to-[#1a5530] text-white rounded-xl hover:from-[#1a5530] hover:to-[#014421] transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Starta dina kurser</h3>
                <p className="text-white/90 text-sm">Gå till din dashboard och börja lära</p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/dashboard/downloads"
              className="flex items-center gap-4 p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-[#014421] rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Ladda ner material</h3>
                <p className="text-gray-600 text-sm">PDF:er och kursmaterial</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    }>
      <SveaSuccessContent />
    </Suspense>
  );
}
