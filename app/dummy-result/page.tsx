"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const LoadingAnalysis = dynamic(() => import('../components/LoadingAnalysis'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Laddar...</p>
      </div>
    </div>
  )
});

const QuizResultScreen = dynamic(() => import('../components/QuizResultScreen'), {
  ssr: false
});

export default function DummyResultPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Show loading screen for 12 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowResult(true);
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingAnalysis />;
  }

  if (showResult) {
    // Dummy quiz data for demonstration
    const dummyQuizData = {
      symptoms: [
        { symptom: "Trötthet", severity: 8 },
        { symptom: "Huvudvärk", severity: 6 },
        { symptom: "Matsmältningsbesvär", severity: 5 }
      ],
      recommendations: [
        {
          nutrient: "Järn",
          description: "Järnbrist kan orsaka trötthet och huvudvärk",
          foods: ["Rött kött", "Spenat", "Linser"],
          supplements: "Järntabletter 15-20mg dagligen"
        },
        {
          nutrient: "Magnesium",
          description: "Hjälper mot muskelspänningar och huvudvärk",
          foods: ["Nötter", "Mörk choklad", "Avokado"],
          supplements: "Magnesiumcitrat 200-400mg dagligen"
        },
        {
          nutrient: "Probiotika",
          description: "Stödjer en hälsosam tarmflora",
          foods: ["Yoghurt", "Kimchi", "Kombucha"],
          supplements: "Probiotiska kapslar med minst 10 miljarder CFU"
        }
      ],
      quickWins: [
        { 
          icon: "🥤", 
          title: "Drick mer vatten", 
          description: "Minst 2 liter per dag",
          emoji: "💧"
        },
        { 
          icon: "🛌", 
          title: "Sov 7-9 timmar", 
          description: "Regelbunden sömn är viktigt",
          emoji: "😴"
        },
        { 
          icon: "🧘", 
          title: "Minska stress", 
          description: "Prova meditation eller yoga",
          emoji: "🧘‍♀️"
        }
      ]
    };

    return <QuizResultScreen quizData={dummyQuizData} onRestart={() => router.push('/')} />;
  }

  return null;
} 