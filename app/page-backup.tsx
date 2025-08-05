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

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, string> | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const router = useRouter();

  // Simple video autoplay attempt
  useEffect(() => {
    const attemptVideoPlay = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.play().catch(() => {
          // Silently fail - the fallback image will show
        });
      });
    };

    // Try on mount
    attemptVideoPlay();

    // Try on first user interaction
    const handleInteraction = () => {
      attemptVideoPlay();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const handleQuizComplete = (answers: Record<number, string>) => {
    console.log('Quiz completed with answers:', answers);
    setQuizResults(answers);
    setShowQuiz(false);
  };

  const handleRestartQuiz = () => {
    setQuizResults(null);
    setShowQuiz(true);
  };

  const testimonials = [
    {
      name: "Maria L.",
      text: "Efter 3 veckor med Functional Foods känner jag mig som en ny människa!",
      rating: 5
    },
    {
      name: "Johan K.",
      text: "Äntligen ett program som faktiskt fungerar. Min energi är på topp!",
      rating: 5
    },
    {
      name: "Anna S.",
      text: "Ulrika är fantastisk! Hon har hjälpt mig att helt förändra min hälsa.",
      rating: 5
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <GiFruitBowl className="w-8 h-8" />,
      title: "Functional Foods",
      description: "Naturliga livsmedel med specifika hälsofördelar",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: "Personaliserat",
      description: "Anpassat efter dina unika behov och mål",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Snabba resultat",
      description: "Känn skillnad redan efter några veckor",
      color: "from-purple-400 to-purple-600"
    }
  ];

  const benefits = [
    { icon: "🧬", text: "Vetenskapligt baserat" },
    { icon: "💪", text: "Ökad energi" },
    { icon: "🛡️", text: "Stärkt immunförsvar" },
    { icon: "🧠", text: "Bättre fokus" },
    { icon: "😊", text: "Förbättrat humör" },
    { icon: "💤", text: "Bättre sömn" }
  ];

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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Article Quick Access Button */}
      <ArticleQuickAccess />
      
      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video/Image background */}
        <div className="absolute inset-0 z-0">
          {/* Fallback background image - always visible */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/ulrika-hero-bg.jpg)',
              backgroundColor: '#f0fdf4'
            }}
          >
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/40 to-blue-900/50" />
          </div>
          
          {/* Desktop video - simplified approach */}
          {!videoError && (
            <video
              key="desktop-video"
              autoPlay
              loop
              muted
              playsInline
              className={`hidden md:block absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onCanPlayThrough={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
            >
              <source src="/introvideo_compressed.mp4" type="video/mp4" />
            </video>
          )}
          
          {/* Mobile video - simplified approach */}
          {!videoError && (
            <video
              key="mobile-video"
              autoPlay
              loop
              muted
              playsInline
              className={`block md:hidden absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onCanPlayThrough={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
            >
              <source src="/introvideo_mobile.mp4" type="video/mp4" />
            </video>
          )}
          
          {/* Enhanced overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50" />
        </div>

        {/* Animated background - now with lower opacity to blend with video */}
        <div className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-white/10 to-blue-50/20" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-20 md:-top-40 -right-20 md:-right-40 w-48 md:w-96 h-48 md:h-96 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full opacity-30 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-20 md:-bottom-40 -left-20 md:-left-40 w-48 md:w-96 h-48 md:h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full opacity-30 blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left content - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
                UPPTÄCK KRAFTEN I
                <span className="block text-accent font-bold drop-shadow-lg">
            FUNCTIONAL FOODS
                </span>
          </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed drop-shadow-lg">
            Mat som medicin för kropp och själ
          </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuiz(true)}
                  className="group bg-primary text-white px-6 md:px-8 py-4 md:py-5 rounded-full font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl hover:bg-secondary transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              Starta Hälsoquiz
                  <FiArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <Link
                  href="/utbildning"
                  className="bg-white/90 backdrop-blur-sm border-2 border-white/30 text-gray-700 px-6 md:px-8 py-4 md:py-5 rounded-full font-semibold text-base md:text-lg hover:border-primary hover:text-primary hover:bg-white transition-all flex items-center justify-center gap-3"
                >
                  <FiBook className="w-4 h-4 md:w-5 md:h-5" />
                  Våra kurser
                </Link>
              </div>

              {/* Benefits list - Mobile Optimized */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-white/90 justify-center lg:justify-start bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                  >
                    <span className="text-xl md:text-2xl">{benefit.icon}</span>
                    <span className="text-xs sm:text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right content - Hero image - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="relative">
                {/* Desktop Image */}
                <div className="hidden md:block">
                  <img
                    src="/udavidsson.PNG"
                    alt="Ulrika Davidsson"
                    className="rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl w-full h-auto"
                  />
                </div>
                {/* Mobile Image */}
                <div className="block md:hidden">
                  <img
                    src="/udavidsson_mobile.PNG"
                    alt="Ulrika Davidsson" 
                    className="rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl w-full h-auto"
                  />
                </div>
                {/* Floating card - Mobile Optimized */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 max-w-[280px] md:max-w-xs"
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-full flex items-center justify-center text-white font-bold text-base md:text-xl">
                      UD
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm md:text-base">Ulrika Davidsson</p>
                      <p className="text-xs md:text-sm text-gray-600">Functional Foods Expert</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                    ))}
                    <span className="text-gray-600 text-xs md:text-sm ml-2">25+ års erfarenhet</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - Mobile Optimized */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-0.5 h-2 md:w-1 md:h-3 bg-white/60 rounded-full mt-1.5 md:mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-3 md:mb-4">
              Upptäck kraften i <span className="font-bold text-primary">functional foods</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Få personaliserade rekommendationer baserat på din livsstil och hälsobehov
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-3 md:mb-4">
              Så här <span className="font-bold text-primary">fungerar det</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { step: "1", title: "Ta quizet", desc: "Besvara några enkla frågor om din hälsa", icon: "📝" },
              { step: "2", title: "Få din analys", desc: "Vi analyserar dina svar med AI", icon: "🔬" },
              { step: "3", title: "Personlig plan", desc: "Få skräddarsydda rekommendationer", icon: "📋" },
              { step: "4", title: "Börja må bättre", desc: "Implementera och känn skillnad", icon: "🚀" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">{item.icon}</div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-base md:text-xl mx-auto mb-3 md:mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 text-xs md:text-base px-2 md:px-0">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FiArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4 bg-background-secondary">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-3 md:mb-4">
              Vad våra kunder <span className="font-bold text-primary">säger</span>
          </h2>
          </motion.div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 shadow-lg md:shadow-xl"
              >
                <div className="flex items-center gap-1 mb-4 md:mb-6 justify-center md:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-4 md:mb-6 italic text-center md:text-left">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <p className="font-semibold text-gray-800 text-center md:text-left">
                  — {testimonials[activeTestimonial].name}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6 md:mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? "w-8 bg-primary"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
              </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup 
            variant="hero"
            title="Få de senaste tipsen om Functional Foods"
            subtitle="Bli först med att få våra bästa råd och recept direkt i din inkorg"
            showName={true}
          />
          </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 md:mb-6">
              Redo att transformera din hälsa?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 opacity-90 max-w-2xl mx-auto px-4">
              Starta din resa mot optimal hälsa med vårt personliga hälsoquiz
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuiz(true)}
              className="bg-white text-primary px-6 sm:px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-gray-100 transition-all shadow-xl md:shadow-2xl inline-flex items-center gap-3"
            >
              Starta ditt quiz nu
              <FiArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}