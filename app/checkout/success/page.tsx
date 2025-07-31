"use client";
import { useCart } from '../../context/CartContext';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiBook, FiPlay, FiMail } from 'react-icons/fi';
import { GiSparkles } from 'react-icons/gi';
import Link from 'next/link';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Clear the cart after successful purchase
    clearCart();
    
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Check if this is a new user
    const newUserParam = searchParams?.get('new');
    setIsNewUser(newUserParam === 'true');
  }, [clearCart, searchParams]);

  const getDirectCourseLink = () => {
    if (!user) return '/login';
    
    // Smart redirect based on user's purchases or email
    if (user.email === 'basics@test.se' || user.email === 'basiconly@test.se') {
      return '/dashboard/courses/functional-basics';
    } else if (user.email === 'flow@test.se' || user.email === 'flowonly@test.se') {
      return '/dashboard/courses/functional-flow';
    } else {
      // For new purchases, redirect to dashboard which will auto-redirect to the right course
      return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {isNewUser ? 'Välkommen till Functional Foods!' : 'Tack för ditt köp!'}
        </h1>
        
        <div className="space-y-3 mb-6">
          {isNewUser ? (
            <>
              <p className="text-gray-600">
                Ditt köp är genomfört och ett konto har skapats åt dig.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <FiMail className="w-4 h-4" />
                  Viktigt!
                </div>
                <p className="text-sm text-blue-700">
                  Vi har skickat dina inloggningsuppgifter till din e-post. 
                  Kontrollera även skräppost-mappen om du inte hittar mejlet.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600">
              Din beställning är bekräftad och du har nu tillgång till ditt kursmaterial.
            </p>
          )}
          
          {user && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Inloggad som: <span className="font-medium">{user.email}</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {user ? (
            <>
              <Link
                href={getDirectCourseLink()}
                className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiPlay className="w-5 h-5" />
                {isNewUser ? 'Kom igång med din kurs' : 'Fortsätt till din kurs'}
              </Link>
              
              <Link
                href="/utbildning"
                className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FiBook className="w-4 h-4" />
                Utforska fler kurser
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiPlay className="w-5 h-5" />
                Logga in för att komma igång
              </Link>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Om du inte fick ett konto skapat automatiskt, kontakta vår support så hjälper vi dig.
                </p>
              </div>
            </>
          )}
          
          <Link
            href="/"
            className="block w-full text-gray-500 text-center py-2 hover:text-gray-700 transition-colors text-sm"
          >
            Tillbaka till startsidan
          </Link>
        </div>

        {isNewUser && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <GiSparkles className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-green-800 text-sm">Nästa steg:</p>
                <ul className="text-xs text-green-700 mt-1 space-y-1">
                  <li>• Kontrollera din e-post för inloggningsuppgifter</li>
                  <li>• Logga in och börja med din kurs</li>
                  <li>• Utforska kursmaterialet och recepten</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 