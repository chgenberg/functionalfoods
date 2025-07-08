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

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, string> | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50" />
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
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-30 blur-3xl"
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
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-light text-gray-800 mb-6 leading-tight">
                UPPTÄCK KRAFTEN I
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-bold">
                  FUNCTIONAL FOODS
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Mat som medicin för kropp och själ
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQuiz(true)}
                  className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-5 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                  Starta Hälsoquiz
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <Link
                  href="/utbildning"
                  className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-5 rounded-full font-semibold text-lg hover:border-green-600 hover:text-green-600 transition-all flex items-center justify-center gap-3"
                >
                  <FiBook className="w-5 h-5" />
                  Våra kurser
                </Link>
              </div>

              {/* Benefits list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <span className="text-2xl">{benefit.icon}</span>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right content - Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <Image
                  src="/ulrika.png"
                  alt="Ulrika Davidsson"
                  width={600}
                  height={700}
                  className="rounded-3xl shadow-2xl"
                  priority
                />
                {/* Floating card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
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
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
              Upptäck kraften i <span className="font-bold text-green-600">functional foods</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Få personaliserade rekommendationer baserat på din livsstil och hälsobehov
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
              Så här <span className="font-bold text-green-600">fungerar det</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
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
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
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

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
              Vad våra kunder <span className="font-bold text-green-600">säger</span>
            </h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-gray-700 mb-6 italic">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <p className="font-semibold text-gray-800">
                  — {testimonials[activeTestimonial].name}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? "w-8 bg-green-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup 
            variant="hero"
            title="Få de senaste tipsen om Functional Foods"
            subtitle="Bli först med att få våra bästa råd och recept direkt i din inkorg"
            showName={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Redo att transformera din hälsa?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Starta din resa mot optimal hälsa med vårt personliga hälsoquiz
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuiz(true)}
              className="bg-white text-green-600 px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              Starta ditt quiz nu
              <FiArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}