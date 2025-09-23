"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Award, Book, Check, ClipboardCheck, FileText, Heart, Microscope, Play, Rocket, Star, Target, TrendingUp, Users, Zap } from "lucide-react";
import { GiMeal, GiHealthNormal } from "react-icons/gi";
import Image from "next/image";
import HealthQuiz from "./components/HealthQuiz";
import QuizResultScreen from "./components/QuizResultScreen";
import NewsletterSignup from "./components/NewsletterSignup";

import FeaturePopup from "./components/FeaturePopup";
import RecipeCarousel from "./components/RecipeCarousel";
import CustomerReviews from "./components/CustomerReviews";
import { useT, useLanguage } from "./lib/i18n/LanguageProvider";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const t = useT();
  const { locale, setLocale } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<{ answers: Record<number, string | string[]>; context?: any } | null>(null);

  const [videosLoaded, setVideosLoaded] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const router = useRouter();
  const [showGeoSuggest, setShowGeoSuggest] = useState(false);
  const [suggestedLocale, setSuggestedLocale] = useState<'sv'|'en'|'es'|null>(null);
  const searchParams = useSearchParams();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [heroInView, setHeroInView] = useState(false);

  useEffect(() => {
    try {
      const qp = searchParams?.get('quiz');
      if (qp === '1' || qp === 'true') {
        setShowQuiz(true);
      }
    } catch {}
  }, [searchParams]);

  useEffect(() => {
    const chosen = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
    if (!chosen) {
      fetch('/api/geo').then(r => r.json()).then(data => {
        if (data?.suggested && data.suggested !== locale) {
          setSuggestedLocale(data.suggested);
          setShowGeoSuggest(true);
        }
      }).catch(() => {});
    }
  }, [locale]);

  // Lazy-load the hero video only when in view
  useEffect(() => {
    if (!heroRef.current) return;
    const el = heroRef.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeroInView(true);
        obs.unobserve(el);
      }
    }, { root: null, threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Ensure playback starts when in view (Safari robustness)
  useEffect(() => {
    if (!heroInView || !videoRef.current) return;
    const v = videoRef.current;
    let attempts = 0;
    const tryPlay = async () => {
      try {
        if (v.paused) {
          await v.play();
        }
      } catch {}
    };
    const id = setInterval(() => {
      attempts += 1;
      if (!v.paused || attempts > 10) clearInterval(id);
      else tryPlay();
    }, 300);
    tryPlay();
    return () => clearInterval(id);
  }, [heroInView]);

  const handleQuizComplete = (answers: Record<number, string | string[]>, context?: any) => {
    setQuizResults({ answers, context });
    setShowQuiz(false);
  };

  const handleRestartQuiz = () => {
    setQuizResults(null);
    setShowQuiz(true);
  };

  if (quizResults) {
    return (
      <QuizResultScreen 
        quizData={quizResults.answers}
        contextData={quizResults.context}
        onRestart={handleRestartQuiz}
      />
    );
  }

  if (showQuiz) {
    return (
        <HealthQuiz 
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Local hero video with poster + fade-in when ready */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 10, opacity: 0, transition: 'opacity .25s ease' }}
            poster="/hero_poster.jpg"
            playsInline
            muted
            // Safari: ensure muted is set before autoplay
            defaultMuted
            loop
            // Autoplay with lightweight initial fetch; use separate sources for mobile/desktop
            autoPlay
            preload="metadata"
            onLoadedMetadata={() => { if (videoRef.current) videoRef.current.style.opacity = '1'; }}
            onCanPlay={() => { if (videoRef.current) videoRef.current.style.opacity = '1'; }}
            onError={(e) => { console.warn('Hero video failed to load', e); }}
          >
            {/* Mobile source */}
            <source src="/introvideo_mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
            {/* Desktop source */}
            <source src="/introvideo_compressed.mp4" type="video/mp4" media="(min-width: 769px)" />
          </video>
          <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{ zIndex: 15 }} />
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/Hem/Bild_till_startsidan.jpg)',
              backgroundColor: '#F3EFE3',
              zIndex: 1
            }}
          >
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                UPPTÄCK KRAFTEN I
                <span className="block text-white mt-2 drop-shadow-lg">
                  FUNCTIONAL FOODS
                </span>
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 leading-relaxed drop-shadow-lg">
                Mat som medicin för kropp och själ
              </p>
              
              <div className="flex flex-col lg:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-[#Ff7e70] hover:bg-[#ff6b5d] text-white px-6 md:px-8 py-4 md:py-5 rounded-full font-semibold text-base md:text-lg shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer relative"
                  style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
                  aria-label="Starta hälsoquiz"
                >
                  Starta Hälsoquiz
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  href="/utbildning"
                  className="bg-white/90 border-2 border-white/30 text-gray-700 px-6 md:px-8 py-4 md:py-5 rounded-full font-semibold text-base md:text-lg hover:bg-white transition-all flex items-center justify-center gap-3"
                  style={{ position: 'relative', zIndex: 50 }}
                >
                  <Book className="w-5 h-5" />
                  {t('home.ourCourses','Våra kurser')}
                </Link>
                <Link
                  href="/kunskapsbank/blogg"
                  className="bg-white/90 border-2 border-white/30 text-gray-700 px-6 md:px-8 py-4 md:py-5 rounded-full font-semibold text-base md:text-lg hover:bg-white transition-all flex items-center justify-center gap-3"
                  style={{ position: 'relative', zIndex: 50 }}
                >
                  <TrendingUp className="w-5 h-5" />
                  {t('home.quickArticles','Snabbläs artiklar')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RecipeCarousel />

      {/* Health Test Section with Interactive Frame */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#F3EFE3]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-800 mb-2">
                  Ditt personliga
                </h2>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
                  HÄLSOQUIZ
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mt-4">
                  Ta 2 minuter för att upptäcka din väg till bättre hälsa
                </p>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <Target className="w-8 h-8 inline text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Personliga råd</h3>
                    <p className="text-sm text-gray-600">Anpassade rekommendationer just för dig</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Microscope className="w-8 h-8 inline text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Vetenskaplig grund</h3>
                    <p className="text-sm text-gray-600">Baserat på forskning inom functional foods</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                    <Zap className="w-8 h-8 inline text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Snabbt resultat</h3>
                    <p className="text-sm text-gray-600">Få dina resultat direkt</p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => setShowQuiz(true)}
                  className="group relative bg-primary hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center gap-3 shadow-lg hover:shadow-xl inline-flex"
                >
                  <span>Starta hälsoquizet</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>

            {/* Right side - Interactive image frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative group cursor-pointer">
                {/* Animated background gradient */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
                
                {/* Main container with minimalist frame */}
                <div className="relative">
                  {/* Subtle shadow frame */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl transform translate-x-2 translate-y-2" />
                  
                  {/* Main image container */}
                  <div className="relative overflow-hidden rounded-3xl bg-white p-1">
                    {/* Inner frame with gradient border */}
                    <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-primary via-green-600 to-primary p-[2px]">
                      <div className="relative overflow-hidden rounded-[20px] bg-white">
                        <Image
                          src="/Ulrika_portratt/Ulrika3.jpg"
                          alt="Ulrika Davidsson"
                          width={600}
                          height={700}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                          priority
                        />
                        
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Interactive corner accents */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Floating UI elements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      2
                    </div>
                    <p className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                      minuter
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute bottom-8 -left-4 bg-white rounded-2xl px-4 py-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-sm font-medium text-gray-700">AI-driven analys</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CustomerReviews />



      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-56 md:h-72 lg:h-96 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src="/Hem/Bild_till_startsidan.jpg"
              alt="Functional Foods"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
            <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs md:text-sm mb-2">
                <span>{t('home.portrait.badge','Functional Foods med Ulrika')}</span>
              </div>
              <p className="text-lg md:text-2xl font-semibold drop-shadow">{t('home.portrait.subtitle','Mat som medicin för kropp och själ')}</p>
            </div>
            {/* Centered CTA */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <a
                href="/utbildning"
                className="pointer-events-auto inline-flex items-center px-6 md:px-8 py-3 md:py-4 rounded-full bg-[#FF7E70] hover:bg-[#ff6b5d] text-white font-semibold shadow-lg transition-colors"
              >
                Köp nu
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-3 md:mb-4">
              {t('home.how.title','Så här fungerar det')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { step: "1", title: t('home.how.step1.title','Gör hälsoquizet'), desc: t('home.how.step1.desc','Besvara några enkla frågor om din hälsa'), icon: ClipboardCheck },
              { step: "2", title: t('home.how.step2.title','Få din analys'), desc: t('home.how.step2.desc','Vi analyserar dina svar med AI'), icon: Microscope },
              { step: "3", title: t('home.how.step3.title','Personlig plan'), desc: t('home.how.step3.desc','Få skräddarsydda rekommendationer'), icon: FileText },
              { step: "4", title: t('home.how.step4.title','Börja må bättre'), desc: t('home.how.step4.desc','Implementera och känn skillnad'), icon: Rocket }
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
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">
                    <item.icon className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto" />
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-base md:text-xl mx-auto mb-3 md:mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 text-xs md:text-base px-2 md:px-0">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup 
            variant="hero"
            title={t('newsletter.title','Få de senaste tipsen om Functional Foods')}
            subtitle={t('newsletter.subtitle','Bli först med att få våra bästa råd och recept direkt i din inkorg')}
            showName={true}
          />
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 md:mb-6 text-[#112A12]">
              {t('cta.headline')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-[#112A12]/80 max-w-2xl mx-auto px-4">
              {t('cta.sub')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('CTA button clicked!');
                setShowQuiz(true);
              }}
              className="bg-[#FF7e70] text-white px-6 sm:px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-[#e56b5e] transition-all shadow-xl md:shadow-2xl inline-flex items-center gap-3 cursor-pointer relative"
              style={{ position: 'relative', zIndex: 50 }}
            >
              {t('cta.button')}
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {selectedFeature && (
        <FeaturePopup
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          feature={selectedFeature}
        />
      )}
      {showGeoSuggest && suggestedLocale && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-[#F3EFE3] rounded-2xl px-4 py-3 flex items-center gap-3 z-50">
          <span className="text-sm text-[#112A12]">{t('home.geo.seeLang','Vi ser att ditt språk kan vara ')}{suggestedLocale.toUpperCase()}. {t('home.geo.question','Vill du byta?')}</span>
          <button className="px-3 py-1.5 rounded-lg bg-[#93C560] text-white text-sm" onClick={() => { setLocale(suggestedLocale); setShowGeoSuggest(false); }}>{t('home.geo.switch','Byt')}</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#F3EFE3] text-[#112A12] text-sm" onClick={() => setShowGeoSuggest(false)}>{t('home.geo.noThanks','Nej tack')}</button>
        </div>
      )}
    </div>
  );
}