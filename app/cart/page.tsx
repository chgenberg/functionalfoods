"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { ArrowLeft, Book, Check, Clock, CreditCard, Lightbulb, Minus, Plus, Shield, Sparkles, Tag, Trash2, X, Zap } from "lucide-react";;
import Image from 'next/image';
import { useState } from 'react';

// Course images mapping
const courseImages: Record<string, string> = {
  'functional-flow': '/Kurser_bilder/Functional_Gut Health.jpg',
  'functional-basics': '/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg',
  'functional-energy': '/Kurser_bilder/Functional_insulin balance.jpg'
};

// Prefer the image stored on the cart item; fall back to id-based mapping
const getItemImage = (item: { id: string; name: string; image?: string }): string => {
  if (item.image) return item.image;
  if (courseImages[item.id]) return courseImages[item.id];
  return '/images/blog-placeholder.jpg';
};

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
    else setCouponInput('');
    setApplying(false);
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="text-7xl mb-6">🛒</div>
              <h2 className="text-3xl font-bold text-[#014421] mb-4">
                Din varukorg är tom
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Upptäck våra kurser och börja din resa mot bättre hälsa
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/utbildning" 
                  className="inline-flex items-center px-6 py-3 bg-[#014421] text-white font-medium rounded-lg hover:bg-[#116530] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Book className="w-5 h-5 inline mr-2" />
                  Utforska kurser
                </Link>
                <Link 
                  href="/kunskapsbank" 
                  className="inline-flex items-center px-6 py-3 bg-white text-[#014421] font-medium rounded-lg border-2 border-[#93C560] hover:bg-[#93C560]/10 transition-all duration-200"
                >
                  <Lightbulb className="w-5 h-5 inline mr-2" />
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
    <main className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/utbildning"
            className="inline-flex items-center text-gray-600 hover:text-[#014421] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Tillbaka till kurser
          </Link>
          <h1 className="text-3xl font-bold text-[#014421]">
            Din varukorg
          </h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? 'vara' : 'varor'} i varukorgen
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 ${
                  removingItem === item.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={getItemImage(item)}
                      alt={item.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#014421] mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {item.type === 'course' ? '🎓 Online-kurs' : '<Book className="w-5 h-5 inline" /> Digital bok'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={removingItem === item.id}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-medium min-w-[50px] text-center bg-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white transition-colors rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                      <div className="text-xl font-bold text-[#014421]">
                        {Math.round(item.price * item.quantity * 1.25).toLocaleString('sv-SE')} kr
                      </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-gray-500">
                          {Math.round(item.price * 1.25).toLocaleString('sv-SE')} kr/st (inkl. moms)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-[#014421] mb-6">Ordersammanfattning</h2>
              
              {/* Trust Indicators */}
              <div className="space-y-3 mb-6 p-4 bg-[#93C560]/10 rounded-xl">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Zap className="w-6 h-6 inline text-accent" />
                  <span>Omedelbar åtkomst efter köp</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Sparkles className="w-6 h-6 inline text-accent" />
                  <span>1 års åtkomst till material</span>
                </div>
                {/* Removed money-back guarantee row per request */}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rabattkod</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#93C560]/20 border border-[#93C560]">
                    <div className="flex items-center gap-2 text-[#014421] text-sm">
                      <Tag className="w-4 h-4" />
                      <span>Rabattkod tillämpad: <strong>{appliedCoupon.code}</strong></span>
                    </div>
                    <button onClick={removeCoupon} className="text-[#014421] hover:text-gray-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Ange rabattkod"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent"
                    />
                    <button 
                      onClick={handleApplyCoupon} 
                      disabled={applying || !couponInput.trim()} 
                      className="px-4 py-2 bg-[#93C560] text-[#014421] font-medium rounded-lg hover:bg-[#7ab050] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {applying ? '...' : 'Lägg till'}
                    </button>
                  </div>
                )}
                {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-6 border-b border-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {Math.round(item.price * item.quantity * 1.25).toLocaleString('sv-SE')} kr
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delsumma (inkl. moms)</span>
                  <span className="text-gray-900">{Math.round(total * 1.25).toLocaleString('sv-SE')} kr</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#93C560]">Rabatt</span>
                    <span className="text-[#93C560]">-{discount.toLocaleString('sv-SE')} kr</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Moms (25%)</span>
                  <span className="text-gray-900">{Math.round(finalTotal * 0.25).toLocaleString('sv-SE')} kr</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3">
                  <span className="text-[#014421]">Totalt (inkl. moms)</span>
                  <span className="text-[#014421]">{Math.round(finalTotal * 1.25).toLocaleString('sv-SE')} kr</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-[#014421] text-white font-medium py-4 px-6 rounded-lg hover:bg-[#116530] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>🔒</span>
                Säker betalning
              </Link>

              {/* Payment Methods */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mb-3">Vi accepterar</p>
                <div className="flex justify-center items-center gap-3 text-sm text-gray-600">
                  <span><CreditCard className="w-5 h-5 inline" /> Kort</span>
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