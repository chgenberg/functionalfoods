"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GiBrain, GiStomach, GiFruitBowl, GiMeal, GiBodyBalance, GiHeartBeats, GiMeditation } from 'react-icons/gi';
import { Activity, Heart, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react';

export default function LoadingAnalysis({ totalMs = 45000 }: { totalMs?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  
  // Define steps and scale durations to totalMs
  const stepWeights = [0.24, 0.22, 0.20, 0.18, 0.16];
  const scaledDurations = stepWeights.map(w => Math.max(1000, Math.round(totalMs * w)));

  const messages = [
    { text: "Analyserar dina svar...", icon: GiBrain, duration: scaledDurations[0], color: "from-purple-400 to-pink-400", subtext: "Vi går igenom din hälsoprofil" },
    { text: "Identifierar näringsbrister...", icon: Activity, duration: scaledDurations[1], color: "from-blue-400 to-cyan-400", subtext: "Matchar symptom med näringsämnen" },
    { text: "Skapar personlig hälsoplan...", icon: GiStomach, duration: scaledDurations[2], color: "from-green-400 to-emerald-400", subtext: "Anpassar rekommendationer efter dina behov" },
    { text: "Väljer functional foods...", icon: GiFruitBowl, duration: scaledDurations[3], color: "from-orange-400 to-amber-400", subtext: "Hittar rätt livsmedel för dig" },
    { text: "Förbereder din rapport...", icon: Heart, duration: scaledDurations[4], color: "from-red-400 to-pink-400", subtext: "Sammanställer alla insikter" }
  ];

  const healthTips = [
    { icon: "💡", text: "Visste du att magnesium finns i över 300 enzymatiska processer?" },
    { icon: "🧠", text: "Omega-3 fettsyror är avgörande för hjärnhälsan" },
    { icon: "🦠", text: "Din tarmflora påverkar både humör och immunförsvar" },
    { icon: "🛡️", text: "Antioxidanter skyddar dina celler från oxidativ stress" },
    { icon: "⚡", text: "B-vitaminer är essentiella för energiproduktion" },
    { icon: "💤", text: "Kvalitetssömn är grunden för återhämtning" },
    { icon: "🌿", text: "Gröna bladgrönsaker innehåller viktiga mineraler" }
  ];

  useEffect(() => {
    // Start showing tips after 1 second
    const tipTimer = setTimeout(() => setShowTips(true), 1000);
    
    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length);
    }, 3000);

    const totalDuration = messages.reduce((acc, msg) => acc + msg.duration, 0);
    const progressInterval = 50;
    const progressIncrement = 100 / (totalDuration / progressInterval);
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + progressIncrement;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, progressInterval);

    let currentTime = 0;
    let currentMessageIndex = 0;
    
    const messageTimer = setInterval(() => {
      currentTime += 100;
      let accumulatedTime = 0;
      for (let i = 0; i < messages.length; i++) {
        accumulatedTime += messages[i].duration;
        if (currentTime < accumulatedTime) {
          if (currentMessageIndex !== i) {
            currentMessageIndex = i;
            setMessageIndex(i);
          }
          break;
        }
      }
    }, 100);

    return () => {
      clearTimeout(tipTimer);
      clearInterval(tipInterval);
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [totalMs]);

  const CurrentIcon = messages[messageIndex].icon;

  // Simple fallback during SSR
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <GiBrain className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analyserar dina svar...</h2>
            <p className="text-gray-600 mb-6">Vi skapar personliga rekommendationer baserat på din hälsoprofil</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)` }}
            initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 10 }}
            animate={{ y: -10, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200) }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
          />
        ))}
      </div>

      <div className="max-w-4xl w-full mx-4 relative">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 grid md:grid-cols-2 gap-8">
          {/* Left Column - Main Animation */}
          <div>
            {/* Animated Icon */}
            <div className="mb-8 relative">
              <motion.div key={messageIndex} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-32 h-32 mx-auto relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={`absolute inset-0 bg-gradient-to-r ${messages[messageIndex].color} rounded-full opacity-20`} />
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`absolute inset-4 bg-gradient-to-r ${messages[messageIndex].color} rounded-full opacity-40`} />
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CurrentIcon className="w-12 h-12 text-gray-700" />
                </div>
              </motion.div>

              {/* Progress ring */}
              <svg className="absolute inset-0 w-32 h-32 mx-auto -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200" />
                <motion.circle cx="64" cy="64" r="60" stroke="url(#gradient)" strokeWidth="4" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: progress / 100 }} transition={{ duration: 0.5 }} style={{ strokeDasharray: 377, strokeDashoffset: 377 * (1 - progress / 100) }} />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Message with animation */}
            <AnimatePresence mode="wait">
              <motion.div key={messageIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{messages[messageIndex].text}</h2>
                <p className="text-sm text-gray-600">{messages[messageIndex].subtext}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 bg-primary rounded-full" />
                  <span>Analyserar din hälsoprofil</span>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar with percentage */}
            <div className="relative mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Total progress</span>
                <motion.span key={Math.floor(progress)} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-semibold text-primary">{Math.round(progress)}%</motion.span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
                <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}>
                  <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                </motion.div>
                <motion.div className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent to-white/50 blur-sm" animate={{ left: `${progress - 4}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>

            {/* Completed checkmarks */}
            <div className="flex justify-center gap-2">
              {messages.map((_, index) => (
                <motion.div key={index} initial={{ scale: 0 }} animate={{ scale: index < messageIndex ? 1 : 0.5, opacity: index <= messageIndex ? 1 : 0.3 }} transition={{ delay: index * 0.1 }} className={`w-8 h-8 rounded-full flex items-center justify-center ${index < messageIndex ? 'bg-primary text-white' : index === messageIndex ? 'bg-gradient-to-r from-primary to-accent text-white' : 'bg-gray-200'}`}>
                  {index < messageIndex ? (<CheckCircle className="w-4 h-4" />) : (<span className="text-xs font-medium">{index + 1}</span>)}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Tips & AI Info */}
          <div>
            <AnimatePresence mode="wait">
              {showTips && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Hälsotips</h4>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{healthTips[currentTip].icon}</span>
                    <AnimatePresence mode="wait">
                      <motion.p key={currentTip} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-gray-700">{healthTips[currentTip].text}</motion.p>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <GiBrain className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-gray-700">AI-driven analys</h4>
              </div>
              <p className="text-xs text-gray-600">Vi använder avancerad AI för att skapa personliga rekommendationer baserat på dina svar och symptom.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
} 