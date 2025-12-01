"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Lock, Gift, Sparkles, X, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CORRECT_PASSWORD = "Christmas";

export default function EbookPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Show popup after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Fel lösenord. Försök igen!");
      setPassword("");
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = "/E-bok.pdf";
    link.download = "Functional-Foods-E-bok.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a472a] via-[#0d3320] to-[#0a2818] relative overflow-hidden">
      {/* Decorative Christmas elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Snowflakes */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/20"
            initial={{ 
              top: -20, 
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.4,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{ 
              top: "110%",
              rotate: 360
            }}
            transition={{ 
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto w-full">
          
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              // Password screen
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {/* Christmas gift header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl shadow-red-500/30"
                >
                  <Gift className="w-12 h-12 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                >
                  Exklusiv E-bok
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-white/80 mb-8 max-w-xl mx-auto"
                >
                  Ange lösenordet du fick vid ditt köp för att ladda ner din e-bok
                </motion.p>

                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onSubmit={handleSubmit}
                  className="max-w-md mx-auto"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-white/40" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ange lösenord..."
                      className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-all text-lg"
                    />
                  </div>
                  
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 mb-4 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-3"
                  >
                    Lås upp
                    <Lock className="w-5 h-5" />
                  </motion.button>
                </motion.form>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-white/50 text-sm"
                >
                  Har du inte köpt en kurs ännu?{" "}
                  <Link href="/utbildning" className="text-white/80 hover:text-white underline transition-colors">
                    Se våra kurser
                  </Link>
                </motion.p>
              </motion.div>
            ) : (
              // Download screen
              <motion.div
                key="download"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {/* Book presentation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="relative mb-8"
                >
                  {/* Glow effect behind book */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-80 h-80 bg-gradient-to-br from-yellow-400/20 via-red-500/20 to-green-500/20 rounded-full blur-3xl" />
                  </div>
                  
                  {/* Book image */}
                  <div className="relative mx-auto max-w-md">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotateY: [0, 2, 0, -2, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative"
                    >
                      {/* Book shadow */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/30 rounded-full blur-xl" />
                      
                      {/* Book image container */}
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/50 border-4 border-white/10">
                        <Image
                          src="/julbok.png"
                          alt="Functional Foods E-bok"
                          width={400}
                          height={500}
                          className="w-full h-auto"
                          priority
                        />
                        
                        {/* Shimmer effect */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  Din E-bok är redo!
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-white/80 mb-8 max-w-xl mx-auto"
                >
                  Klicka på knappen nedan för att ladda ner din exklusiva Functional Foods e-bok
                </motion.p>

                {/* Download button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-full shadow-2xl shadow-green-500/30 transition-all disabled:opacity-70"
                >
                  {isDownloading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Download className="w-6 h-6" />
                      </motion.div>
                      Laddar ner...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Ladda ner E-bok (PDF)
                    </>
                  )}
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-w-lg mx-auto"
                >
                  <h3 className="text-white font-semibold mb-2">Tack för ditt köp!</h3>
                  <p className="text-white/70 text-sm">
                    Vi hoppas att du kommer ha stor nytta av denna e-bok på din resa mot bättre hälsa med functional foods.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Christmas Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-lg w-full bg-gradient-to-br from-[#1a472a] to-[#0d3320] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative sparkles */}
              <div className="absolute top-4 left-4 text-yellow-400/60">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="absolute top-12 right-16 text-yellow-400/40">
                <Sparkles className="w-4 h-4" />
              </div>

              {/* Popup image */}
              <div className="relative">
                <Image
                  src="/pop_up_jul.png"
                  alt="Jul-erbjudande"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
                
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a472a] via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 pt-0 -mt-8 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <Link
                    href="/utbildning"
                    onClick={() => setShowPopup(false)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-xl rounded-full shadow-xl shadow-red-500/30 transition-all"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      KÖP NU!
                    </motion.button>
                  </Link>
                  
                  <p className="mt-4 text-white/60 text-sm">
                    Köp valfri kurs och få e-boken på köpet!
                  </p>
                </motion.div>
              </div>

              {/* Bottom decorative border */}
              <div className="h-2 bg-gradient-to-r from-red-500 via-green-500 to-red-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

