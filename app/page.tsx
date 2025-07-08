"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Image from "next/image";
import HealthQuiz from "./components/HealthQuiz";
import QuizResultScreen from "./components/QuizResultScreen";
import NewsletterSignup from "./components/NewsletterSignup";

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, string> | null>(null);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-light text-gray-800 mb-6 animate-fade-in">
            FUNCTIONAL
            <span className="text-green-600 font-medium"> FOODS</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in animation-delay-200">
            Mat som medicin för kropp och själ
          </p>
          <button 
            onClick={() => setShowQuiz(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-full font-medium transition-all transform hover:scale-105 animate-fade-in animation-delay-400 text-xl shadow-lg hover:shadow-xl"
          >
            Starta Hälsoquiz
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-12 text-gray-800">
            Upptäck kraften i functional foods
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🧬</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Vetenskapligt baserat</h3>
              <p className="text-gray-600">Baserat på den senaste forskningen inom nutrition och hälsa</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Personaliserat</h3>
              <p className="text-gray-600">Skräddarsydda rekommendationer för dina unika behov</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Resultat</h3>
              <p className="text-gray-600">Märkbara förbättringar i energi och välmående</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-light mb-6 text-gray-800">
                Med <span className="text-green-600 font-medium">Ulrika Davidsson</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Som nutritionist och hälsocoach hjälper jag människor att upptäcka kraften i functional foods. 
                Genom personaliserade program och evidensbaserade metoder guidar jag dig mot optimal hälsa.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Certifierad nutritionist</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">10+ års erfarenhet</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">1000+ nöjda klienter</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/ulrika.png"
                alt="Ulrika Davidsson"
                width={500}
                height={600}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4">
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
          <h2 className="text-4xl font-light mb-6">
            Redo att transformera din hälsa?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Starta din resa mot optimal hälsa med vårt personliga hälsoquiz
          </p>
          <button 
            onClick={() => setShowQuiz(true)}
            className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Starta ditt quiz nu
          </button>
        </div>
      </section>
    </div>
  );
}