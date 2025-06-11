"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BodyMap, { dots } from "./components/BodyMap";
import { Question, UserResponse } from "@/app/types";
import MicronutrientQuestionModal from "./components/MicronutrientQuestionModal";
import Questionnaire from "./components/Questionnaire";
import { AnalysisResult } from "./types";
import { ArrowRight, Sparkles, Brain, Heart } from 'lucide-react';

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
        <Sparkles className="w-12 h-12 text-accent mb-4 animate-pulse" />
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
      {/* Video Section - New */}
      <section className="container-custom pt-8 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-accent/5 to-accent/10 p-1">
            <div className="rounded-3xl overflow-hidden bg-white">
              <video 
                className="w-full h-auto"
                controls
                playsInline
                controlsList="nodownload nofullscreen"
                style={{ 
                  '--media-controls-background': 'transparent',
                  '--media-controls-color': 'white',
                  '--media-controls-hover-color': '#f0f0f0'
                } as React.CSSProperties}
              >
                <source src="/Ulrika_ desktop.MP4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - More compact */}
      <section className="container-custom pt-4 md:pt-6 pb-6 md:pb-8">
        <div className="text-center max-w-3xl mx-auto mb-4 md:mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in tracking-tight">
            ANALYSERA DIN HÄLSA MED{" "}
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">
              FUNCTIONAL FOODS
            </span>
          </h1>
          <p className="text-sm md:text-base text-text-secondary animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
            Få personliga kostråd baserat på dina hälsoutmaningar.
          </p>
        </div>

        {/* Main Content - Centered layout */}
        <div className="mt-4 md:mt-6">
          {!showQuestionnaire ? (
            <div className="max-w-4xl mx-auto">
              {/* Body Map Section - Centered */}
              <div className="flex justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div>
                  <div className="text-center mb-2 md:mb-4">
                    <h2 className="text-lg md:text-xl font-light text-primary mb-1">Steg 1: Välj område</h2>
                    <p className="text-xs md:text-sm text-text-secondary">Klicka på det område där du upplever besvär</p>
                  </div>
                  <BodyMap onSelect={setSelectedDot} selected={selectedDot} />
                </div>
              </div>

              {/* Description Section - Below body map */}
              <div className="animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '0.6s' }}>
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-light text-primary mb-2 md:mb-3">Steg 2: Beskriv dina besvär</h2>
                  <textarea
                    placeholder="Beskriv ditt problem så detaljerat som möjligt..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-border focus:border-accent focus:outline-none transition-colors duration-200 resize-none text-sm md:text-base"
                    style={{ minHeight: '120px' }}
                  />
                  
                  <button
                    onClick={handleAskQuestions}
                    className="mt-3 md:mt-4 w-full btn-primary flex items-center justify-center group py-2 md:py-3"
                    disabled={!selectedDot || !description || loading}
                  >
                    <span>{loading ? "Analyserar..." : "Starta analys"}</span>
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto animate-fade-in">
              <Questionnaire
                bodyPart={selectedDot || ''}
                onComplete={handleQuestionnaireComplete}
                onCancel={() => setShowQuestionnaire(false)}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 md:mt-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700">
              {error}
            </div>
          </div>
        )}
      </section>

      {/* Features Section - Moved down */}
      <section className="bg-white section-padding mt-20">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-12">
            Varför välja Functional Foods?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">Vetenskapligt baserat</h3>
              <p className="text-text-secondary">
                Våra rekommendationer bygger på den senaste forskningen inom funktionell kost
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">Personligt anpassat</h3>
              <p className="text-text-secondary">
                Få skräddarsydda kostråd baserat på just dina behov och hälsomål
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">Holistiskt perspektiv</h3>
              <p className="text-text-secondary">
                Vi ser till hela din hälsa och livsstil för bästa möjliga resultat
              </p>
            </div>
          </div>
        </div>
      </section>

      <LoadingPopup messages={loadingPopup.messages} durations={loadingPopup.durations} visible={loadingPopup.visible} />
    </div>
  );
}