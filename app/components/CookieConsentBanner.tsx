"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Check, Cookie, Settings, Shield, Target, X } from "lucide-react";;
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsentBanner() {
  const pathname = usePathname();
  // Hide banner on admin routes
  if (pathname?.startsWith('/admin')) return null;
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    saveConsent(allAccepted);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
    setIsVisible(false);
  };

  const handleRejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    saveConsent(onlyNecessary);
    setIsVisible(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    const consent = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    
    // Set actual cookies based on preferences
    if (prefs.analytics) {
      // Enable Google Analytics or similar
      console.log('📊 Analytics cookies enabled');
    }
    
    if (prefs.marketing) {
      // Enable marketing cookies
      console.log('<Target className="w-5 h-5 inline" /> Marketing cookies enabled');
    }
    
    if (prefs.preferences) {
      // Enable preference cookies
      console.log('⚙️ Preference cookies enabled');
    }
    
    console.log('🍪 Cookie preferences saved:', prefs);
    try {
      // Notify listeners (e.g., GA component) that consent was updated
      const evt = new Event('cookie-consent-updated');
      window.dispatchEvent(evt);
    } catch {}
  };

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Nödvändiga cookies',
      description: 'Krävs för att webbplatsen ska fungera korrekt. Kan inte stängas av.',
      icon: <Shield className="w-5 h-5" />,
      required: true,
      enabled: true
    },
    {
      id: 'analytics',
      name: 'Analyscookies',
      description: 'Hjälper oss förstå hur besökare använder webbplatsen för att förbättra den.',
      icon: <BarChart className="w-5 h-5" />,
      required: false,
      enabled: preferences.analytics
    },
    {
      id: 'marketing',
      name: 'Marknadsföringscookies',
      description: 'Används för att visa relevanta annonser och mäta kampanjeffektivitet.',
      icon: <Target className="w-5 h-5" />,
      required: false,
      enabled: preferences.marketing
    },
    {
      id: 'preferences',
      name: 'Inställningscookies',
      description: 'Sparar dina inställningar som språk och andra preferenser.',
      icon: <Settings className="w-5 h-5" />,
      required: false,
      enabled: preferences.preferences
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
          />
          
          {/* Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {!showSettings ? (
                /* Simple consent view */
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#014421]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Cookie className="w-6 h-6 text-[#014421]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#014421] mb-2">
                        Vi använder cookies
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Vi använder cookies för att förbättra din upplevelse och analysera hur webbplatsen används. 
                        Du kan välja vilka cookies du accepterar.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-[#014421] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#112A12] transition-colors"
                    >
                      ✅ Acceptera alla
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSettings(true)}
                        className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-[#93C560] hover:bg-[#93C560]/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={handleRejectOptional}
                        className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        ❌ Endast nödvändiga
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Läs mer i vår{' '}
                    <Link href="/cookie-policy" className="text-[#014421] hover:underline">
                      cookie-policy
                    </Link>
                    {', '}
                    <Link href="/integritetspolicy" className="text-[#014421] hover:underline">
                      integritetspolicy
                    </Link>
                    {' och '}
                    <Link href="/anvandarvillkor" className="text-[#014421] hover:underline">
                      användarvillkor
                    </Link>
                  </p>
                </div>
              ) : (
                /* Detailed settings view */
                <div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-[#014421]">🍪 Cookie-inställningar</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 max-h-80 overflow-y-auto">
                    {cookieTypes.map((cookie) => (
                      <div key={cookie.id} className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
                        <div className="w-10 h-10 bg-[#014421]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {cookie.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-[#014421]">{cookie.name}</h4>
                            <div className="flex items-center gap-2">
                              {cookie.required && (
                                <span className="text-xs bg-[#93C560]/20 text-[#014421] px-2 py-1 rounded-full">
                                  Krävs
                                </span>
                              )}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={cookie.enabled}
                                  disabled={cookie.required}
                                  onChange={(e) => {
                                    if (!cookie.required) {
                                      setPreferences(prev => ({
                                        ...prev,
                                        [cookie.id]: e.target.checked
                                      }));
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${
                                  cookie.enabled ? 'bg-[#014421]' : 'bg-gray-300'
                                }`}>
                                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                                    cookie.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                  } mt-0.5`} />
                                </div>
                              </label>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{cookie.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={handleAcceptSelected}
                      className="flex-1 bg-[#014421] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#112A12] transition-colors"
                    >
                      💾 Spara inställningar
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-4 py-3 border border-[#014421] text-[#014421] rounded-xl hover:bg-[#014421]/10 transition-colors"
                    >
                      ✅ Acceptera alla
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 