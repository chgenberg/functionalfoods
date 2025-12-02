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
        const pageViewParams: Record<string, any> = {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: GA_ID
        };
        // Include campaign data if available
        const campaign = (window as any).__ff_campaign;
        if (campaign) {
          Object.assign(pageViewParams, campaign);
        }
        (window as any).gtag('event', 'page_view', pageViewParams);
        (window as any).__ff_initial_pv_sent = true;
      }
    }
  } catch {}
}

function ensureInitialPageViewOnce() {
  try {
    if (!GA_ID) return;
    if ((typeof window !== 'undefined') && (window as any).__ff_initial_pv_sent) return;
    const send = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const pagePath = window.location.pathname + (window.location.search ? `?${window.location.search.substring(1)}` : '');
        const pageViewParams: Record<string, any> = {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: GA_ID
        };
        // Include campaign data if available
        const campaign = (window as any).__ff_campaign;
        if (campaign) {
          Object.assign(pageViewParams, campaign);
        }
        (window as any).gtag('event', 'page_view', pageViewParams);
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
      const pageViewParams: Record<string, any> = {
        page_title: document.title,
        page_location: window.location.href,
        page_path: url,
        send_to: GA_ID
      };
      // Include campaign data if available (for proper attribution across navigation)
      const campaign = (window as any).__ff_campaign;
      if (campaign) {
        Object.assign(pageViewParams, campaign);
      }
      (window as any).gtag('event', 'page_view', pageViewParams);
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
      
      {/* Step 3: Configure GA4 with campaign data from URL and localStorage */}
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Extract campaign parameters from URL OR localStorage (for returning visitors)
          (function() {
            try {
              var params = new URLSearchParams(window.location.search);
              var campaignConfig = {
                send_page_view: false, // We send manually for better control
                allow_google_signals: true,
                allow_ad_personalization_signals: false
              };
              
              // First, try to get from URL (fresh visit)
              var utm_source = params.get('utm_source');
              var utm_medium = params.get('utm_medium');
              var utm_campaign = params.get('utm_campaign');
              var utm_term = params.get('utm_term');
              var utm_content = params.get('utm_content');
              var gclid = params.get('gclid');
              var gbraid = params.get('gbraid');
              var wbraid = params.get('wbraid');
              var fbclid = params.get('fbclid');
              
              // If no URL params, try localStorage (returning visitor)
              if (!utm_source && !gclid && !gbraid && !wbraid && !fbclid) {
                try {
                  var stored = localStorage.getItem('ff_attribution');
                  if (stored) {
                    var attr = JSON.parse(stored);
                    // Only use if captured within last 30 days
                    var daysSinceCapture = attr.ts ? (Date.now() - attr.ts) / (1000 * 60 * 60 * 24) : 999;
                    if (daysSinceCapture < 30) {
                      utm_source = attr.utm_source || null;
                      utm_medium = attr.utm_medium || null;
                      utm_campaign = attr.utm_campaign || null;
                      utm_term = attr.utm_term || null;
                      utm_content = attr.utm_content || null;
                      gclid = attr.gclid || null;
                      gbraid = attr.gbraid || null;
                      wbraid = attr.wbraid || null;
                      console.log('📊 GA4: Using stored attribution from', new Date(attr.ts).toLocaleDateString());
                    }
                  }
                } catch(e) {}
              }
              
              // Add campaign parameters if present
              if (utm_source) campaignConfig.campaign_source = utm_source;
              if (utm_medium) campaignConfig.campaign_medium = utm_medium;
              if (utm_campaign) campaignConfig.campaign_name = utm_campaign;
              if (utm_term) campaignConfig.campaign_term = utm_term;
              if (utm_content) campaignConfig.campaign_content = utm_content;
              
              // Google Ads auto-tagging (gclid, gbraid, wbraid)
              if (gclid || gbraid || wbraid) {
                campaignConfig.campaign_source = campaignConfig.campaign_source || 'google';
                campaignConfig.campaign_medium = campaignConfig.campaign_medium || 'cpc';
              }
              
              // Meta/Facebook auto-tagging
              if (fbclid) {
                campaignConfig.campaign_source = campaignConfig.campaign_source || 'facebook';
                campaignConfig.campaign_medium = campaignConfig.campaign_medium || 'cpc';
              }
              
              // Store campaign data globally for use in manual page_view events
              window.__ff_campaign = campaignConfig.campaign_source ? {
                campaign_source: campaignConfig.campaign_source,
                campaign_medium: campaignConfig.campaign_medium,
                campaign_name: campaignConfig.campaign_name,
                campaign_term: campaignConfig.campaign_term,
                campaign_content: campaignConfig.campaign_content
              } : null;
              
              gtag('config', '${GA_ID}', campaignConfig);
              
              // Log for debugging
              if (campaignConfig.campaign_source) {
                console.log('📊 GA4 Campaign:', campaignConfig.campaign_source, '/', campaignConfig.campaign_medium);
              }
            } catch(e) {
              console.error('GA4 config error:', e);
              gtag('config', '${GA_ID}', {
                send_page_view: false,
                allow_google_signals: true,
                allow_ad_personalization_signals: false
              });
            }
          })();
        `}
      </Script>
    </>
  );
}


