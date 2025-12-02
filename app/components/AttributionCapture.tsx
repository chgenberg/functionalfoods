"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAttributionFromUrl, saveAttribution, readAttribution } from '@/app/lib/attribution';

/**
 * AttributionCapture - Fångar UTM/gclid-parametrar direkt vid sidladdning
 * 
 * Detta sker INNAN consent-bannern visas, så vi missar inte attribution
 * från Google Ads, Meta Ads, eller andra källor.
 * 
 * Data sparas i localStorage och cookie för att användas vid köp.
 */
export default function AttributionCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      // Capture attribution from current URL
      const attr = getAttributionFromUrl();
      
      if (attr) {
        // Only save if we found attribution data
        console.log('📊 Attribution captured:', {
          source: attr.utm_source,
          medium: attr.utm_medium,
          campaign: attr.utm_campaign,
          gclid: attr.gclid ? 'present' : 'none',
          gbraid: attr.gbraid ? 'present' : 'none',
          wbraid: attr.wbraid ? 'present' : 'none'
        });
        
        saveAttribution(attr);
        
        // Also pass to GA4 if available (even without consent, via URL passthrough)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          // Set campaign data for GA4
          const campaignData: Record<string, string> = {};
          if (attr.utm_source) campaignData.campaign_source = attr.utm_source;
          if (attr.utm_medium) campaignData.campaign_medium = attr.utm_medium;
          if (attr.utm_campaign) campaignData.campaign_name = attr.utm_campaign;
          if (attr.utm_term) campaignData.campaign_term = attr.utm_term;
          if (attr.utm_content) campaignData.campaign_content = attr.utm_content;
          
          if (Object.keys(campaignData).length > 0) {
            (window as any).gtag('set', campaignData);
          }
        }
      } else {
        // Check if we have existing attribution stored
        const existing = readAttribution();
        if (existing) {
          console.log('📊 Using existing attribution:', {
            source: existing.utm_source,
            medium: existing.utm_medium,
            captured: existing.ts ? new Date(existing.ts).toISOString() : 'unknown'
          });
        }
      }
    } catch (error) {
      console.error('Attribution capture error:', error);
    }
  }, [searchParams]);

  // This component doesn't render anything
  return null;
}

