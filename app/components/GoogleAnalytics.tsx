"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function readAnalyticsConsent(): boolean {
  try {
    // Primary key used by our banner
    const raw = localStorage.getItem('cookie-consent');
    const parsed = raw ? JSON.parse(raw) as { preferences?: { analytics?: boolean } } : null;
    let granted = !!parsed?.preferences?.analytics;
    if (!granted) {
      // Backwards compatibility: some sessions used 'cookiePrefs'
      const legacyRaw = localStorage.getItem('cookiePrefs');
      const legacy = legacyRaw ? JSON.parse(legacyRaw) as { analytics?: boolean } : null;
      granted = !!legacy?.analytics;
    }
    return granted;
  } catch {
    return false;
  }
}

function updateConsentFromStorage() {
  try {
    const analyticsGranted = readAnalyticsConsent();
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied',
        ad_storage: 'denied'
      });
      // Fire an immediate page_view once consent is granted so GA4 activates without waiting for navigation
      if (analyticsGranted && GA_ID) {
        const pagePath = window.location.pathname + (window.location.search ? `?${window.location.search.substring(1)}` : '');
        (window as any).gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: GA_ID
        });
      }
    }
  } catch {}
}

function ensureInitialPageViewOnce() {
  try {
    const analyticsGranted = readAnalyticsConsent();
    if (!analyticsGranted || !GA_ID) return;
    const send = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const pagePath = window.location.pathname + (window.location.search ? `?${window.location.search.substring(1)}` : '');
        (window as any).gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: GA_ID
        });
        return true;
      }
      return false;
    };
    // Try immediately, then a few retries while script initializes
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

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname?.startsWith('/admin');

  // Update consent on load and when banner saves
  useEffect(() => {
    if (isAdmin) return; // skip on admin
    const onConsent = () => updateConsentFromStorage();
    window.addEventListener('cookie-consent-updated', onConsent as any);
    // run once on mount
    updateConsentFromStorage();
    // and ensure first page_view after GA loads if consent already granted
    ensureInitialPageViewOnce();
    return () => window.removeEventListener('cookie-consent-updated', onConsent as any);
  }, [isAdmin]);

  // Send page_view on route changes
  useEffect(() => {
    if (isAdmin) return; // skip on admin
    if (!GA_ID) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: url,
        send_to: GA_ID
      });
    }
  }, [pathname, searchParams, isAdmin]);

  if (isAdmin) return null;
  if (!GA_ID) return null;

  return (
    <>
      {/* Default to denied; consent will be updated by banner */}
      <Script id="ga4-consent" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          try {
            updateConsentFromStorage();
            ensureInitialPageViewOnce();
          } catch {}
        }}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}


