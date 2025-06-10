"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BodyMap, { dots } from "./components/BodyMap";
import { Question, UserResponse } from "@/app/types";
import MicronutrientQuestionModal from "./components/MicronutrientQuestionModal";

function LoadingPopup({ messages, durations, onDone, visible }: { messages: string[]; durations?: number[]; onDone?: () => void; visible: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setStep(0);
    if (messages.length === 0) return;

    // Använd durations-array om den finns, annars default 2200ms per steg
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
    // eslint-disable-next-line
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-3xl px-10 py-10 flex flex-col items-center shadow-2xl min-w-[320px] relative">
        {/* Modern progress bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full mb-8 overflow-hidden relative">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${((step + 1) / messages.length) * 100}%`,
              background: "linear-gradient(90deg, #4B2E19 60%, #6B3F23 100%)",
              boxShadow: "0 0 8px #4B2E19aa"
            }}
          />
          {/* Animated dot */}
          <div
            className="absolute top-0 -mt-1 w-5 h-5 rounded-full border-4 border-white"
            style={{
              left: `calc(${((step + 1) / messages.length) * 100}% - 10px)`,
              background: "#4B2E19",
              transition: "left 0.7s cubic-bezier(.4,2,.6,1)"
            }}
          />
        </div>
        <div className="text-xl font-bold text-[#4B2E19] mb-2 animate-pulse">{messages[step]}</div>
        <div className="text-sm text-gray-500">Please wait while we process your information...</div>
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
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showMicronutrientPopup, setShowMicronutrientPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [emailStepDone, setEmailStepDone] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  async function handleAskQuestions() {
    if (!selectedDot || !description) return;
    if (!emailStepDone) {
      setShowEmailPopup(true);
      return;
    }
    setLoadingPopup({ visible: true, messages: ["Thinking...", "Preparing questions...", "Soon ready..."], durations: [3000, 3500, 900] });
    try {
      setLoading(true);
      setError(null);
      setQuestions(null);

      const dotObj = dots.find(dot => dot.id === selectedDot);
      if (!dotObj) throw new Error("Selected body part not found");

      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyPart: dotObj.label,
          description,
          previousAnswers: []
        } as UserResponse),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get follow-up questions');
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format from server');
      }

      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(""));
      setActiveQuestion(0);
      setShowExtra(false);
      setExtraInfo("");
      setLoadingPopup({ visible: false, messages: [], durations: [3000, 3500, 3500, 900] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Error:', err);
      setLoadingPopup({ visible: false, messages: [], durations: [3000, 3500, 3500, 900] });
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newAnswers = [...answers];
    newAnswers[activeQuestion] = e.target.value;
    setAnswers(newAnswers);
  }

  function handleSelectOption(option: string) {
    const newAnswers = [...answers];
    newAnswers[activeQuestion] = option;
    setAnswers(newAnswers);
  }

  async function handleNextQuestion() {
    if (!questions) return;
    if (activeQuestion < questions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
    } else {
      setShowExtra(true);
    }
  }

  async function handleSubmitAll() {
    if (!questions) return;
    
    setLoadingPopup({ visible: true, messages: ["Thinking...", "Analyzing your answers...", "Preparing your personalized report...", "Soon ready..."], durations: [7000, 7000, 7000, 900] });
    try {
      setLoading(true);
      setError(null);
      
      const dotObj = dots.find(dot => dot.id === selectedDot);
      if (!dotObj) throw new Error("Selected body part not found");

      const allAnswers = [
        ...answers.map((a, i) => `Q${i + 1}: ${questions[i].question}\nA${i + 1}: ${a}`),
        `Additional info: ${extraInfo}`
      ].join("\n");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyPart: dotObj.label,
          description,
          answers: allAnswers,
          numQuestions: answers.length + 1,
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
      setLoadingPopup({ visible: false, messages: [], durations: [3000, 3500, 3500, 900] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Error:', err);
      setLoadingPopup({ visible: false, messages: [], durations: [3000, 3500, 3500, 900] });
    } finally {
      setLoading(false);
    }
  }

  function askForLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("Could not get your location.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#071625] transition-colors duration-500">
      <BodyMap onSelect={setSelectedDot} selected={selectedDot} />
      
      {error && (
        <div className="mt-4 px-4 py-2 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Beskriv ditt problem..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="mt-8 px-4 py-2 rounded-lg bg-[#071625] text-white border border-gray-600 w-80 focus:outline-none focus:ring-2 focus:ring-[#4B2E19] shadow-md transition-all duration-300"
        style={{ marginTop: 32 }}
      />
      
      <button
        onClick={handleAskQuestions}
        className="mt-4 px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedDot || !description || loading}
      >
        {loading ? "Analyserar..." : "ANALYSERA"}
      </button>

      <div className="mt-2 flex flex-col items-center">
        <span className="text-xs text-white mb-1">eller...</span>
        <button
          className="text-sm text-white underline hover:text-gray-200 transition"
          onClick={() => {
            if (!emailStepDone) {
              setShowEmailPopup(true);
            } else {
              setShowMicronutrientPopup(true);
            }
          }}
          type="button"
        >
          gör vårt näringsanalys-test
        </button>
      </div>
      
      {/* Email popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full min-h-[320px] shadow-2xl flex flex-col items-center relative">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Innan du börjar</h2>
            <label className="w-full mb-4">
              <span className="block text-gray-700 font-medium mb-1">Din e-postadress</span>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2E19] bg-[#f3f4f6] text-gray-800 shadow transition-all duration-300"
                placeholder="du@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                className="mr-2"
                checked={privacyChecked}
                onChange={e => setPrivacyChecked(e.target.checked)}
              />
              <span className="text-gray-700 text-sm">Jag godkänner integritetspolicyn</span>
            </label>
            <div className="text-xs text-gray-500 mb-4 text-center">
              Vi hatar spam och kommer aldrig att dela din information med tredje part.
            </div>
            {emailError && <div className="text-red-600 text-sm mb-2">{emailError}</div>}
            <button
              className="px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
                  setEmailError("Vänligen ange en giltig e-postadress.");
                  return;
                }
                if (!privacyChecked) {
                  setEmailError("Du måste godkänna integritetspolicyn.");
                  return;
                }
                setEmailError("");
                setEmailStepDone(true);
                setShowEmailPopup(false);
                if (showMicronutrientPopup) {
                  setShowMicronutrientPopup(true);
                } else {
                  handleAskQuestions();
                }
              }}
              disabled={!email || !privacyChecked}
            >
              Börja
            </button>
            <button
              type="button"
              className="absolute right-4 top-4 text-2xl font-bold text-[#4B2E19] hover:text-[#6B3F23] transition shadow-md"
              onClick={() => setShowEmailPopup(false)}
              aria-label="Stäng"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Interaktiv pop-up/modal för GPT-frågor */}
      {emailStepDone && questions && questions.length > 0 && !showExtra && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
          onClick={() => {
            setQuestions(null);
            setAnswers([]);
            setActiveQuestion(0);
            setShowExtra(false);
            setExtraInfo("");
            setError(null);
          }}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-lg w-full min-h-[420px] shadow-2xl flex flex-col items-center relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 text-2xl font-bold text-[#4B2E19] hover:text-[#6B3F23] transition shadow-md"
              onClick={() => {
                setQuestions(null);
                setAnswers([]);
                setActiveQuestion(0);
                setShowExtra(false);
                setExtraInfo("");
                setError(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-800">Follow-up questions</h2>
            <div className="mb-4 text-sm text-gray-500 font-medium">
              Question {activeQuestion + 1} of {questions.length}
            </div>
            {activeQuestion > 0 && (
              <button
                type="button"
                className="absolute left-4 top-4 px-4 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 shadow transition-all duration-300"
                onClick={() => setActiveQuestion(activeQuestion - 1)}
              >
                Back
              </button>
            )}
            {questions[activeQuestion] && (
              <>
                <div className="bg-white rounded-full px-6 py-4 shadow-md mb-3 text-gray-900 text-base font-medium w-full text-center">
                  {questions[activeQuestion].question}
                </div>
                
                {questions[activeQuestion].type === "choice" ? (
                  <div className="flex flex-col gap-2 w-4/5">
                    {questions[activeQuestion].options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        className={`px-4 py-2 rounded-lg border border-gray-300 bg-[#f3f4f6] text-gray-800 shadow hover:bg-[#e5e7eb] transition ${
                          answers[activeQuestion] === option ? "ring-2 ring-[#4B2E19]" : ""
                        }`}
                        onClick={() => handleSelectOption(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Write your answer here..."
                    value={answers[activeQuestion] || ""}
                    onChange={handleAnswerChange}
                    onKeyDown={e => {
                      if (e.key === "Enter" && answers[activeQuestion]?.trim()) {
                        handleNextQuestion();
                      }
                    }}
                    className="w-4/5 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2E19] bg-[#f3f4f6] text-gray-800 shadow transition-all duration-300"
                    autoFocus
                  />
                )}
                
                <button
                  type="button"
                  className="mt-6 px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextQuestion}
                  disabled={
                    questions[activeQuestion].type === "text"
                      ? !answers[activeQuestion] || answers[activeQuestion].trim() === ""
                      : !answers[activeQuestion]
                  }
                >
                  {activeQuestion < questions.length - 1 ? "Next" : "Continue"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sista fritextfrågan */}
      {showExtra && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[#f9fafb] rounded-3xl p-8 max-w-lg w-full shadow-2xl flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Anything else?</h2>
            <div className="mb-4 text-gray-700 text-base text-center">
              Is there anything else you would like to add to help us understand your situation better?
            </div>
            <textarea
              placeholder="Write any additional information here..."
              value={extraInfo}
              onChange={e => setExtraInfo(e.target.value)}
              className="w-full min-h-[80px] px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2E19] bg-[#f3f4f6] text-gray-800 shadow transition-all duration-300"
            />
            <button
              type="button"
              className="mt-6 px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmitAll}
              disabled={loading}
            >
              {loading ? "Processing..." : "See my result"}
            </button>
          </div>
        </div>
      )}

      {showMicronutrientPopup && (
        <MicronutrientQuestionModal
          onClose={() => setShowMicronutrientPopup(false)}
        />
      )}

      <LoadingPopup messages={loadingPopup.messages} durations={loadingPopup.durations} visible={loadingPopup.visible} />
    </div>
  );
}