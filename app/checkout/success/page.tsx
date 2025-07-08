"use client";
import { useCart } from '../../context/CartContext';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiBook, FiPlay } from 'react-icons/fi';
import { GiSparkles } from 'react-icons/gi';
import Link from 'next/link';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Clear the cart after successful purchase
    clearCart();
    
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [clearCart]);

  const getDirectCourseLink = (email: string) => {
    // Direct users to their specific course based on email
    if (email === 'basics@test.se') {
      return '/dashboard/courses/functional-basics';
    } else if (email === 'flow@test.se') {
      return '/dashboard/courses/functional-flow';
    } else {
      return '/mina-kurser';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold mb-4">Tack för din beställning!</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              {user ? 
                `Hej ${user.name?.split(' ')[0] || user.email}! Din beställning har bekräftats och du har nu tillgång till dina kurser.` :
                'Din beställning har bekräftats och du kommer att få en bekräftelse via e-post inom kort.'
              }
            </p>
            
            {user && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800">
                  <FiBook className="w-5 h-5" />
                  <span className="font-medium">Kurserna är nu tillgängliga!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Du kan börja med dina kurser direkt genom att klicka på knappen nedan.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {user ? (
              <>
                <Link
                  href={getDirectCourseLink(user.email)}
                  className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiPlay className="w-5 h-5" />
                  Börja med din kurs
                </Link>
                <Link
                  href="/utbildning"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Utforska fler kurser
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login?redirect=/dashboard/courses/functional-basics"
                  className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiPlay className="w-5 h-5" />
                  Logga in för att börja
                </Link>
                <Link
                  href="/utbildning"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Utforska fler kurser
                </Link>
              </>
            )}
            
            <Link
              href="/"
              className="block w-full text-gray-500 text-center py-2 hover:text-gray-700 transition-colors text-sm"
            >
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 