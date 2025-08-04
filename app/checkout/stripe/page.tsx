'use client';

import { useEffect, useState, Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        receipt_email: user?.email,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || 'Ett fel uppstod med din betalning.');
      } else {
        setMessage('Ett oväntat fel uppstod.');
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Kortbetalning</h2>
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>
      
      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{message}</p>
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Bearbetar betalning...
          </div>
        ) : (
          'Betala nu'
        )}
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

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
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
          <h1 className="text-2xl font-bold text-gray-900">Slutför din beställning</h1>
          <p className="text-gray-600 mt-2">Betala säkert med kort via Stripe</p>
        </div>

        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Säker betalning med 256-bitars SSL-kryptering
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StripePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <StripePageContent />
    </Suspense>
  );
} 