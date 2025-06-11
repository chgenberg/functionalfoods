"use client";
import { useCart } from '../../context/CartContext';
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart after successful purchase
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Tack för din beställning!</h1>
          <p className="text-gray-600 mb-8">
            Din beställning har bekräftats och du kommer att få en bekräftelse via e-post inom kort.
          </p>
          <div className="space-y-4">
            <Link
              href="/utbildning"
              className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Utforska fler kurser
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 