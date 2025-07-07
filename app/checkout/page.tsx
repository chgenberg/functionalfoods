"use client";
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCreditCard, FiLock, FiUser } from 'react-icons/fi';
import { GiSparkles } from 'react-icons/gi';
import Link from 'next/link';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'klarna' | 'swish' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handlePayment = async (provider: 'klarna' | 'swish') => {
    if (!user) {
      setError('Du måste vara inloggad för att köpa kurser');
      return;
    }

    setIsProcessing(true);
    setSelectedPayment(provider);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Skicka köpet till API:et
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items,
          paymentMethod: provider
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel med betalningen');
      }

      // Rensa varukorgen
      clearCart();
      
      // Redirect till success-sidan
      router.push('/checkout/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel med betalningen');
    } finally {
      setIsProcessing(false);
      setSelectedPayment(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 animate-fade-in">
        <GiSparkles className="w-16 h-16 text-accent mb-6" />
        <h2 className="text-2xl font-semibold mb-4">Din varukorg är tom</h2>
        <p className="text-text-secondary mb-8 text-center max-w-md">Lägg till produkter för att komma igång med din beställning</p>
        <button 
          onClick={() => router.push('/utbildning')} 
          className="btn-primary flex items-center gap-2 group"
        >
          Utforska kurser
          <FiArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-light mb-4">
              Kassa
            </h1>
            <p className="text-text-secondary">
              Nästan klar! Välj betalningsmetod för att slutföra din beställning.
            </p>
          </div>

          {/* Visa inloggningskrav om användaren inte är inloggad */}
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <FiUser className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Logga in för att fortsätta</p>
                  <p className="text-sm text-yellow-600">Du måste vara inloggad för att köpa kurser och få tillgång till materialet.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/login"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Logga in
                </Link>
                <Link
                  href="/login"
                  className="bg-white border border-yellow-300 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  Skapa konto
                </Link>
              </div>
            </div>
          )}

          {/* Visa felmeddelande */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fade-in">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <GiSparkles className="w-6 h-6 text-accent" />
                  <h2 className="text-xl font-semibold">Din beställning</h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background-secondary transition-colors">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-text-secondary">{item.type === 'course' ? 'Kurs' : 'Bok'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price * item.quantity} kr</p>
                        <p className="text-sm text-text-secondary">{item.quantity} st</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Totalt</span>
                    <span className="text-2xl font-semibold text-accent">{total} kr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <FiCreditCard className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Betalningsmetod</h2>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => handlePayment('klarna')} 
                    disabled={isProcessing || !user}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPayment === 'klarna' 
                        ? 'border-accent bg-accent/5' 
                        : 'border-border hover:border-accent/50'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#ffb3c7] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">K</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Klarna</p>
                        <p className="text-sm text-text-secondary">Betala senare eller i delbetalningar</p>
                      </div>
                    </div>
                    {selectedPayment === 'klarna' && isProcessing ? (
                      <FiLock className="w-4 h-4 text-accent animate-spin" />
                    ) : selectedPayment === 'klarna' ? (
                      <GiSparkles className="w-5 h-5 text-accent" />
                    ) : null}
                  </button>

                  <button 
                    onClick={() => handlePayment('swish')} 
                    disabled={isProcessing || !user}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPayment === 'swish' 
                        ? 'border-accent bg-accent/5' 
                        : 'border-border hover:border-accent/50'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#5cc900] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">S</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Swish</p>
                        <p className="text-sm text-text-secondary">Betala direkt med Swish</p>
                      </div>
                    </div>
                    {selectedPayment === 'swish' && isProcessing ? (
                      <FiLock className="w-4 h-4 text-accent animate-spin" />
                    ) : selectedPayment === 'swish' ? (
                      <GiSparkles className="w-5 h-5 text-accent" />
                    ) : null}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-background rounded-xl flex items-start gap-3">
                  <FiLock className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Säker betalning</p>
                    <p className="text-xs text-text-secondary">Alla betalningar är säkra och krypterade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 