"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { ArrowLeft, Book, Clock, CreditCard, Lock, Minus, Plus, Shield, ShoppingBag, Trash2, Truck, Tag, X } from 'lucide-react';
import { GiSparkles } from 'react-icons/gi';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, isLoaded, discount, finalTotal, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleRemove = async (id: string) => {
    setRemovingItem(id);
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(id);
    setRemovingItem(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError(null);
    const res = await applyCoupon(couponInput.trim());
    if (!res.success) setCouponError(res.message || 'Ogiltig rabattkod');
    setApplying(false);
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ShoppingBag className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Din varukorg är tom
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Upptäck våra kurser och börja din resa mot bättre hälsa
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/utbildning" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Book className="w-5 h-5 mr-2" />
                  Utforska kurser
                </Link>
                <Link 
                  href="/kunskapsbank" 
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Kunskapsbank
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/utbildning"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Tillbaka
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Din varukorg
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'vara' : 'varor'}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Dina varor</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-6 transition-all duration-300 ${
                      removingItem === item.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Book className="w-8 h-8 text-blue-500" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.type === 'course' ? 'Online-kurs' : 'Digital bok'}</p>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center rounded-lg border-2 border-gray-200 overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-[#93C560]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium min-w-[50px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-[#93C560]/20 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {(item.price * item.quantity).toLocaleString('sv-SE')} kr
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-sm text-gray-500">
                                  {item.price.toLocaleString('sv-SE')} kr/st
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={removingItem === item.id}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ordersammanfattning</h2>
              
              {/* Trust Indicators */}
              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-6 h-6 text-[#014421]" />
                  <span>Omedelbar åtkomst efter köp</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <GiSparkles className="w-6 h-6 text-[#014421]" />
                  <span>Livstidsåtkomst till material</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-6 h-6 text-[#014421]" />
                  <span>30 dagars pengarna-tillbaka-garanti</span>
                </div>
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

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {(item.price * item.quantity).toLocaleString('sv-SE')} kr
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delsumma</span>
                    <span className="text-gray-900">{total.toLocaleString('sv-SE')} kr</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Rabatt</span>
                      <span>-{discount.toLocaleString('sv-SE')} kr</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold mt-2">
                    <span>Totalt</span>
                    <span>{finalTotal.toLocaleString('sv-SE')} kr</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inklusive moms</p>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-[#014421] to-[#93C560] text-white font-semibold py-4 px-6 rounded-xl hover:from-[#116530] hover:to-[#7ab050] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Säker betalning
              </Link>

              {/* Payment Methods */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mb-3">Vi accepterar</p>
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-6 bg-red-500 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-6 bg-yellow-500 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-6 bg-purple-600 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </main>
  );
} 