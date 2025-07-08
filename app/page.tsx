"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Image from "next/image";
import HealthQuiz from "./components/HealthQuiz";
import NewsletterSignup from "./components/NewsletterSignup";



export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const router = useRouter();

  const handleQuizComplete = (answers: Record<number, string>) => {
    console.log('Quiz completed with answers:', answers);
    // Quiz-resultaten hanteras nu av QuizResultScreen komponenten
    // som automatiskt visas när quizet är klart
  };

  if (showQuiz) {
    return (
      <div className="fixed inset-0 z-50">
        <HealthQuiz 
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen -mt-16 md:-mt-20" style={{ backgroundColor: '#fffdf3' }}>
      {/* Hero Section with Ulrika Background */}
      <section className="relative w-full overflow-hidden h-screen flex items-center justify-center hero-background">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 sm:mb-6 text-white animate-fade-in text-center uppercase drop-shadow-2xl">
            <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
              FUNCTIONAL FOODS
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-8 sm:mb-12 text-white animate-fade-in animation-delay-200 text-center">
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





      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup 
            variant="hero"
            showName={true}
            title="Bli en del av Functional Foods familjen!"
            subtitle="Få exklusiva recept, hälsotips och specialerbjudanden direkt i din inkorg varje vecka"
          />
        </div>
      </section>
    </div>
  );
}