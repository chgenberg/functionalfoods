"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  Calendar,
  Utensils,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProvaPaPopupProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function ProvaPaPopup({
  forceOpen,
  onClose,
}: ProvaPaPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if popup was already shown this session
    const dismissed = sessionStorage.getItem("provaPaPopupDismissed");
    if (dismissed) {
      setHasBeenDismissed(true);
      return;
    }

    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle forceOpen prop
  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    sessionStorage.setItem("provaPaPopupDismissed", "true");
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Popup container - wrapper for centering, inner div for animation */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                aria-label="Stäng"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Image section */}
              <div className="relative h-48 sm:h-56">
                <Image
                  src="/sota-godsaker-popup.png"
                  alt="Söta Godsaker"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-[#014421] text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    109 kr
                  </div>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                    Ny e-bok: Sockerfria & glutenfria bakverk
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base mt-1">
                    med Functional Foods
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Över 50 favoritrecept på kakor, bullar och desserter – utan
                  gluten och vitt socker. Perfekt för dig som vill baka både
                  godare och smartare hemma.
                </p>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-[#014421]/5 rounded-xl">
                    <Calendar className="w-5 h-5 mx-auto text-[#014421] mb-1" />
                    <span className="text-xs text-gray-700 font-medium">
                      Glutenfritt
                    </span>
                  </div>
                  <div className="text-center p-3 bg-[#014421]/5 rounded-xl">
                    <Utensils className="w-5 h-5 mx-auto text-[#014421] mb-1" />
                    <span className="text-xs text-gray-700 font-medium">
                      50+ recept
                    </span>
                  </div>
                  <div className="text-center p-3 bg-[#014421]/5 rounded-xl">
                    <ShoppingCart className="w-5 h-5 mx-auto text-[#014421] mb-1" />
                    <span className="text-xs text-gray-700 font-medium">
                      109 kr
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link href="/e-bocker/sota-godsaker" onClick={handleClose}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#014421] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#116530] transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    Köp e-boken nu
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>

                <p className="text-center text-xs text-gray-500 mt-4">
                  • Boken skickas som pdf direkt
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating button component
export function ProvaPaFloatingButton({ onClick }: { onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after popup has been dismissed
    const checkDismissed = () => {
      const dismissed = sessionStorage.getItem("provaPaPopupDismissed");
      setIsVisible(!!dismissed);
    };

    // Check immediately
    checkDismissed();

    // Also check on storage changes (for when popup is closed)
    const handleStorageChange = () => checkDismissed();
    window.addEventListener("storage", handleStorageChange);

    // Check periodically (fallback for same-tab updates)
    const interval = setInterval(checkDismissed, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="fixed bottom-24 sm:bottom-20 left-6 z-50 bg-[#014421] text-white shadow-xl hover:shadow-2xl hover:bg-[#116530] transition-all rounded-full flex items-center gap-2 group"
    >
      {/* Desktop version */}
      <span className="hidden sm:flex items-center gap-2 px-5 py-3 font-semibold">
        <Sparkles className="w-4 h-4" />
        Söta Godsaker
      </span>
      {/* Mobile version */}
      <span className="sm:hidden flex items-center gap-2 px-4 py-3 font-semibold text-sm">
        <Sparkles className="w-4 h-4" />
        Söta Godsaker
      </span>
    </motion.button>
  );
}
