"use client";
import { useCart } from '../../context/CartContext';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Link from 'next/link';
import { CheckCircle, Book, Play, Mail, AlertTriangle, Key, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <div className="bg-background-secondary rounded-3xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#014421] mx-auto mb-6"></div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">Verifierar din betalning...</h1>
          <p className="text-text-secondary">Vänligen vänta medan vi bekräftar din beställning.</p>
        </div>
      </div>
    );
  }

  if (!paymentVerified || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <div className="bg-background-secondary rounded-3xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">Betalning ej verifierad</h1>
          <div className="space-y-3 mb-6">
            <p className="text-text-secondary">{error || 'Vi kunde inte verifiera din betalning. Ingen beställning har genomförts.'}</p>
            <div className="bg-[#fff5e6] border border-[#ffc586] rounded-xl p-4">
              <p className="text-sm text-[#8B4513]">Om du tror att du har blivit debiterad men inte fått tillgång, kontakta kundtjänst.</p>
            </div>
          </div>
          <div className="space-y-4">
            <Link href="/checkout" className="block w-full bg-[#014421] text-white text-center py-3 rounded-xl hover:bg-[#116530] transition-colors font-medium">Försök igen</Link>
            <Link href="/kontakt" className="block w-full border-2 border-[#014421] text-[#014421] text-center py-3 rounded-xl hover:bg-[#014421] hover:text-white transition-colors font-medium">Kontakta kundtjänst</Link>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#014421]" />
          </div>
          
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {isNewUser ? 'Välkommen till Functional Foods!' : 'Tack för ditt köp!'}
          </h1>
          
          <p className="text-xl text-text-secondary mb-8">
            Din betalning har genomförts och du har nu tillgång till dina kurser.
          </p>
        </div>

        {/* What happens now section */}
        <div className="bg-background-secondary rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-6 text-center">Vad händer nu?</h2>
          
          <div className="space-y-6">
            {/* Step 1: Order Confirmation */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#014421]" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Beställningen är bekräftad</h3>
                <p className="text-text-secondary text-sm">
                  Din order är genomförd och bekräftad. Du har nu omedelbar tillgång till kursmaterialet.
                </p>
              </div>
            </div>

            {/* Step 2: Email with credentials */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#ffe4e1] rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#FF7e70]" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Orderbekräftelse via email</h3>
                <p className="text-text-secondary text-sm mb-2">
                  Ett orderkvitto{isNewUser ? ' med dina inloggningsuppgifter' : ''} skickas till <strong>{user?.email || 'din e-postadress'}</strong>
                </p>
                <div className="bg-[#fff5e6] border border-[#ffc586] rounded-xl p-3 mt-2">
                  <p className="text-sm text-[#8B4513]">
                    <strong>Tips:</strong> Kolla även din skräppost-mapp om du inte ser emailet inom 5 minuter.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Login alternative */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#f5e9ff] rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-[#7e70ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Har du inte fått email?</h3>
                <p className="text-text-secondary text-sm mb-3">
                  Inga problem! Du kan alltid återställa ditt lösenord via "Glömt lösenord" på inloggningssidan.
                </p>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 text-sm text-[#014421] hover:text-[#116530] font-medium"
                >
                  Återställ lösenord
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Step 4: Access course */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">Kom åt din kurs</h3>
                <p className="text-text-secondary text-sm mb-3">
                  Logga in på ditt konto för att börja din hälsoresa idag!
                </p>
                {user ? (
                  <Link
                    href={getDirectCourseLink()}
                    className="inline-flex items-center gap-2 bg-[#FF7e70] text-white px-6 py-3 rounded-xl hover:bg-[#e56b5e] transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    <Play className="w-4 h-4" />
                    Kom igång med din kurs
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-[#FF7e70] text-white px-6 py-3 rounded-xl hover:bg-[#e56b5e] transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    Logga in och börja
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-text-secondary mb-4">
            Din resa mot bättre hälsa börjar nu!
          </p>
          <p className="text-text-secondary">
            Har du frågor?{' '}
            <Link href="/kontakt" className="text-[#014421] hover:text-[#116530] font-medium">
              Kontakta oss
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