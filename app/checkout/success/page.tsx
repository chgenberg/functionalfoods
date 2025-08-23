"use client";
import { useCart } from '../../context/CartContext';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiBook, FiPlay, FiMail, FiAlertTriangle } from 'react-icons/fi';
import { GiSparkles } from 'react-icons/gi';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const { clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        const sessionId = searchParams?.get('session_id');
        const paymentIntentId = searchParams?.get('payment_intent');

        if (sessionId) {
          const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (res.ok && (data.payment_status === 'paid' || data.status === 'complete')) {
            setPaymentVerified(true);
            clearCart();
          } else {
            setError(data.error || 'Betalningen kunde inte verifieras.');
          }
        } else if (paymentIntentId) {
          // Fallback for PaymentIntent flow
          const response = await fetch(`/api/verify-payment`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId, paymentMethod: 'stripe' })
          });
          const result = await response.json();
          if (response.ok && result.success && result.status === 'succeeded') {
            setPaymentVerified(true);
            clearCart();
          } else {
            setError(result.error || 'Betalningen kunde inte verifieras.');
          }
        } else {
          setError('Ingen betalningsinformation hittades.');
        }

        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
        const newUserParam = searchParams?.get('new');
        setIsNewUser(newUserParam === 'true');
      } catch (err) {
        setError('Ett fel uppstod vid verifiering av betalningen.');
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [clearCart, searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1a4324] mx-auto mb-6"></div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Verifierar din betalning...</h1>
          <p className="text-gray-600">Vänligen vänta medan vi bekräftar din beställning.</p>
        </div>
      </div>
    );
  }

  if (!paymentVerified || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Betalning ej verifierad</h1>
          <div className="space-y-3 mb-6">
            <p className="text-gray-600">{error || 'Vi kunde inte verifiera din betalning. Ingen beställning har genomförts.'}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">Om du tror att du har blivit debiterad men inte fått tillgång, kontakta kundtjänst.</p>
            </div>
          </div>
          <div className="space-y-4">
            <Link href="/checkout" className="block w-full bg-[#1a4324] text-white text-center py-3 rounded-lg hover:bg-[#9dc46d] hover:text-[#1a4324] transition-colors font-medium">Försök igen</Link>
            <Link href="/kontakt" className="block w-full border-2 border-[#1a4324] text-[#1a4324] text-center py-3 rounded-lg hover:bg-[#1a4324] hover:text-white transition-colors font-medium">Kontakta kundtjänst</Link>
          </div>
        </div>
      </div>
    );
  }

  const getDirectCourseLink = () => {
    if (!user) return '/login';
    if (user.email === 'basics@test.se' || user.email === 'basiconly@test.se') return '/dashboard/courses/functional-basics';
    if (user.email === 'flow@test.se' || user.email === 'flowonly@test.se') return '/dashboard/courses/functional-flow';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{isNewUser ? 'Välkommen till Functional Foods!' : 'Tack för ditt köp!'}</h1>
        <div className="space-y-3 mb-6">
          {isNewUser ? (
            <>
              <p className="text-gray-600">Ditt köp är genomfört och ett konto har skapats åt dig.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2"><FiMail className="w-4 h-4" />Viktigt!</div>
                <p className="text-sm text-blue-700">Vi har skickat dina inloggningsuppgifter till din e-post.</p>
              </div>
            </>
          ) : (
            <p className="text-gray-600">Din beställning är bekräftad och du har nu tillgång till ditt kursmaterial.</p>
          )}
          {user && (<div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-600">Inloggad som: <span className="font-medium">{user.email}</span></p></div>)}
        </div>
        <div className="space-y-4">
          {user ? (
            <>
              <Link href={getDirectCourseLink()} className="block w-full bg-[#1a4324] text-white text-center py-3 rounded-lg hover:bg-[#9dc46d] hover:text-[#1a4324] transition-colors font-medium flex items-center justify-center gap-2"><FiPlay className="w-5 h-5" />{isNewUser ? 'Kom igång med din kurs' : 'Fortsätt till din kurs'}</Link>
              <Link href="/utbildning" className="block w-full border-2 border-[#1a4324] text-[#1a4324] text-center py-3 rounded-lg hover:bg-[#1a4324] hover:text-white transition-colors font-medium flex items-center justify-center gap-2"><FiBook className="w-5 h-5" />Utforska fler kurser</Link>
            </>
          ) : (
            <Link href="/login" className="block w-full bg-[#1a4324] text-white text-center py-3 rounded-lg hover:bg-[#9dc46d] hover:text-[#1a4324] transition-colors font-medium">Logga in för att komma åt dina kurser</Link>
          )}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200"><p className="text-sm text-gray-500 flex items-center justify-center gap-2"><GiSparkles className="w-4 h-4" />Din resa mot bättre hälsa börjar nu!</p></div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
} 