"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiHeart, FiZap, FiShield, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { GiBrain, GiStomach, GiFruitBowl, GiMeal, GiBodyBalance } from 'react-icons/gi';

export default function LoadingAnalysis() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  
  const messages = [
    { 
      text: "Analyserar dina svar...", 
      icon: GiBrain,
      duration: 2500,
      color: "from-purple-400 to-pink-400"
    },
    { 
      text: "Identifierar näringsbrister...", 
      icon: FiActivity,
      duration: 2000,
      color: "from-blue-400 to-cyan-400"
    },
    { 
      text: "Matchar symptom med lösningar...", 
      icon: GiStomach,
      duration: 2500,
      color: "from-green-400 to-emerald-400"
    },
    { 
      text: "Sammanställer rekommendationer...", 
      icon: GiFruitBowl,
      duration: 2000,
      color: "from-orange-400 to-amber-400"
    },
    { 
      text: "Förbereder din hälsoplan...", 
      icon: FiHeart,
      duration: 1500,
      color: "from-red-400 to-pink-400"
    }
  ];

  const healthTips = [
    "Visste du att magnesium finns i över 300 enzymatiska processer?",
    "Omega-3 fettsyror är avgörande för hjärnhälsan",
    "Din tarmflora påverkar både humör och immunförsvar",
    "Antioxidanter skyddar dina celler från oxidativ stress",
    "B-vitaminer är essentiella för energiproduktion"
  ];

  useEffect(() => {
    // Start showing tips after 2 seconds
    const tipTimer = setTimeout(() => setShowTips(true), 2000);
    
    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      if (showTips) {
        setCurrentTip((prev) => (prev + 1) % healthTips.length);
      }
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
  }, [showTips]);

  const CurrentIcon = messages[messageIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10
            }}
            animate={{ 
              y: -10,
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="max-w-lg w-full mx-4 relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8"
        >
          {/* Animated Icon */}
          <div className="mb-8 relative">
            <motion.div
              key={messageIndex}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-32 h-32 mx-auto relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-0 bg-gradient-to-r ${messages[messageIndex].color} rounded-full opacity-20`}
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-4 bg-gradient-to-r ${messages[messageIndex].color} rounded-full opacity-40`}
              />
              <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CurrentIcon className="w-12 h-12 text-gray-700" />
              </div>
            </motion.div>

            {/* Progress ring */}
            <svg className="absolute inset-0 w-32 h-32 mx-auto -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5 }}
                style={{
                  strokeDasharray: 377,
                  strokeDashoffset: 377 * (1 - progress / 100)
                }}
              />
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
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {messages[messageIndex].text}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
                <span>Vänligen vänta medan vi arbetar</span>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar with percentage */}
          <div className="relative mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Framsteg</span>
              <motion.span
                key={Math.floor(progress)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-semibold text-primary"
              >
                {Math.round(progress)}%
              </motion.span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
              </motion.div>
              {/* Glowing effect at the end */}
              <motion.div
                className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent to-white/50 blur-sm"
                animate={{ left: `${progress - 4}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Health Tips */}
          <AnimatePresence mode="wait">
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <FiZap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentTip}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-gray-700"
                    >
                      {healthTips[currentTip]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completed checkmarks */}
          <div className="mt-6 flex justify-center gap-2">
            {messages.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: index < messageIndex ? 1 : 0.5,
                  opacity: index <= messageIndex ? 1 : 0.3
                }}
                transition={{ delay: index * 0.1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < messageIndex 
                    ? 'bg-green-500 text-white' 
                    : index === messageIndex
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-gray-200'
                }`}
              >
                {index < messageIndex ? (
                  <FiCheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
} 