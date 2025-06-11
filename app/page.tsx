"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BodyMap, { dots } from "./components/BodyMap";
import { Question, UserResponse } from "@/app/types";
import MicronutrientQuestionModal from "./components/MicronutrientQuestionModal";
import Questionnaire from "./components/Questionnaire";
import { AnalysisResult } from "./types";
import { ArrowRight, Sparkles, Brain, Heart, Zap, Shield, Leaf, Activity } from 'lucide-react';

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
      {/* Hero Section - More compact */}
      <section className="container-custom pt-12 md:pt-16 pb-8 md:pb-12">
        <div className="text-center max-w-3xl mx-auto mb-4 md:mb-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Personlig hälsoanalys på 5 minuter</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in tracking-tight">
            ANALYSERA DIN HÄLSA MED{" "}
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold animate-gradient">
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
            <div className="max-w-6xl mx-auto">
              {/* Steps Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Body Map Section */}
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="p-0 shadow-none bg-transparent rounded-none transition-none">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-accent font-bold">1</span>
                        </div>
                        <h2 className="text-lg md:text-xl font-light text-primary">VÄLJ OMRÅDE</h2>
                      </div>
                      <Activity className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                    <p className="text-xs md:text-sm text-text-secondary mb-4">Klicka på det område där du upplever besvär</p>
                    <div className="flex justify-center" style={{ background: 'transparent' }}>
                      <BodyMap onSelect={setSelectedDot} selected={selectedDot} />
                    </div>
                    {selectedDot && (
                      <div className="mt-4 p-3 bg-accent/5 rounded-lg animate-fade-in">
                        <p className="text-sm text-accent font-medium">
                          ✓ {selectedDot === 'head' ? 'Huvud' : 
                             selectedDot === 'chest' ? 'Bröst' :
                             selectedDot === 'stomache' ? 'Mage' :
                             selectedDot === 'right-arm' ? 'Höger arm' :
                             selectedDot === 'left-arm' ? 'Vänster arm' :
                             selectedDot === 'genitals' ? 'Underliv' :
                             selectedDot === 'right-leg' ? 'Höger ben' :
                             selectedDot === 'left-leg' ? 'Vänster ben' :
                             selectedDot} valt
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Section */}
                <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-accent font-bold">2</span>
                        </div>
                        <h2 className="text-lg md:text-xl font-light text-primary">Beskriv dina besvär</h2>
                      </div>
                      <Brain className="w-5 h-5 text-accent" />
                    </div>
                    <textarea
                      placeholder="Beskriv ditt problem så detaljerat som möjligt..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-none text-sm md:text-base flex-grow"
                      style={{ minHeight: '120px' }}
                    />
                    
                    <div className="mt-4 space-y-3">
                      {description && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary animate-fade-in">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>{description.length} tecken</span>
                        </div>
                      )}
                      
                      <button
                        onClick={handleAskQuestions}
                        className="w-full btn-primary flex items-center justify-center group py-3 md:py-4 text-base md:text-lg font-medium relative overflow-hidden"
                        disabled={!selectedDot || !description || loading}
                      >
                        <span className="relative z-10 flex items-center">
                          {loading ? "Analyserar..." : "Starta analys"}
                          <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-hover to-accent transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="mt-8 flex justify-center items-center gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${selectedDot ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${selectedDot ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">Område valt</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${description ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${description ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">Beskrivning klar</span>
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

      {/* Features Section */}
      <section className="bg-white section-padding mt-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Varför välja <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-bold animate-gradient">Functional Foods?</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Vi kombinerar vetenskap, personlig anpassning och holistiskt tänkande för att ge dig de bästa förutsättningarna för optimal hälsa.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group text-center hover-lift">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-10 h-10 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Evidensbaserat
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2 group-hover:text-accent transition-colors">Vetenskapligt baserat</h3>
              <p className="text-text-secondary">
                Våra rekommendationer bygger på den senaste forskningen inom funktionell kost
              </p>
            </div>
            
            <div className="group text-center hover-lift">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  För dig
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2 group-hover:text-accent transition-colors">Personligt anpassat</h3>
              <p className="text-text-secondary">
                Få skräddarsydda kostråd baserat på just dina behov och hälsomål
              </p>
            </div>
            
            <div className="group text-center hover-lift">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-10 h-10 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  360° hälsa
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2 group-hover:text-accent transition-colors">Holistiskt perspektiv</h3>
              <p className="text-text-secondary">
                Vi ser till hela din hälsa och livsstil för bästa möjliga resultat
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-accent mb-1">5000+</div>
              <p className="text-sm text-text-secondary">Nöjda användare</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl font-bold text-accent mb-1">98%</div>
              <p className="text-sm text-text-secondary">Rekommenderar oss</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl font-bold text-accent mb-1">15+</div>
              <p className="text-sm text-text-secondary">Års erfarenhet</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-3xl font-bold text-accent mb-1">24/7</div>
              <p className="text-sm text-text-secondary">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-accent to-accent-hover rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Redo att börja din hälsoresa?</h2>
              <p className="text-lg mb-6 opacity-90">Starta din personliga hälsoanalys nu och få skräddarsydda rekommendationer direkt.</p>
              <Link 
                href="/utbildning"
                className="bg-white text-accent px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 inline-flex items-center gap-2 group"
              >
                Börja nu
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      <LoadingPopup messages={loadingPopup.messages} durations={loadingPopup.durations} visible={loadingPopup.visible} />
    </div>
  );
}