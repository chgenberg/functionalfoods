"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function readConsent(): { analytics: boolean; marketing: boolean } {
  try {
    // Primary key used by our banner
    const raw = localStorage.getItem('cookie-consent');
    const parsed = raw ? JSON.parse(raw) as { preferences?: { analytics?: boolean; marketing?: boolean } } : null;
    let analyticsGranted = !!parsed?.preferences?.analytics;
    let marketingGranted = !!parsed?.preferences?.marketing;
    if (!analyticsGranted) {
      // Backwards compatibility: some sessions used 'cookiePrefs'
      const legacyRaw = localStorage.getItem('cookiePrefs');
      const legacy = legacyRaw ? JSON.parse(legacyRaw) as { analytics?: boolean; marketing?: boolean } : null;
      analyticsGranted = !!legacy?.analytics;
      marketingGranted = marketingGranted || !!legacy?.marketing;
    }
    return { analytics: analyticsGranted, marketing: marketingGranted };
  } catch {
    return { analytics: false, marketing: false };
  }
}

function updateConsentFromStorage() {
  try {
    const { analytics: analyticsGranted, marketing: marketingGranted } = readConsent();
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied',
        ad_storage: marketingGranted ? 'granted' : 'denied',
        ad_user_data: marketingGranted ? 'granted' : 'denied',
        ad_personalization: marketingGranted ? 'granted' : 'denied'
      });
      // Fire a single initial page_view regardless of consent (cookieless if denied)
      if (GA_ID && !(window as any).__ff_initial_pv_sent) {
        const pagePath = window.location.pathname + (window.location.search ? `?${window.location.search.substring(1)}` : '');
        (window as any).gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: GA_ID
        });
        (window as any).__ff_initial_pv_sent = true;
      }
    }
  } catch {}
}

function ensureInitialPageViewOnce() {
  try {
    const { analytics: analyticsGranted } = readConsent();
    if (!GA_ID) return;
    if ((typeof window !== 'undefined') && (window as any).__ff_initial_pv_sent) return;
    const send = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const pagePath = window.location.pathname + (window.location.search ? `?${window.location.search.substring(1)}` : '');
        (window as any).gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: GA_ID
        });
        (window as any).__ff_initial_pv_sent = true;
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
      {/* 
        Consent Mode v2 Implementation following Google's documentation:
        https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced
        
        Order is critical:
        1. Set default consent state BEFORE gtag.js loads
        2. Load gtag.js
        3. Configure GA4
        4. Update consent when user interacts with banner
      */}
      
      {/* Step 1: Set default consent state - MUST come before gtag.js */}
      <Script id="ga4-consent-default" strategy="beforeInteractive">
        {`
          // Initialize dataLayer
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          
          // Consent Mode v2 - Set default state to denied
          // This MUST happen before gtag.js loads
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
          
          // URL passthrough: Preserve gclid/utm even when cookies denied
          gtag('set', 'url_passthrough', true);
          
          // Redact ad click identifiers when ad_storage is denied
          gtag('set', 'ads_data_redaction', true);
        `}
      </Script>
      
      {/* Step 2: Load Google tag (gtag.js) */}
      <Script
        id="ga4-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          try {
            // Update consent based on stored preferences
            updateConsentFromStorage();
            ensureInitialPageViewOnce();
          } catch {}
        }}
      />
      
      {/* Step 3: Configure GA4 */}
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: false,
            allow_google_signals: true,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}


