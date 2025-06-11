"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnalysisResult } from "../types";

export default function DummyResultPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hämta analysresultat från localStorage
    const storedResult = localStorage.getItem('analysisResult');
    
    if (storedResult) {
      try {
        const result = JSON.parse(storedResult) as AnalysisResult;
        setAnalysisData(result);
        // Rensa localStorage efter att vi hämtat datan
        localStorage.removeItem('analysisResult');
      } catch (error) {
        console.error('Error parsing analysis result:', error);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar din analys...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ingen analysdata hittades.</p>
          <Link href="/" className="text-green-500 hover:text-green-600 underline">
            Gå tillbaka till startsidan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8f5f0]">
      {/* Hero video sektion */}
      <div className="bg-gradient-to-b from-white to-[#fafaf8] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <video 
              autoPlay 
              loop 
              muted
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            >
              <source src="/Ulrika.mp4" type="video/mp4" />
              Din webbläsare stöder inte videouppspelning.
            </video>
            
            {/* Overlay med play/pause kontroller */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={(e) => {
                  const video = e.currentTarget.closest('.relative')?.querySelector('video');
                  if (video) {
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }
                }}
                className="bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 rounded-full p-2 transition-all duration-200 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  const video = e.currentTarget.closest('.relative')?.querySelector('video');
                  if (video) {
                    video.muted = !video.muted;
                  }
                }}
                className="bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 rounded-full p-2 transition-all duration-200 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Huvudinnehåll */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Personlig hälsning */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-4">
            DIN PERSONLIGA HÄLSOANALYS
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Baserat på dina svar har vi identifierat områden där Functional Foods kan göra stor skillnad
          </p>
        </div>

        {/* Sammanfattning */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600">✓</span>
            </span>
            Sammanfattning
          </h2>
          <p className="text-gray-700 font-light leading-relaxed">
            {analysisData.summary}
          </p>
        </div>

        {/* Rekommendationer */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6">
            Personliga Rekommendationer
          </h2>
          <div className="space-y-4">
            {analysisData.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-700 font-light">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Functional Foods */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-8 border border-green-100">
          <h2 className="text-2xl font-light text-gray-800 mb-6">
            Rekommenderade Functional Foods
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {analysisData.functionalFoods.map((food: string, index: number) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🥗</span>
                  <p className="text-gray-700">{food}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Livsstilsförändringar */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6">
            Livsstilsförändringar
          </h2>
          <div className="space-y-4">
            {analysisData.lifestyleChanges.map((change: string, index: number) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-500 mr-3">•</span>
                <p className="text-gray-700 font-light">{change}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rekommenderad kurs */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-8 border border-green-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-gray-800">
              Perfekt Kurs För Dig
            </h2>
          </div>
          
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Functional Flow
            </h3>
            <p className="text-gray-600 mb-4">
              En 6-veckorskurs specialdesignad för dig som vill förbättra din maghälsa, minska inflammation och skapa naturligt flöde i vardagen. Perfekt för dina identifierade behov.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Specialpris just nu:</span> 1.836 kr 
                <span className="text-green-600 ml-2">(ord. pris 2.295 kr)</span>
              </p>
            </div>

            <Link 
              href="/utbildning/functional-flow" 
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
            >
              Gå till kurssidan →
            </Link>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Har du frågor om din analys eller våra kurser?
          </p>
          <Link 
            href="/kontakt" 
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-8 rounded-full transition-colors"
          >
            Kontakta oss
          </Link>
        </div>
      </div>
    </div>
  );
} 