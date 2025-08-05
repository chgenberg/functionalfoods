"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiBook, FiUsers, FiHeart, FiZap, FiTarget, FiAward, FiCheck, FiPlay, FiStar } from "react-icons/fi";
import { GiFruitBowl, GiMeal, GiHealthNormal } from "react-icons/gi";
import Image from "next/image";
import HealthQuiz from "./components/HealthQuiz";
import QuizResultScreen from "./components/QuizResultScreen";
import NewsletterSignup from "./components/NewsletterSignup";
import ArticleQuickAccess from "./components/ArticleQuickAccess";
import FeaturePopup from "./components/FeaturePopup";

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, string> | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const router = useRouter();

  const handleQuizComplete = (answers: Record<number, string>) => {
    console.log('Quiz completed with answers:', answers);
    setQuizResults(answers);
    setShowQuiz(false);
  };

  const handleRestartQuiz = () => {
    setQuizResults(null);
    setShowQuiz(true);
  };

  // If showing quiz results, render them inline
  if (quizResults) {
    return (
      <QuizResultScreen 
        quizData={quizResults} 
        onRestart={handleRestartQuiz}
      />
    );
  }

  // If showing quiz, render it as overlay
  if (showQuiz) {
    return (
        <HealthQuiz 
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Article Quick Access Button */}
      <ArticleQuickAccess />
      {/* Force deployment refresh */}
      
      {/* Hero Section with Working Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Vimeo video background */}
        <div className="absolute inset-0 z-0">
          {/* Vimeo iframe background for both desktop and mobile */}
          <iframe
            src="https://player.vimeo.com/video/1107419263?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              zIndex: 10,
              opacity: 1,
              width: '100vw',
              height: '100vh',
              minWidth: '100%',
              minHeight: '100%'
            }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Functional Foods Hero Video"
          />
          
          {/* Video overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" style={{ zIndex: 15 }} />
          
          {/* Fallback background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/ulrika-hero-bg.jpg)',
              backgroundColor: '#f0fdf4',
              zIndex: 1
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/40 to-blue-900/50" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight drop-shadow-lg">
                UPPTÄCK KRAFTEN I
                <span className="block text-green-400 font-bold drop-shadow-lg">
                  FUNCTIONAL FOODS
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed drop-shadow-lg">
                Mat som medicin för kropp och själ
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-5 rounded-full font-semibold text-lg shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  Starta Hälsoquiz
                  <FiArrowRight className="w-5 h-5" />
                </button>
                <Link
                  href="/utbildning"
                  className="bg-white/90 border-2 border-white/30 text-gray-700 px-8 py-5 rounded-full font-semibold text-lg hover:bg-white transition-all flex items-center justify-center gap-3"
                >
                  <FiBook className="w-5 h-5" />
                  Våra kurser
                </Link>
              </div>
            </div>

            {/* Right content - Hero image */}
            <div className="relative">
              <img
                src="/udavidsson.PNG"
                alt="Ulrika Davidsson"
                className="rounded-3xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    UD
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Ulrika Davidsson</p>
                    <p className="text-sm text-gray-600">Functional Foods Expert</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-gray-600 text-sm ml-2">25+ års erfarenhet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple test sections */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Video Test Results</h2>
          <p className="text-xl text-gray-600">Check if the video played above. If not, there's a browser/platform issue.</p>
        </div>
      </section>
    </div>
  );
}