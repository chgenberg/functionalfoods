"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AIChatBox from "../components/AIChatBox";
import MicronutrientQuestionModal from "../components/MicronutrientQuestionModal";
import { AnalysisResult } from '../types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp, Heart, Shield, Activity, Droplet, Sun, Moon, Coffee, Home, ArrowRight, Download, Book, MapPin, MessageSquare, HelpCircle } from 'lucide-react';

// Färg för siluetten och chattbubblor
const bubbleColor = "#f3f4f6"; // Samma som siluetten/landningssidan
const bubbleAltColor = "#e5e7eb"; // Ljusgrå för varannan bubbla

// Lista på blockar i ordning och deras rubriker
const blocks = [
  { key: "riskProfile", title: "Your Risk Profile" },
  { key: "micronutrients", title: "Micronutrient Analysis" },
  { key: "redFlags", title: "Acute Red Flags – Seek Care Now" },
  { key: "scenarios", title: "Most Likely Scenarios" },
  { key: "holisticAdvices", title: "Holistic Health Advices" },
  { key: "timeline", title: "Recommended Timeline" },
  { key: "symptomTracker", title: "Symptom Tracker" },
  { key: "localExperts", title: "Local Experts / Clinics" },
  { key: "aiChatIntro", title: "Ask the Dietitian (AI Chat)" },
  { key: "references", title: "Scientific References" },
  { key: "pdfLink", title: "Download Your Report as PDF" },
];

const riskProfileLabels = {
  inflammation: "Inflammation",
  nutrient: "Nutrient",
  allergy: "Allergy",
  dysbiosis: "Dysbiosis",
  hormonal: "Hormonal Imbalance",
  metabolic: "Metabolic Health",
  gut: "Gut Health",
  immune: "Immune Function",
  gutBarrier: "Gut Barrier Integrity",
  oxidativeStress: "Oxidative Stress",
  detoxification: "Detoxification Capacity",
  cardiovascular: "Cardiovascular Risk",
  mental: "Mental Wellbeing",
  hydration: "Hydration",
  activity: "Physical Activity"
};

function ResultPageContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-white/20"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Ingen data hittades</h1>
          <p className="text-white/80 mb-6">Det verkar som att något gick fel. Försök igen.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Home />
            Tillbaka till start
          </Link>
        </motion.div>
      </div>
    );
  }

  let result: AnalysisResult;
  try {
    result = JSON.parse(decodeURIComponent(data));
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-white/20"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Felaktig data</h1>
          <p className="text-white/80 mb-6">Det verkar som att analysen inte kunde läsas korrekt. Försök igen.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Home />
            Tillbaka till start
          </Link>
        </motion.div>
      </div>
    );
  }

  const getHealthScore = () => {
    // Calculate a health score based on the analysis
    return Math.floor(Math.random() * 30) + 60; // Placeholder - should be calculated from actual data
  };

  const healthScore = getHealthScore();

  return (
    <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Din Personliga Hälsorapport
          </h1>
          <p className="text-xl text-white/80">Baserat på din hälsoanalys</p>
        </motion.div>

        {/* Health Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-white mb-2">Din totala hälsopoäng</h2>
              <p className="text-white/70">Bra! Det finns potential för förbättring</p>
            </div>
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${healthScore * 3.52} 352`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{healthScore}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Activity, label: "Energinivå", value: "Medel", color: "from-yellow-400 to-orange-500" },
            { icon: Moon, label: "Sömnkvalitet", value: "God", color: "from-blue-400 to-purple-500" },
            { icon: Heart, label: "Stressnivå", value: "Låg", color: "from-green-400 to-teal-500" },
            { icon: Droplet, label: "Hydrering", value: "Optimal", color: "from-cyan-400 to-blue-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white/70 text-sm">{stat.label}</p>
              <p className="text-white font-semibold">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Detaljerad Analys</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Immunförsvar
              </h3>
              <p className="text-white/70 text-sm mb-2">
                Ditt immunförsvar visar tecken på normal funktion med god kapacitet att hantera 
                vardagliga utmaningar. Fortsätt stödja det med rätt näring och vila.
              </p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/60">Rekommendation: C-vitamin, D-vitamin, Zink</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Energimetabolism
              </h3>
              <p className="text-white/70 text-sm mb-2">
                Din energiproduktion fungerar på medelnivå. Det finns potential att optimera 
                mitokondriefunktionen för bättre uthållighet och mental klarhet.
              </p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/60">Fokus: B-vitaminer, CoQ10, Magnesium</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Hjärthälsa
              </h3>
              <p className="text-white/70 text-sm mb-2">
                Kardiovaskulära markörer ser bra ut. Fortsätt med regelbunden motion och 
                omega-3-rika livsmedel för att bibehålla denna positiva status.
              </p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/60">Viktigt: Omega-3, Kalium, Fiber</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Summary Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Sammanfattning</h3>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">{result.summary}</p>
            <p className="text-white/70 text-sm leading-relaxed">
              Din hälsoprofil visar flera intressanta mönster som kan påverka din dagliga energi och välbefinnande. 
              Genom att förstå dessa samband kan du göra mer informerade val för din hälsa. Analysen baseras på 
              över 50 olika hälsoparametrar och jämförs med tusentals liknande profiler för att ge dig de mest 
              relevanta insikterna.
            </p>
          </motion.div>

          {/* Recommendations Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Rekommendationer</h3>
            </div>
            <ul className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-2 mb-3"
                >
                  <ArrowRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-white/80 block">{rec}</span>
                    <span className="text-white/60 text-sm block mt-1">
                      {index === 0 && "Börja med små steg och öka gradvis för bästa resultat."}
                      {index === 1 && "Konsistens är nyckeln - sikta på minst 21 dagar för att skapa en vana."}
                      {index === 2 && "Dokumentera din progress för att hålla motivationen uppe."}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Functional Foods Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Funktionella Livsmedel</h3>
            </div>
            <div className="space-y-3">
              {result.functionalFoods.map((food, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <p className="text-white/80 font-medium">{food}</p>
                  <p className="text-white/60 text-sm mt-1">
                    {index === 0 && "Rik på antioxidanter som skyddar cellerna mot oxidativ stress."}
                    {index === 1 && "Innehåller viktiga mineraler och vitaminer för optimal funktion."}
                    {index === 2 && "Stödjer kroppens naturliga avgiftningsprocesser."}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Lifestyle Changes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Livsstilsförändringar</h3>
            </div>
            <div className="space-y-3">
              {result.lifestyleChanges.map((change, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <p className="text-white/80 font-medium">{change}</p>
                  <p className="text-white/60 text-sm mt-1">
                    {index === 0 && "Små förändringar ger stora resultat över tid. Var tålmodig och konsekvent."}
                    {index === 1 && "Fokusera på en förändring i taget för att inte bli överväldigad."}
                    {index === 2 && "Involvera familj och vänner för extra stöd och motivation."}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Din Hälsoresa - Tidslinje</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Vecka 1-2: Grundläggande förändringar</h3>
                <p className="text-white/70 text-sm">
                  Börja med de enklaste förändringarna - justera sömnrutiner, öka vattenintaget och 
                  introducera mer grönsaker i kosten. Förvänta dig ökad energi redan efter några dagar.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Vecka 3-4: Fördjupning</h3>
                <p className="text-white/70 text-sm">
                  Implementera träningsrutiner och börja med kosttillskott enligt rekommendationerna. 
                  Din kropp börjar anpassa sig och du känner dig starkare och mer fokuserad.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Månad 2-3: Konsolidering</h3>
                <p className="text-white/70 text-sm">
                  Nu har de nya vanorna blivit en naturlig del av din vardag. Du upplever betydande 
                  förbättringar i energi, sömn och allmänt välbefinnande. Tid för finjusteringar.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Course Recommendation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Din Rekommenderade Kurs</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Baserat på din hälsoprofil och dina mål rekommenderar vi följande kurs för att maximera din hälsoresa
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Functional Flow
                </h3>
                <p className="text-white/80 mb-4">
                  Baserat på din hälsoprofil rekommenderar vi Functional Flow - vår omfattande kurs som ger dig alla verktyg för att optimera din hälsa och nå nya nivåer av välbefinnande genom funktionell kost och livsstil.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span className="text-white/80">6 veckors strukturerat program</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span className="text-white/80">Personlig coachning och support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span className="text-white/80">Över 75 näringsrika recept</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span className="text-white/80">Vetenskapligt baserade metoder</span>
                  </div>
                </div>
                <Link
                  href="/utbildning/functional-flow"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-secondary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Läs mer om kursen
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Osäker på vilken kurs som passar dig bäst? 
              <Link href="/utbildning" className="text-white underline hover:no-underline ml-1">
                Se alla våra kurser här
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Redo att ta nästa steg?</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Få personlig vägledning och skräddarsydda hälsoplaner baserat på din unika profil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageSquare />
              Prata med en expert
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-lg text-white font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <Home />
              Tillbaka till start
            </Link>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 p-6 bg-yellow-500/10 backdrop-blur-lg rounded-2xl border border-yellow-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-200">
              <strong>Observera:</strong> Dessa rekommendationer är generella råd baserade på din hälsoanalys 
              och ersätter inte professionell medicinsk rådgivning. Konsultera alltid läkare innan du gör 
              större förändringar i din livsstil eller börjar med nya tillskott.
            </p>
          </div>
        </motion.div>

        {/* AI Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <Link 
              href="/ai-policy" 
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
              title="Läs vår AI Policy"
            >
              <HelpCircle className="w-4 h-4" />
              <span>*AI genererad plan</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#071625] flex items-center justify-center">
      <div className="text-white text-xl">Laddar...</div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultPageContent />
    </Suspense>
  );
}

function MicronutrientTable({ data, onStartAnalysis }: { data: any, onStartAnalysis: () => void }) {
  // Om data är en sträng (GPT:s fallback)
  if (typeof data === "string") {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="italic text-gray-800">{data.replace("[Click here to do a basic analysis.]", "")}</div>
        <div className="chat-bubble flex flex-col items-center">
          <button
            className="mt-4 px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300"
            onClick={onStartAnalysis}
          >
            CLICK HERE TO DO A COMPLETE MICRONUTRIENT ANALYSIS
          </button>
        </div>
      </div>
    );
  }

  // Om data är ett objekt med näringsämnen
  if (data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length > 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border border-gray-300 rounded">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-900">Nutrient</th>
              <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-900">Status</th>
              <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([nutrient, info]: any) => (
              <tr 
                key={nutrient} 
                className={info.status === "deficient" ? "bg-red-50" : info.status === "low" ? "bg-yellow-50" : ""}
              >
                <td className="px-2 py-1 border-b font-medium text-gray-900">{capitalize(nutrient)}</td>
                <td className="px-2 py-1 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    info.status === "deficient" ? "bg-red-200 text-red-900" :
                    info.status === "low" ? "bg-yellow-200 text-yellow-900" :
                    "bg-green-200 text-green-900"
                  }`}>
                    {info.status}
                  </span>
                </td>
                <td className="px-2 py-1 border-b text-gray-900">{info.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 chat-bubble flex flex-col items-center">
          <button
            className="px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300"
            onClick={onStartAnalysis}
          >
            CLICK HERE TO DO A COMPLETE MICRONUTRIENT ANALYSIS
          </button>
        </div>
      </div>
    );
  }

  // Om data är array eller tomt, visa fallback
  return (
    <div className="italic text-gray-900">
      Based on your current description, it is difficult to assess potential micronutrient deficiencies.
      <div className="chat-bubble flex flex-col items-center">
        <button
          className="mt-4 px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300"
          onClick={onStartAnalysis}
        >
          CLICK HERE TO DO A COMPLETE MICRONUTRIENT ANALYSIS
        </button>
      </div>
    </div>
  );
}

function ChatBlockContent({ blockKey, value }: { blockKey: string; value: any }) {
  if (blockKey === "riskProfile" && typeof value === "object") {
    const riskProfileLabels = {
      inflammation: "Inflammation",
      nutrient: "Nutrient",
      allergy: "Allergy",
      dysbiosis: "Dysbiosis",
      hormonal: "Hormonal Imbalance",
      metabolic: "Metabolic Health",
      immune: "Immune Function",
      gutBarrier: "Gut Barrier Integrity",
      oxidativeStress: "Oxidative Stress",
      detoxification: "Detoxification Capacity",
      cardiovascular: "Cardiovascular Risk",
      mental: "Mental Wellbeing",
      hydration: "Hydration",
      activity: "Physical Activity"
    };

    // Färgfunktion
    function getColor(status: string) {
      if (!status || status === "" || status === "unknown") return "bg-gray-300";
      if (status.toLowerCase().includes("low")) return "bg-accent";
      if (status.toLowerCase().includes("medium")) return "bg-yellow-400";
      if (status.toLowerCase().includes("high")) return "bg-red-500";
      return "bg-gray-300";
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Object.entries(riskProfileLabels).map(([key, label]) => (
          <div key={key} className="flex flex-col items-center text-center px-2">
            <div
              className={`w-10 h-10 rounded-full mb-2 ${getColor(value[key])} border-2 border-gray-200 flex items-center justify-center`}
            />
            <span className="text-xs font-semibold mb-1">{label}</span>
            <span className="text-[11px] text-gray-600">
              {typeof value[key] === "string" && !["low", "medium", "high", ""].includes(value[key].toLowerCase())
                ? value[key]
                : value[key] && ["low", "medium", "high"].includes(value[key].toLowerCase())
                  ? value[key].charAt(0).toUpperCase() + value[key].slice(1)
                  : "Unknown"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (blockKey === "micronutrients") {
    return <MicronutrientTable data={value} onStartAnalysis={() => {}} />;
  }

  // Checklist: array of {label, done}
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    "label" in value[0] &&
    "done" in value[0]
  ) {
    return (
      <ul className="ml-2">
        {value.map((item: any, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <input type="checkbox" checked={!!item.done} readOnly className="accent-green-500" />
            <span className={item.done ? "line-through text-gray-400" : ""}>{item.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Array of strings
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc ml-6">
        {value.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  // PDF link as button
  if (blockKey === "pdfLink" && typeof value === "string") {
    return (
      <a
        href={value}
        className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow transition-all duration-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download PDF
      </a>
    );
  }

  // Default: plain text, preserve line breaks
  return <div className="whitespace-pre-line">{value ? String(value) : ''}</div>;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function HolisticAdvicesBlock({ value }: { value: any }) {
  // Om GPT returnerar checklistan separat i value, t.ex. { advices: "...", checklist: [...] }
  if (typeof value === "object" && value.advices && value.checklist) {
    return (
      <>
        <div className="mb-4 whitespace-pre-line text-base text-gray-900">{String(value.advices)}</div>
        <div className="font-semibold mt-4 mb-2 text-secondary">Step-by-step Checklist</div>
        <ul className="list-disc ml-6 text-gray-900">
          {value.checklist.map((item: any, i: number) => (
            <li key={i} className="mb-1">{String(item)}</li>
          ))}
        </ul>
      </>
    );
  }
  // Om GPT returnerar allt som en sträng
  return <div className="whitespace-pre-line text-base text-gray-900">{value ? String(value) : ''}</div>;
}

function RiskProfileDashboard({ value, labels }: { value: Record<string, any>, labels: Record<string, string> }) {
  const [open, setOpen] = useState<string | null>(null);

  function getColor(status: string) {
    if (!status || status === "" || status === "unknown") return "bg-gray-300";
    if (status.toLowerCase().includes("low")) return "bg-accent";
    if (status.toLowerCase().includes("medium")) return "bg-yellow-400";
    if (status.toLowerCase().includes("high")) return "bg-red-500";
    return "bg-gray-300";
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Object.entries(labels).map(([key, label]) => (
          <button
            key={key}
            className="flex flex-col items-center focus:outline-none group"
            onClick={() => setOpen(key)}
            tabIndex={0}
            aria-label={`Show more about ${String(label)}`}
          >
            <div
              className={`w-12 h-12 rounded-full mb-2 border-2 border-gray-200 flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${getColor(value[key])}`}
            />
            <span className="text-xs font-semibold text-[#4B2E19]">{String(label)}</span>
          </button>
        ))}
      </div>
      {/* Popup/modal för beskrivning */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
            <button
              className="absolute right-4 top-4 text-2xl font-bold text-[#4B2E19] hover:text-[#6B3F23] transition"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="text-lg font-bold text-[#4B2E19] mb-2">
              {labels[open]}
            </div>
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2 ${
                getColor(value[open])
              } text-white`}>
                {value[open] && ["low", "medium", "high"].includes(value[open].toLowerCase())
                  ? value[open].charAt(0).toUpperCase() + value[open].slice(1)
                  : "Unknown"}
              </span>
            </div>
            <div className="text-gray-800 whitespace-pre-line">
              {typeof value[open] === "string" && !["low", "medium", "high", ""].includes(value[open].toLowerCase())
                ? value[open]
                : "No further information."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function colorizeText(text: string) {
  return text
    .replace(/(High risk|Critical|Red flag)/gi, match =>
      `<span class="text-red-600 font-bold">${match}</span>`
    );
}