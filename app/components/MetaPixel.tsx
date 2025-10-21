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
      {/* Initialize fbq stub and load script inline for better reliability */}
      <Script id="fbp-init" strategy="beforeInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('consent', 'revoke');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
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


