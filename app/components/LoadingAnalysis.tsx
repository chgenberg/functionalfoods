"use client";
import { useState, useEffect } from 'react';

export default function LoadingAnalysis() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const messages = [
    { text: "Analyserar dina svar...", duration: 3000 },
    { text: "Sammanställer rekommendationer...", duration: 3000 },
    { text: "Snart klart...", duration: 2000 }
  ];

  useEffect(() => {
    const totalDuration = messages.reduce((acc, msg) => acc + msg.duration, 0);
    const progressInterval = 50; // Update every 50ms
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
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Animated Logo/Icon */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-light text-gray-800 mb-2 animate-fade-in">
            {messages[messageIndex].text}
          </h2>
          <p className="text-gray-600 mb-8">
            Vi skapar din personliga hälsoplan
          </p>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {Math.round(progress)}% klart
            </div>
          </div>

          {/* Animated dots */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 