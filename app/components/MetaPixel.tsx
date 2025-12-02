"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * MetaPixel component - Handles consent updates and page view tracking
 * 
 * NOTE: The actual Pixel initialization is done in layout.tsx (inline script)
 * This component only handles:
 * 1. Consent updates when user interacts with cookie banner
 * 2. PageView tracking on route changes (SPA navigation)
 */
function updateMarketingConsentFromStorage() {
  try {
    const raw = localStorage.getItem('cookie-consent');
    const parsed = raw ? JSON.parse(raw) as { preferences?: { marketing?: boolean } } : null;
    const marketingGranted = !!parsed?.preferences?.marketing;
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('consent', marketingGranted ? 'grant' : 'revoke');
      // Fire an immediate PageView once consent is granted
      if (marketingGranted && PIXEL_ID) {
        (window as any).fbq('track', 'PageView');
      }
    }
  } catch {}
}

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname?.startsWith('/admin');

  // Update consent when cookie banner preference changes
  useEffect(() => {
    if (isAdmin) return;
    const onConsent = () => updateMarketingConsentFromStorage();
    window.addEventListener('cookie-consent-updated', onConsent as any);
    // Check existing consent on mount
    updateMarketingConsentFromStorage();
    return () => window.removeEventListener('cookie-consent-updated', onConsent as any);
  }, [isAdmin]);

  // Track page views on route changes (SPA navigation)
  // The initial PageView is handled by the inline script in layout.tsx
  useEffect(() => {
    if (isAdmin) return;
    if (!PIXEL_ID) return;
    // Skip first render - inline script already sent initial PageView
    if (typeof window !== 'undefined' && (window as any).__ff_meta_initial_done) {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'PageView');
      }
    } else {
      // Mark that initial PageView was handled (by inline script)
      (window as any).__ff_meta_initial_done = true;
    }
  }, [pathname, searchParams, isAdmin]);

  // This component doesn't render anything - pixel is loaded in layout.tsx
  return null;
}


