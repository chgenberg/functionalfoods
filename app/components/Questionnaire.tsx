"use client";
import { useState } from 'react';
import { Question, bodyPartQuestions } from '../types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface QuestionnaireProps {
  bodyPart: string;
  onComplete: (answers: string[]) => void;
  onCancel: () => void;
}

export default function Questionnaire({ bodyPart, onComplete, onCancel }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const questions = bodyPartQuestions[bodyPart] || [];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTextInput('');
    } else {
      onComplete(newAnswers);
    }
  };

  const handleScaleAnswer = (value: number) => {
    handleAnswer(value.toString());
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
            <div className="flex flex-wrap justify-center gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleScaleAnswer(value)}
                  className={`w-12 h-12 rounded-full font-medium transition-all duration-200 ${
                    answers[currentQuestion] === value.toString()
                      ? 'bg-accent text-white scale-110'
                      : 'bg-white border-2 border-border hover:border-accent hover:scale-105'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between w-full max-w-md text-sm text-text-secondary">
              <span>Ingen smärta</span>
              <span>Värsta tänkbara</span>
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="grid grid-cols-1 gap-3">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`px-6 py-4 text-left rounded-xl transition-all duration-200 ${
                  answers[currentQuestion] === option
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-white border border-border hover:border-accent hover:shadow-md'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="flex flex-col space-y-4">
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none transition-colors duration-200 resize-none"
              rows={4}
              placeholder="Skriv ditt svar här..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button
              onClick={() => handleAnswer(textInput)}
              disabled={!textInput.trim()}
              className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Nästa fråga
            </button>
          </div>
        );
    }
  };

  if (questions.length === 0) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <p className="text-error mb-4">Inga frågor hittades för denna kroppsdel.</p>
        <button onClick={onCancel} className="btn-secondary">
          Gå tillbaka
        </button>
      </div>
    );
  }

  return (
    <div className="card max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text-secondary">
            Fråga {currentQuestion + 1} av {questions.length}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-200"
            aria-label="Avbryt"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-light text-primary mb-6">
          {questions[currentQuestion].question}
        </h2>
        {renderQuestion(questions[currentQuestion])}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Föregående</span>
        </button>
        
        {currentQuestion === questions.length - 1 && questions[currentQuestion].type !== 'text' && (
          <button
            onClick={() => onComplete(answers)}
            className="btn-primary"
          >
            Slutför analys
          </button>
        )}
      </div>
    </div>
  );
} 