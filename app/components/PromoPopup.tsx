'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const STORAGE_KEY = 'promo_popup_last_shown';
  const SHOW_INTERVAL_DAYS = 3;

  useEffect(() => {
    // Wait 2 seconds after page load
    const timer = setTimeout(() => {
      checkAndShowPopup();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const checkAndShowPopup = () => {
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      const now = new Date().getTime();

      if (!lastShown) {
        // First time - show popup
        setIsOpen(true);
        localStorage.setItem(STORAGE_KEY, now.toString());
        return;
      }

      const lastShownTime = parseInt(lastShown);
      const daysSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60 * 24);

      if (daysSinceLastShown >= SHOW_INTERVAL_DAYS) {
        setIsOpen(true);
        localStorage.setItem(STORAGE_KEY, now.toString());
      }
    } catch (error) {
      console.error('Error checking popup state:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
            aria-label="Stäng"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Content */}
          <div className="flex flex-col md:flex-row items-center">
            {/* Image */}
            <div className="w-full md:w-2/3 relative">
              <img
                src="/pop-up-okt-2025.png"
                alt="Kampanjerbjudande"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* CTA Button */}
            <div className="w-full md:w-1/3 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-[#F3EFE3] to-[#FEFDF9]">
              <a
                href="/boken" 
                onClick={handleClose}
                className="inline-block bg-gradient-to-r from-[#014421] to-[#1a5c35] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center"
              >
                LÄS MER HÄR!
              </a>
              <p className="text-xs text-gray-600 mt-4 text-center">
                Erbjudandet gäller till och med 31 oktober
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

