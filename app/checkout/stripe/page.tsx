'use client';

import { useEffect, useState, Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null as any);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${typeof window !== 'undefined' ? window.location.origin : 'https://functionalfoods.se'}/checkout/success`,
        receipt_email: user?.email,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'Ett fel uppstod med din betalning.');
      } else {
        setMessage('Ett oväntat fel uppstod.');
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4">
      <PaymentElement />
      {message && <div className="text-red-600 text-sm mt-3">{message}</div>}
      <button disabled={!stripe || isLoading} className="mt-4 w-full bg-[#1a4324] text-white py-3 rounded-lg disabled:opacity-60">
        {isLoading ? 'Bearbetar...' : 'Betala nu'}
      </button>
    </form>
  );
}

function StripePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientSecret = searchParams.get('client_secret');

  useEffect(() => {
    if (!clientSecret) {
      router.push('/checkout');
    }
  }, [clientSecret, router]);

  if (!clientSecret || !publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4324]"></div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#1a4324',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1a4324]">Slutför din beställning</h1>
          <p className="text-gray-600 mt-2">Betala säkert med kort via Stripe</p>
        </div>

        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">🔒 Säker betalning med 256-bitars SSL-kryptering</p>
        </div>
      </div>
    </div>
  );
}

export default function StripePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4324]"></div>
      </div>
    }>
      <StripePageContent />
    </Suspense>
  );
} 