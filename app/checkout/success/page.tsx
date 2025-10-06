"use client";
import { useCart } from '../../context/CartContext';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { GiSparkles } from 'react-icons/gi';
import Link from 'next/link';
import { CheckCircle, Book, Play, Mail, AlertTriangle } from 'lucide-react';

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
            <AlertTriangle className="w-8 h-8 text-red-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isNewUser ? 'Välkommen till Functional Foods!' : 'Tack för ditt köp!'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Din betalning har genomförts och du har nu tillgång till dina kurser.
          </p>
        </div>

        {/* What happens now section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Vad händer nu?</h2>
          
          <div className="space-y-6">
            {/* Step 1: Order Confirmation */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">✅ Beställningen är bekräftad</h3>
                <p className="text-gray-600 text-sm">
                  Din order är genomförd och bekräftad. Du har nu omedelbar tillgång till kursmaterialet.
                </p>
              </div>
            </div>

            {/* Step 2: Email with credentials */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">📧 Orderbekräftelse via email</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Ett orderkvitto{isNewUser ? ' med dina inloggningsuppgifter' : ''} skickas till <strong>{user?.email || 'din e-postadress'}</strong>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Tips:</strong> Kolla även din skräppost-mapp om du inte ser emailet inom 5 minuter.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Login alternative */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">🔑 Har du inte fått email?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Inga problem! Du kan alltid återställa ditt lösenord via "Glömt lösenord" på inloggningssidan.
                </p>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 text-sm text-[#014421] hover:text-[#1a5530] font-medium"
                >
                  Återställ lösenord →
                </Link>
              </div>
            </div>

            {/* Step 4: Access course */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Book className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">🎓 Kom åt din kurs</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Logga in på ditt konto för att börja din hälsoresa idag!
                </p>
                {user ? (
                  <Link
                    href={getDirectCourseLink()}
                    className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#1a5530] transition-colors font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Kom igång med din kurs
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#1a5530] transition-colors font-medium"
                  >
                    Logga in och börja
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
            <GiSparkles className="w-5 h-5" />
            Din resa mot bättre hälsa börjar nu!
          </p>
          <p className="text-gray-600">
            Har du frågor?{' '}
            <Link href="/kontakt" className="text-[#014421] hover:text-[#1a5530] font-medium">
              Kontakta oss →
            </Link>
          </p>
        </div>
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