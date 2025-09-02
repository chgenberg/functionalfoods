"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { ArrowLeft, Book, Clock, CreditCard, Lock, Minus, Plus, Shield, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { GiSparkles } from 'react-icons/gi';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, isLoaded } = useCart();
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setRemovingItem(id);
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(id);
    setRemovingItem(null);
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-custom section-padding">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Laddar varukorg...</p>
            </div>
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
                <FiShoppingBag className="w-12 h-12 text-blue-600" />
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7e70] text-white rounded-xl font-semibold hover:bg-[#e56b5e] transform hover:scale-[1.02] transition-all"
                >
                  <GiSparkles className="w-5 h-5" />
                  Utforska kurser
                </Link>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-[#93C560] hover:shadow-md transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Tillbaka till startsidan
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-8">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center text-[#014421] hover:text-[#93C560] mb-4 transition-colors group">
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Fortsätt handla
          </Link>
                      <h1 className="text-3xl md:text-4xl font-bold text-[#014421]">
            Din varukorg
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 ${
                  removingItem === item.id ? 'scale-95 opacity-50' : 'hover:shadow-lg'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Course/Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-full sm:w-32 h-32 bg-[#014421] rounded-lg flex items-center justify-center shadow-inner">
                        {item.type === 'course' ? (
                          <GiSparkles className="w-16 h-16 text-white" />
                        ) : (
                          <Book className="w-16 h-16 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.type === 'course' ? 'Online-kurs' : 'Digital bok'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Antal:</span>
                          <div className="flex items-center rounded-lg border-2 border-gray-200 overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-[#93C560]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <FiMinus className="w-4 h-4" />
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
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">
                              {(item.price * item.quantity).toLocaleString()} kr
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500">{item.price} kr/st</p>
                            )}
                          </div>
                          <button 
                            onClick={() => handleRemove(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Ta bort"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Trust badges */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#93C560]/20 rounded-lg">
                    <FiTruck className="w-6 h-6 text-[#014421]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Omedelbar tillgång</p>
                    <p className="text-sm text-gray-600">Direkt efter köp</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#93C560]/20 rounded-lg">
                    <FiShield className="w-6 h-6 text-[#014421]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Säker betalning</p>
                    <p className="text-sm text-gray-600">256-bit SSL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#93C560]/20 rounded-lg">
                    <Clock className="w-6 h-6 text-[#014421]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Livstids tillgång</p>
                    <p className="text-sm text-gray-600">Ingen tidsbegränsning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
              <div className="bg-[#014421] p-6 text-white">
                <h2 className="text-2xl font-bold">Sammanfattning</h2>
              </div>
              
              <div className="p-6">
                {/* Summary items */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Delsumma</span>
                    <span>{total.toLocaleString()} kr</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Moms (25%)</span>
                    <span>Ingår</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Totalt att betala</span>
                      <span className="text-2xl font-bold text-[#014421]">{total.toLocaleString()} kr</span>
                    </div>
                  </div>
                </div>

                {/* Checkout button */}
                <Link 
                  href="/checkout"
                  className="w-full bg-[#FF7e70] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#e56b5e] transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <FiCreditCard className="w-5 h-5" />
                  Gå till kassan
                </Link>

                {/* Payment methods */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-3">Säker betalning</p>
                  <div className="flex items-center gap-3 justify-center flex-wrap">
                    <div className="px-3 py-2 bg-[#93C560]/10 rounded-lg text-sm font-medium flex items-center gap-2 text-[#014421]">
                      <FiCreditCard className="w-4 h-4" />
                      Visa
                    </div>
                    <div className="px-3 py-2 bg-[#93C560]/10 rounded-lg text-sm font-medium flex items-center gap-2 text-[#014421]">
                      <FiCreditCard className="w-4 h-4" />
                      Mastercard
                    </div>
                    <div className="px-3 py-2 bg-[#93C560]/10 rounded-lg text-sm font-medium flex items-center gap-2 text-[#014421]">
                      <FiCreditCard className="w-4 h-4" />
                      Amex
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                    <Lock className="w-3 h-3 mr-1" />
                    256-bit SSL-kryptering
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