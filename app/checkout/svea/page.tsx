"use client";
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function SveaCheckoutPage() {
  const router = useRouter();
  const { items, total, discount, finalTotal, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try to get checkout data from session storage first
    const storedData = sessionStorage.getItem('checkout_data');
    
    if (storedData) {
      const checkoutData = JSON.parse(storedData);
      initializeCheckout(checkoutData);
    } else if (items.length > 0) {
      // If user is not logged in, we require checkout details (name/email) from /checkout
      if (!user) {
        router.push('/checkout');
        return;
      }
      // Logged-in users can continue without stored checkout data
      initializeCheckout();
    } else {
      const activeCheckout = sessionStorage.getItem('svea_checkout_id') || sessionStorage.getItem('svea_order_id');
      if (activeCheckout) {
        // Vi är mitt i ett Svea-flöde: stanna kvar så iframe kan fortsätta
        setIsLoading(false);
        return;
      }
      router.push('/cart');
    }
  }, []);

  const initializeCheckout = async (checkoutData?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use provided checkout data or build from cart
      const data = checkoutData || {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type
        })),
        customer: user ? {
          id: user.id,
          email: user.email,
          name: user.name
        } : undefined,
        couponCode: appliedCoupon?.code,
      };

      // Call new Svea V2 endpoint
      const response = await fetch('/api/checkout/svea-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout');
      }

      if (result.gui?.snippet) {
        setCheckoutHtml(result.gui.snippet);
        
        // Store order ID for success page
        sessionStorage.setItem('svea_order_id', result.orderId);
        sessionStorage.setItem('svea_checkout_id', result.checkoutOrderId.toString());
        
      } else {
        throw new Error('No checkout GUI received');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  // Inject checkout HTML when available
  useEffect(() => {
    if (checkoutHtml && checkoutContainerRef.current) {
      // Clear any existing content
      checkoutContainerRef.current.innerHTML = '';
      
      // Create a wrapper div
      const wrapper = document.createElement('div');
      wrapper.innerHTML = checkoutHtml;
      
      // Append all children to the container
      while (wrapper.firstChild) {
        checkoutContainerRef.current.appendChild(wrapper.firstChild);
      }

      // Execute any scripts in the HTML
      const scripts = checkoutContainerRef.current.getElementsByTagName('script');
      Array.from(scripts).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [checkoutHtml]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#014421] mx-auto mb-4" />
          <p className="text-gray-600">Förbereder betalning...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-light text-gray-900 mb-4">Ett fel uppstod</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/cart"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till varukorgen
              </Link>
              <button
                onClick={initializeCheckout}
                className="px-6 py-3 bg-[#014421] text-white rounded-lg hover:bg-[#1a5530] transition-colors"
              >
                Försök igen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link 
            href="/cart" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Tillbaka till varukorgen
          </Link>
          <h1 className="text-3xl font-light text-gray-900">Slutför din betalning</h1>
          <p className="mt-2 text-gray-600">Säker betalning med Svea Ekonomi</p>
        </div>

        {/* Svea Checkout Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div 
            ref={checkoutContainerRef}
            className="svea-checkout-container"
            style={{ minHeight: '600px' }}
          />
        </div>

        {/* Info text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Din betalning hanteras säkert av Svea Ekonomi. 
            Du kan betala med kort, Swish, faktura eller delbetalning.
          </p>
          <p className="mt-2">
            Vid frågor, kontakta oss på{' '}
            <a href="mailto:support@ulrikafunctionalfoods.com" className="text-[#014421] hover:underline">
              support@ulrikafunctionalfoods.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
