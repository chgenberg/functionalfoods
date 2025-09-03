"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Book, Users, Heart, Zap, Target, Award, Check, Play, Star, ClipboardCheck, Microscope, FileText, Rocket } from "lucide-react";
import { GiFruitBowl, GiMeal, GiHealthNormal } from "react-icons/gi";
import Image from "next/image";
import HealthQuiz from "./components/HealthQuiz";
import QuizResultScreen from "./components/QuizResultScreen";
import NewsletterSignup from "./components/NewsletterSignup";
import ArticleQuickAccess from "./components/ArticleQuickAccess";
import FeaturePopup from "./components/FeaturePopup";
import RecipeCarousel from "./components/RecipeCarousel";
import { useT, useLanguage } from "./lib/i18n/LanguageProvider";

export default function Home() {
  const t = useT();
  const { locale, setLocale } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, string> | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const router = useRouter();
  const [showGeoSuggest, setShowGeoSuggest] = useState(false);
  const [suggestedLocale, setSuggestedLocale] = useState<'sv'|'en'|'es'|null>(null);

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

  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/reviews?status=APPROVED&limit=3');
        const data = await response.json();
        if (data.reviews && Array.isArray(data.reviews)) {
          const formattedTestimonials = data.reviews.map((review: any) => ({
            name: review.user?.name ? review.user.name.split(' ')[0] + ' ' + (review.user.name.split(' ')[1]?.[0] || '') + '.' : 'Anonym',
            text: typeof review.answers === 'object' && review.answers?.feedback 
              ? review.answers.feedback 
              : Array.isArray(review.answers) && review.answers[0]?.a 
                ? review.answers[0].a 
                : 'Fantastisk kurs som verkligen förändrade min hälsa!',
            rating: review.rating || 5
          }));
          setTestimonials(formattedTestimonials);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Fallback to empty array - no testimonials shown if API fails
        setTestimonials([]);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  const handleQuizComplete = (answers: Record<number, string>) => {
    setQuizResults(answers);
    setShowQuiz(false);
  };

  const handleRestartQuiz = () => {
    setQuizResults(null);
    setShowQuiz(true);
  };

  if (quizResults) {
    return (
      <QuizResultScreen 
        quizData={quizResults} 
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
      <ArticleQuickAccess />
      
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
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
          <div className="absolute inset-0 bg-black/40" style={{ zIndex: 15 }} />
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/ulrika-hero-bg.jpg)',
              backgroundColor: '#F3EFE3',
              zIndex: 1
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
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
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-[#Ff7e70] hover:bg-[#ff6b5d] text-white px-8 py-5 rounded-full font-semibold text-lg shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {t('home.startQuiz','Starta Hälsoquiz')}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  href="/utbildning"
                  className="bg-white/90 border-2 border-white/30 text-gray-700 px-8 py-5 rounded-full font-semibold text-lg hover:bg-white transition-all flex items-center justify-center gap-3"
                >
                  <Book className="w-5 h-5" />
                  {t('home.ourCourses','Våra kurser')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RecipeCarousel />

      <section className="py-12 md:py-20 px-4 bg-[#F3EFE3]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-3 md:mb-4">
              {t('home.features.title','Upptäck kraften i ')}<span className="font-bold text-primary">functional foods</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              {t('home.features.subtitle','Få personaliserade rekommendationer baserat på din livsstil och hälsobehov')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                icon: <GiFruitBowl className="w-8 h-8 text-white" />,
                title: t('home.features.card.functional.title','Functional Foods'),
                description: t('home.features.card.functional.desc','Naturliga livsmedel med specifika hälsofördelar'),
                color: "#014421"
              },
              {
                icon: <Target className="w-8 h-8 text-white" />,
                title: t('home.features.card.personalized.title','Personaliserat'),
                description: t('home.features.card.personalized.desc','Anpassat efter dina unika behov och mål'),
                color: "#112A12"
              },
              {
                icon: <Zap className="w-8 h-8 text-white" />,
                title: t('home.features.card.fast.title','Snabba resultat'),
                description: t('home.features.card.fast.desc','Känn skillnad redan efter några veckor'),
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
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-800 group-hover:text-[#014421] transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p>
                                  <div className="mt-4 text-[#93C560] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm">
                  <span>{t('common.readMore','Läs mer')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-56 md:h-72 lg:h-96 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src="/Hem/hero_image.png"
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
              { step: "1", title: t('home.how.step1.title','Ta quizet'), desc: t('home.how.step1.desc','Besvara några enkla frågor om din hälsa'), icon: ClipboardCheck },
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

      <section className="py-12 md:py-20 px-4 bg-[#F3EFE3]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-3 md:mb-4">
              {t('home.testimonials.title','Vad våra kunder säger')}
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
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-[#FFE135] fill-current" />
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
              onClick={() => setShowQuiz(true)}
              className="bg-[#FF7e70] text-white px-6 sm:px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-[#e56b5e] transition-all shadow-xl md:shadow-2xl inline-flex items-center gap-3"
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