"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Award,
  Book,
  Check,
  ClipboardCheck,
  FileText,
  Gift,
  Heart,
  Microscope,
  Play,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { GiMeal, GiHealthNormal } from "react-icons/gi";
import Image from "next/image";
import HealthQuiz from "./components/HealthQuiz";
import QuizResultScreen from "./components/QuizResultScreen";
import NewsletterSignup from "./components/NewsletterSignup";

import FeaturePopup from "./components/FeaturePopup";
import RecipeCarousel from "./components/RecipeCarousel";
import CustomerReviews from "./components/CustomerReviews";
import CustomerTestimonials from "./components/CustomerTestimonials";
import HomeCoursesSection from "./components/HomeCoursesSection";
import BlogCarousel from "./components/BlogCarousel";
import ProvaPaPopup, { ProvaPaFloatingButton } from "./components/ProvaPaPopup";
import { useT, useLanguage } from "./lib/i18n/LanguageProvider";
import { useSearchParams } from "next/navigation";
import { trackGenerateLead } from "./lib/analytics";
import BookShowcaseSection from "./components/BookShowcaseSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ENABLE_PROVAPA_POPUP =
  process.env.NEXT_PUBLIC_ENABLE_PROVAPA_POPUP === "true";

export default function Home() {
  const t = useT();
  const { locale, setLocale } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    answers: Record<number, string | string[]>;
    context?: any;
  } | null>(null);

  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [showProvaPaPopup, setShowProvaPaPopup] = useState(false);
  const router = useRouter();
  const [showGeoSuggest, setShowGeoSuggest] = useState(false);
  const [suggestedLocale, setSuggestedLocale] = useState<
    "sv" | "en" | "es" | null
  >(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const qp = searchParams?.get("quiz");
      if (qp === "1" || qp === "true") {
        setShowQuiz(true);
      }
    } catch {}
  }, [searchParams]);

  // Disable geo language prompt – we focus on Swedish only for now
  useEffect(() => {
    setShowGeoSuggest(false);
  }, [locale]);

  const handleQuizComplete = (
    answers: Record<number, string | string[]>,
    context?: any,
  ) => {
    setQuizResults({ answers, context });
    setShowQuiz(false);
    try {
      trackGenerateLead("health_quiz");
    } catch {}
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Desktop hero image */}

          <div
            className="hidden lg:block absolute inset-0"
            style={{ zIndex: 1 }}
          >
            <Image
              src="/hero-functional-foods.jpg"
              alt="Functional Foods Hero"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>

          {/* Mobile hero image */}

          <div className="lg:hidden absolute inset-0" style={{ zIndex: 1 }}>
            <Image
              src="/Hem/UDheromobile.jpeg"
              alt="Functional Foods Hero"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>

          <div
            className="absolute inset-0 bg-black/25 pointer-events-none"
            style={{ zIndex: 2 }}
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 w-full">
          <div className="flex items-center min-h-[70vh]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-left drop-shadow-lg">
                Ät dig till bättre hälsa med oss
              </h1>

              <p className="mt-5 text-lg sm:text-xl md:text-2xl text-white/90 text-left max-w-2xl drop-shadow-lg">
                Välj det område du vill förbättra och följ en kurs eller e-bok
                som gör det enkelt att använda Functional Foods i vardagen.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/utbildning"
                  className="inline-flex items-center justify-center gap-2 bg-[#FF7e70] text-white px-8 py-4 rounded-full font-semibold text-base md:text-lg hover:bg-[#e56b5e] transition-all shadow-lg"
                >
                  Program
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/e-bocker"
                  className="inline-flex items-center justify-center gap-2 bg-primary backdrop-blur-sm  text-white px-8 py-4 rounded-full font-semibold text-base md:text-lg hover:bg-green-700 transition-all shadow-lg"
                >
                  E-böcker
                  <Book className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials - directly after hero */}
      <CustomerTestimonials />

      <BookShowcaseSection
        reverse
        title="Grill- & Sommarmat"
        subtitle="Inspireras av"
        description="Passar lika bra till en enkel middag på altanen som till sommarens större grillfester och bufféer."
        image="/grill-sommarmat-square.png"
        href="/e-bocker/grill-sommarmat"
        productId="grill-sommarmat"
        productPrice="149"
        buttonText="Läs mer om boken"
        highlights={[
          {
            title: "Över 90 favoritrecept",
            text: "För vardag, fest och grillkvällar",
          },
          {
            title: "Grillguide i e-boksformat",
            text: "Inspirerande recept och smarta tips",
          },
          {
            title: "Balans, näring och njutning",
            text: " Sommar och grillat går hand i hand",
          },
        ]}
      />

      <HomeCoursesSection />

      <RecipeCarousel />

      {/* Health Test Section with Interactive Frame */}
      <section className="py-14 md:py-20 px-4 bg-gradient-to-b from-white to-[#F3EFE3]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-center justify-items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 max-w-[480px] w-full"
            >
              <div>
                <h2 className="text-4xl md:text-4xl lg:text-6xl font-light text-gray-800 mb-2">
                  Ditt personliga
                </h2>
                <h2 className="text-4xl md:text-4xl lg:text-6xl font-bold text-primary">
                  HÄLSOQUIZ
                </h2>
                <p className="text-lg md:text-base lg:text-lg text-gray-600 mt-4">
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
                    <Target className="w-6 h-6 inline text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Personliga råd
                    </h3>
                    <p className="text-sm text-gray-600">
                      Anpassade rekommendationer just för dig
                    </p>
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
                    <Microscope className="w-6 h-6 inline text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Vetenskaplig grund
                    </h3>
                    <p className="text-sm text-gray-600">
                      Baserat på forskning inom functional foods
                    </p>
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
                    <Zap className="w-6 h-6 inline text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Snabbt resultat
                    </h3>
                    <p className="text-sm text-gray-600">
                      Få dina resultat direkt
                    </p>
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
                  onClick={() => {
                    setShowQuiz(true);
                    try {
                      router.push(`/?quiz=1`);
                    } catch {}
                  }}
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
              className="flex justify-center"
            >
              <div className="relative group cursor-pointer w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] xl:w-[520px] xl:h-[520px]">
                {/* Animated background gradient */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />

                {/* Main container with minimalist frame */}
                <div className="relative w-full h-full">
                  {/* Subtle shadow frame */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl transform translate-x-2 translate-y-2" />

                  {/* Main image container */}
                  <div className="relative w-full h-full overflow-hidden rounded-3xl bg-white p-1">
                    {/* Inner frame with gradient border */}
                    <div className="relative w-full h-full overflow-hidden rounded-[22px] bg-gradient-to-br from-primary via-green-600 to-primary p-[2px]">
                      <div className="relative w-full h-full overflow-hidden rounded-[20px] bg-white">
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
                      <p className="text-sm font-medium text-gray-700">
                        AI-driven analys
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Så här fungerar det - direkt efter Hälsoquiz */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-3 md:mb-4">
              {t("home.how.title", "Så här fungerar det")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                step: "1",
                title: t("home.how.step1.title", "Gör hälsoquizet"),
                desc: t(
                  "home.how.step1.desc",
                  "Besvara några enkla frågor om din hälsa",
                ),
                icon: ClipboardCheck,
              },
              {
                step: "2",
                title: t("home.how.step2.title", "Få din analys"),
                desc: t(
                  "home.how.step2.desc",
                  "Vi analyserar dina svar med AI",
                ),
                icon: Microscope,
              },
              {
                step: "3",
                title: t("home.how.step3.title", "Personlig plan"),
                desc: t(
                  "home.how.step3.desc",
                  "Få skräddarsydda rekommendationer",
                ),
                icon: FileText,
              },
              {
                step: "4",
                title: t("home.how.step4.title", "Börja må bättre"),
                desc: t(
                  "home.how.step4.desc",
                  "Implementera och känn skillnad",
                ),
                icon: Rocket,
              },
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
                  <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2 text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-base px-2 md:px-0">
                    {item.desc}
                  </p>
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

      <CustomerReviews />

      <BlogCarousel />

      <section className="py-12 md:py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup
            variant="hero"
            title={t(
              "newsletter.title",
              "Få de senaste tipsen om Functional Foods",
            )}
            subtitle={t(
              "newsletter.subtitle",
              "Bli först med att få våra bästa råd och recept direkt i din inkorg",
            )}
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
              {t("cta.headline")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-[#112A12]/80 max-w-2xl mx-auto px-4">
              {t("cta.sub")}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowQuiz(true);
                try {
                  router.push("/?quiz=1");
                } catch {}
              }}
              className="bg-[#FF7e70] text-white px-6 sm:px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-[#e56b5e] transition-all shadow-xl md:shadow-2xl inline-flex items-center gap-3 cursor-pointer relative"
              style={{ position: "relative", zIndex: 50 }}
            >
              {t("cta.button")}
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
          <span className="text-sm text-[#112A12]">
            {t("home.geo.seeLang", "Vi ser att ditt språk kan vara ")}
            {suggestedLocale.toUpperCase()}.{" "}
            {t("home.geo.question", "Vill du byta?")}
          </span>
          <button
            className="px-3 py-1.5 rounded-lg bg-[#93C560] text-white text-sm"
            onClick={() => {
              setLocale(suggestedLocale);
              setShowGeoSuggest(false);
            }}
          >
            {t("home.geo.switch", "Byt")}
          </button>
          <button
            className="px-3 py-1.5 rounded-lg bg-[#F3EFE3] text-[#112A12] text-sm"
            onClick={() => setShowGeoSuggest(false)}
          >
            {t("home.geo.noThanks", "Nej tack")}
          </button>
        </div>
      )}

      {ENABLE_PROVAPA_POPUP && (
        <>
          <ProvaPaPopup
            forceOpen={showProvaPaPopup}
            onClose={() => setShowProvaPaPopup(false)}
          />
          <ProvaPaFloatingButton onClick={() => setShowProvaPaPopup(true)} />
        </>
      )}
    </div>
  );
}
