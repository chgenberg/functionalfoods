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
import RecipeCarousel from "./components/RecipeCarousel";

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, string> | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const router = useRouter();

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
  }, [testimonials.length]);

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
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Vimeo iframe background for both desktop and mobile */}
          <iframe
            src="https://player.vimeo.com/video/1107419263?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
            className="absolute inset-0"
            style={{ 
              zIndex: 10,
              opacity: 1,
              width: '100vw',
              height: '100vh',
              minWidth: '120%',
              minHeight: '120%',
              left: '-10%',
              top: '-10%',
              transform: 'scale(1.1)',
              objectFit: 'cover'
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
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight drop-shadow-lg">
                UPPTÄCK KRAFTEN I
                <span className="block text-white font-bold drop-shadow-lg">
                  FUNCTIONAL FOODS
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed drop-shadow-lg">
                Mat som medicin för kropp och själ
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-primary hover:bg-secondary text-white px-8 py-5 rounded-full font-semibold text-lg shadow-xl transition-all flex items-center justify-center gap-3"
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
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
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

      {/* Recipe Carousel */}
      <RecipeCarousel />

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
            {[
              {
                icon: <GiFruitBowl className="w-8 h-8" />,
                title: "Functional Foods",
                description: "Naturliga livsmedel med specifika hälsofördelar",
                color: "#014421"
              },
              {
                icon: <FiTarget className="w-8 h-8" />,
                title: "Personaliserat",
                description: "Anpassat efter dina unika behov och mål",
                color: "#112A12"
              },
              {
                icon: <FiZap className="w-8 h-8" />,
                title: "Snabba resultat",
                description: "Känn skillnad redan efter några veckor",
                color: "#014421"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setSelectedFeature(feature)}
                className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-800 group-hover:text-[#1a4324] transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p>
                <div className="mt-4 text-[#9dc46d] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm">
                  <span>Läs mer</span>
                  <FiArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portrait banner under features */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-56 md:h-72 lg:h-96 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src="/ulrika_portratt/Ulrika1.jpeg"
              alt="Ulrika Davidsson"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
            <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs md:text-sm mb-2">
                <span>Functional Foods med Ulrika</span>
              </div>
              <p className="text-lg md:text-2xl font-semibold drop-shadow">Mat som medicin för kropp och själ</p>
            </div>
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
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-base md:text-xl mx-auto mb-3 md:mb-4">
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
      <section className="py-12 md:py-20 px-4 bg-gray-50">
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
      <section className="py-12 md:py-20 px-4 relative z-10">
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

      {/* Feature Popup */}
      {selectedFeature && (
        <FeaturePopup
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          feature={selectedFeature}
        />
      )}
    </div>
  );
}