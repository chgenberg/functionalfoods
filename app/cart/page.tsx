"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Sparkles, Package, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setRemovingItem(id);
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(id);
    setRemovingItem(null);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
        <div className="container-custom section-padding">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">Din varukorg är tom</h2>
              <p className="text-lg text-text-secondary mb-8">
                Upptäck våra kurser och börja din resa mot bättre hälsa
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/utbildning" 
                  className="btn-primary inline-flex items-center justify-center group"
                >
                  <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Utforska kurser
                </Link>
                <Link 
                  href="/" 
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Tillbaka till start
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Link 
              href="/utbildning" 
              className="inline-flex items-center text-text-secondary hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Fortsätt handla
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Din varukorg
              <span className="ml-3 text-lg font-normal text-text-secondary">
                ({items.length} {items.length === 1 ? 'produkt' : 'produkter'})
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-fade-in ${
                    removingItem === item.id ? 'opacity-0 transform scale-95' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-32 h-32 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {item.type === 'course' ? (
                          <Package className="w-12 h-12 text-accent" />
                        ) : (
                          <ShoppingBag className="w-12 h-12 text-accent" />
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-primary mb-1">{item.name}</h3>
                          <p className="text-sm text-text-secondary">
                            {item.type === 'course' ? 'Digital kurs' : 'Fysisk bok'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors group"
                          aria-label="Ta bort produkt"
                        >
                          <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-white rounded-md transition-colors"
                            aria-label="Minska antal"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-white rounded-md transition-colors"
                            aria-label="Öka antal"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-text-secondary">
                            {item.price} kr/st
                          </p>
                          <p className="text-xl font-bold text-primary">
                            {item.price * item.quantity} kr
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent" />
                  Ordersammanfattning
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-text-secondary">
                    <span>Delsumma</span>
                    <span>{total} kr</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Frakt</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-primary">Totalt</span>
                      <span className="text-2xl font-bold text-primary">{total} kr</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Inkl. moms</p>
                  </div>
                </div>

                <Link 
                  href="/checkout" 
                  className="btn-primary w-full flex items-center justify-center group mb-4"
                >
                  <CreditCard className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Gå till kassan
                </Link>

                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-2">
                    🔒 Säker betalning med SSL-kryptering
                  </p>
                  <p className="text-xs text-text-secondary">
                    Vi accepterar alla vanliga betalsätt
                  </p>
                </div>

                {/* Benefits */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span className="text-text-secondary">30 dagars öppet köp</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span className="text-text-secondary">Livstids tillgång till kurser</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span className="text-text-secondary">Personlig support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 