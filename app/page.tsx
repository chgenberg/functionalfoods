"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BodyMap, { dots } from "./components/BodyMap";
import { Question, UserResponse } from "@/app/types";
import MicronutrientQuestionModal from "./components/MicronutrientQuestionModal";
import Questionnaire from "./components/Questionnaire";
import { AnalysisResult } from "./types";
import { FiArrowRight, FiActivity, FiHeart, FiZap, FiShield } from 'react-icons/fi';
import { GiSparkles, GiBrain } from 'react-icons/gi';
import Image from "next/image";

function LoadingPopup({ messages, durations, onDone, visible }: { messages: string[]; durations?: number[]; onDone?: () => void; visible: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setStep(0);
    if (messages.length === 0) return;

    const times = durations && durations.length === messages.length
      ? durations
      : Array(messages.length).fill(2200);

    let total = 0;
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i < messages.length; i++) {
      total += times[i - 1];
      timers.push(setTimeout(() => setStep(i), total));
    }
    const doneTimer = setTimeout(() => {
      if (onDone) onDone();
    }, total + times[messages.length - 1]);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl px-12 py-10 flex flex-col items-center shadow-2xl max-w-md w-full mx-4 animate-fade-in">
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${((step + 1) / messages.length) * 100}%`,
            }}
          />
        </div>
        <GiSparkles className="w-12 h-12 text-accent mb-4 animate-pulse" />
        <div className="text-xl font-medium text-primary mb-2 text-center">{messages[step]}</div>
        <div className="text-sm text-text-secondary">Vänligen vänta medan vi bearbetar din information...</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedDot, setSelectedDot] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showExtra, setShowExtra] = useState(false);
  const [extraInfo, setExtraInfo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingPopup, setLoadingPopup] = useState<{ visible: boolean; messages: string[]; durations?: number[] }>({ visible: false, messages: [] });
  const router = useRouter();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showMicronutrientModal, setShowMicronutrientModal] = useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [symptomDescription, setSymptomDescription] = useState('');

  const scrollToAnalysis = () => {
    const element = document.getElementById('analysis-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  async function handleAskQuestions() {
    if (!selectedDot || !description) return;
    setShowQuestionnaire(true);
  }

  async function handleQuestionnaireComplete(answers: string[]) {
    setLoadingPopup({ 
      visible: true, 
      messages: [
        "Analyserar dina svar...", 
        "Genererar personliga rekommendationer...", 
        "Förbereder din hälsoplan..."
      ], 
      durations: [3000, 3000, 1000] 
    });
    
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyPart: selectedDot,
          description,
          answers,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze responses');
      }

      if (!data.result) {
        throw new Error('Invalid response format from server');
      }

      router.push("/result?data=" + encodeURIComponent(JSON.stringify(data.result)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setLoadingPopup({ visible: false, messages: [] });
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      {/* Hero Section with Image */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        {/* Hero Image */}
        <Image
          src="/leaflet2.png"
          alt="Functional Foods"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 animate-fade-in">
              Functional Foods
            </h1>
            <p className="text-xl md:text-2xl font-light mb-8 animate-fade-in animation-delay-200">
              Mat som medicin för kropp och själ
            </p>
            <button 
              onClick={() => scrollToAnalysis()}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 animate-fade-in animation-delay-400"
            >
              Starta din hälsoresa
            </button>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section id="analysis-section" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-8 text-gray-800">
            BESKRIV DINA BESVÄR
          </h2>
          
          <div className="relative">
            {/* Body Map - No white background */}
            <div className="flex justify-center">
              <BodyMap onSelect={setSelectedDot} selected={selectedDot} />
            </div>
            
            {/* Description Bubble */}
            {selectedDot && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-white rounded-3xl shadow-2xl p-6 animate-scale-in min-w-[350px] max-w-md">
                  <button
                    onClick={() => setSelectedDot(null)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Steg 2: Beskriv dina besvär i {selectedDot}
                  </h3>
                  
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 resize-none"
                    rows={4}
                    placeholder="Beskriv dina symptom här..."
                    autoFocus
                  />
                  
                  <button
                    onClick={handleAskQuestions}
                    disabled={!description.trim()}
                    className={`mt-4 w-full py-3 px-6 rounded-full font-medium transition-all duration-300 transform ${
                      description.trim()
                        ? 'bg-gradient-to-r from-accent to-accent-hover text-white hover:scale-105 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Starta analys
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-4 md:mt-8 max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700">
            {error}
          </div>
        </div>
      )}

      {showQuestionnaire && (
        <Questionnaire
          bodyPart={selectedDot || ''}
          description={description}
          onCancel={() => setShowQuestionnaire(false)}
        />
      )}

      <LoadingPopup
        messages={loadingPopup.messages}
        durations={loadingPopup.durations}
        visible={loadingPopup.visible}
        onDone={() => setLoadingPopup({ visible: false, messages: [] })}
      />
    </div>
  );
}