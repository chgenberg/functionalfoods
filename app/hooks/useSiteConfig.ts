"use client";

import { useState, useEffect } from 'react';

interface SiteConfig {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  maintenanceMode: boolean;
  lastUpdated: number;
}

const defaultConfig: SiteConfig = {
  siteName: 'Functional Foods',
  primaryColor: '#014421',
  secondaryColor: '#93C560',
  contactEmail: 'info@functionalfoods.se',
  maintenanceMode: false,
  lastUpdated: Date.now()
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSiteConfig();
  }, []);

  const loadSiteConfig = async () => {
    try {
      const response = await fetch('/api/site-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        
        // Apply CSS custom properties for dynamic colors
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--color-primary', data.primaryColor);
          document.documentElement.style.setProperty('--color-secondary', data.secondaryColor);
        }
      } else {
        throw new Error('Failed to load site config');
      }
    } catch (err) {
      console.error('Failed to load site configuration:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshConfig = () => {
    setLoading(true);
    loadSiteConfig();
  };

  return {
    config,
    loading,
    error,
    refreshConfig,
    // Convenience getters
    siteName: config.siteName,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    contactEmail: config.contactEmail,
    isMaintenanceMode: config.maintenanceMode
  };
} 