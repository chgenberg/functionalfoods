"use client";
import { useState } from 'react';
import { Question, bodyPartQuestions, AnalysisResult } from '../types';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import LoadingAnalysis from './LoadingAnalysis';
import { GiSparkles } from 'react-icons/gi';
import QuizResultScreen from './QuizResultScreen';

interface QuestionnaireProps {
  bodyPart: string;
  description: string;
  onCancel: () => void;
}

export default function Questionnaire({ bodyPart, description, onCancel }: QuestionnaireProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const questions = bodyPartQuestions[bodyPart] || [];

  const loadingMessages = [
    "Analyserar dina svar...",
    "Genererar personliga rekommendationer...",
    "Förbereder din hälsoplan..."
  ];
  const loadingDurations = [3000, 3000, 1000];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTextInput('');
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setLoadingError(null);
    
    // Show loading screen for 12 seconds
    setTimeout(async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bodyPart,
            description,
            answers,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze');
        }

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          throw new Error('Invalid response format');
        }
        
        // Transform the result to match QuizResultScreen format
        const transformedResult = {
          symptoms: [
            { symptom: bodyPart, severity: 7 },
            { symptom: description, severity: 5 }
          ],
          recommendations: result.recommendations?.map((rec: string, index: number) => ({
            nutrient: `Rekommendation ${index + 1}`,
            description: rec,
            foods: result.functionalFoods?.slice(index * 2, index * 2 + 2) || [],
            supplements: "Konsultera en läkare för specifika doseringar"
          })) || [
            {
              nutrient: "Magnesium",
              description: "Hjälper mot muskelspänningar och stress",
              foods: ["Nötter", "Mörk choklad", "Avokado"],
              supplements: "Magnesiumcitrat 200-400mg dagligen"
            },
            {
              nutrient: "Omega-3",
              description: "Minskar inflammation och stödjer hjärnhälsan",
              foods: ["Fet fisk", "Valnötter", "Chiafrön"],
              supplements: "Fiskolja 1000mg dagligen"
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
        
        setAnalysisResult(transformedResult);
        setShowResults(true);
        setIsLoading(false);
      } catch (error) {
        setLoadingError('Något gick fel vid analysen. Försök igen.');
        setIsLoading(false);
      }
    }, 12000); // 12 seconds loading time
  };

  const handleScaleAnswer = (value: number) => {
    handleAnswer(value.toString());
  };

  const handleRestart = () => {
    setShowResults(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setTextInput('');
    setAnalysisResult(null);
    onCancel();
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setTextInput(answers[currentQuestion - 1] || '');
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'scale':
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-wrap justify-center gap-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleScaleAnswer(value)}
                  className={`w-14 h-14 rounded-2xl font-semibold transition-all duration-300 transform ${
                    answers[currentQuestion] === value.toString()
                      ? 'bg-gradient-to-br from-accent to-accent-hover text-white scale-110 shadow-lg'
                      : 'bg-white border-2 border-gray-200 hover:border-accent hover:scale-105 hover:shadow-md'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between w-full max-w-md text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-2">
                <span className="text-2xl">😊</span>
                Ingen smärta
              </span>
              <span className="flex items-center gap-2">
                Värsta tänkbara
                <span className="text-2xl">😰</span>
              </span>
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="grid grid-cols-1 gap-4">
            {question.options?.map((option, index) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`px-6 py-4 text-left rounded-2xl transition-all duration-300 transform ${
                  answers[currentQuestion] === option
                    ? 'bg-gradient-to-r from-accent to-accent-hover text-white shadow-xl scale-[1.02]'
                    : 'bg-white border-2 border-gray-200 hover:border-accent hover:shadow-lg hover:scale-[1.01]'
                } ${index === 0 ? 'animate-fade-in' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="font-medium text-lg">{option}</span>
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="flex flex-col space-y-4">
            <textarea
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-accent focus:outline-none transition-all duration-300 resize-none text-gray-700 shadow-sm focus:shadow-lg"
              rows={4}
              placeholder="Skriv ditt svar här..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              style={{ fontSize: '16px' }}
            />
            <button
              onClick={() => handleAnswer(textInput)}
              disabled={!textInput.trim()}
              className="self-end px-8 py-3 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Nästa fråga →
            </button>
          </div>
        );
    }
  };

  if (showLoadingPopup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl px-12 py-10 flex flex-col items-center shadow-2xl max-w-md w-full mx-4 animate-fade-in">
          <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
            />
          </div>
          <GiSparkles className="w-12 h-12 text-accent mb-4 animate-pulse" />
          <div className="text-xl font-medium text-primary mb-2 text-center">{loadingMessages[loadingStep]}</div>
          <div className="text-sm text-text-secondary">Vänligen vänta medan vi bearbetar din information...</div>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl max-w-md w-full mx-4 animate-fade-in text-center">
          <div className="text-red-600 text-lg font-semibold mb-4">{loadingError}</div>
          <button onClick={() => setLoadingError(null)} className="mt-2 px-6 py-2 bg-accent text-white rounded-full">Stäng</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingAnalysis />;
  }

  if (showResults && analysisResult) {
    return <QuizResultScreen quizData={analysisResult} onRestart={handleRestart} />;
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative animate-fade-in">
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300"
            aria-label="Stäng"
          >
            <span className="text-2xl text-gray-600">×</span>
          </button>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-red-600 mb-6 text-lg">Inga frågor hittades för denna kroppsdel.</p>
          <button onClick={onCancel} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-all duration-300">
            Gå tillbaka
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 max-w-3xl w-full mx-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl pointer-events-none"></div>
        
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-6 top-6 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 z-10 group"
          aria-label="Stäng"
        >
          <span className="text-2xl text-gray-600 group-hover:text-gray-800 transition-colors">×</span>
        </button>
        
        {/* Header */}
        <div className="mb-8 pr-12 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-1">
                Hälsoanalys
              </h3>
              <p className="text-lg font-medium text-gray-600">
                Fråga {currentQuestion + 1} av {questions.length}
              </p>
            </div>
            <div className="text-4xl opacity-20">
              {currentQuestion < questions.length / 3 ? '🌱' : 
               currentQuestion < (questions.length * 2) / 3 ? '🌿' : '🌳'}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-lg">
              <div className="w-6 h-6 bg-gradient-to-br from-accent to-accent-hover rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-sm font-bold text-accent">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">färdig</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8 relative">
          <h2 className="text-2xl md:text-3xl font-light text-gray-800 mb-8 text-center leading-relaxed animate-fade-in">
            {questions[currentQuestion].question}
          </h2>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {renderQuestion(questions[currentQuestion])}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 relative">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:text-gray-800 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl hover:bg-gray-100 group"
          >
            <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Föregående</span>
          </button>
          
          {currentQuestion === questions.length - 1 && questions[currentQuestion].type !== 'text' && (
            <button
              onClick={() => handleComplete()}
              className="px-8 py-3 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Slutför analys
              <span className="text-xl">✨</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 