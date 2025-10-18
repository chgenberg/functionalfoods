"use client";

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function updateMarketingConsentFromStorage() {
  try {
    const raw = localStorage.getItem('cookie-consent');
    const parsed = raw ? JSON.parse(raw) as { preferences?: { marketing?: boolean } } : null;
    const marketingGranted = !!parsed?.preferences?.marketing;
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('consent', marketingGranted ? 'grant' : 'revoke');
      // Fire an immediate PageView once consent is granted so pixel activates without waiting for navigation
      if (marketingGranted && PIXEL_ID) {
        (window as any).fbq('track', 'PageView');
      }
    }
  } catch {}
}

function ensureInitialPixelPageViewOnce() {
  try {
    const raw = localStorage.getItem('cookie-consent');
    const parsed = raw ? JSON.parse(raw) as { preferences?: { marketing?: boolean } } : null;
    const marketingGranted = !!parsed?.preferences?.marketing;
    if (!marketingGranted || !PIXEL_ID) return;
    const send = () => {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
        return true;
      }
      return false;
    };
    if (send()) return;
    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (send() || attempts > 20) {
        window.clearInterval(id);
      }
    }, 150);
  } catch {}
}

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname?.startsWith('/admin');

  // Update consent on change from banner
  useEffect(() => {
    if (isAdmin) return; // skip on admin
    const onConsent = () => updateMarketingConsentFromStorage();
    window.addEventListener('cookie-consent-updated', onConsent as any);
    // Run once on mount
    updateMarketingConsentFromStorage();
    ensureInitialPixelPageViewOnce();
    return () => window.removeEventListener('cookie-consent-updated', onConsent as any);
  }, [isAdmin]);

  // Track page views on route changes
  useEffect(() => {
    if (isAdmin) return; // skip on admin
    if (!PIXEL_ID) return;
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname, searchParams, isAdmin]);

  if (isAdmin) return null;
  if (!PIXEL_ID) return null;

  return (
    <>
      {/* Default to revoke until consent banner grants marketing */}
      <Script id="fbp-consent-default" strategy="afterInteractive">
        {`
          window.fbq = window.fbq || function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};
          window._fbq = window._fbq || window.fbq;
          window.fbq('consent','revoke');
        `}
      </Script>
      <Script
        id="fbp-loader"
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/fbevents.js"
        onLoad={() => {
          try {
            updateMarketingConsentFromStorage();
            ensureInitialPixelPageViewOnce();
          } catch {}
        }}
      />
      <Script id="fbp-init" strategy="afterInteractive">
        {`
          if (window.fbq) {
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          }
        `}
      </Script>
      {/* NoScript fallback */}
      <noscript>
        <img height="1" width="1" style={{display:'none'}} alt=""
             src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}


