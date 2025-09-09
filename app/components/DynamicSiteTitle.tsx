"use client";

import { useSiteConfig } from '../hooks/useSiteConfig';

interface DynamicSiteTitleProps {
  fallback?: string;
  className?: string;
}

export default function DynamicSiteTitle({ 
  fallback = 'Functional Foods',
  className = '' 
}: DynamicSiteTitleProps) {
  const { siteName, loading } = useSiteConfig();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <span className={className}>
      {siteName || fallback}
    </span>
  );
} 