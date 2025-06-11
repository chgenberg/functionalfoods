"use client";
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const { items, total } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (provider: 'klarna' | 'stripe') => {
    setIsProcessing(true);
    try {
      // Here you would integrate with Klarna or Stripe
      // For now, we'll just simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page
      router.push('/checkout/success');
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle error appropriately
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Din varukorg är tom</h2>
        <p className="text-gray-600 mb-6">Lägg till kurser eller böcker för att komma igång</p>
        <button
          onClick={() => router.push('/utbildning')}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Utforska kurser
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-8">Kassa</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Din beställning</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.type === 'course' ? 'Kurs' : 'Bok'}</p>
                  </div>
                  <p className="font-medium">{item.price * item.quantity} kr</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Totalt</span>
                <span className="text-2xl font-semibold">{total} kr</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Betalningsmetod</h2>
            <div className="space-y-4">
              <button
                onClick={() => handlePayment('klarna')}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-[#ffb3c7] text-white py-3 rounded-lg hover:bg-[#ffb3c7]/90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Bearbetar...' : 'Betala med Klarna'}
              </button>
              <button
                onClick={() => handlePayment('stripe')}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-[#635bff] text-white py-3 rounded-lg hover:bg-[#635bff]/90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Bearbetar...' : 'Betala med Stripe'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 