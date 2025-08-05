"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiBook, FiUsers, FiHeart, FiZap, FiTarget, FiAward, FiCheck, FiPlay, FiStar } from "react-icons/fi";
import { GiFruitBowl, GiMeal, GiHealthNormal } from "react-icons/gi";
import Image from "next/image";
import HealthQuiz from "./components/HealthQuiz";
import QuizResultScreen from "./components/QuizResultScreen";
import NewsletterSignup from "./components/NewsletterSignup";
import ArticleQuickAccess from "./components/ArticleQuickAccess";
import FeaturePopup from "./components/FeaturePopup";

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, string> | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
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
    <div className="min-h-screen bg-white">
      {/* Article Quick Access Button */}
      <ArticleQuickAccess />
      
      {/* ULTRA SIMPLE VIDEO TEST */}
      <section className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl font-bold text-center mb-8">VIDEO DEBUG TEST</h1>
        
        {/* MINIMAL video element */}
        <div className="max-w-4xl mx-auto">
          <video
            src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
            width="800"
            height="450"
            controls
            muted
            autoPlay
            loop
            className="w-full border-4 border-red-500"
          >
            Your browser does not support the video tag.
          </video>
          
          <div className="mt-4 p-4 bg-yellow-200 border border-yellow-400 rounded">
            <h2 className="font-bold">STATUS:</h2>
            <p>• External video URL: sample-videos.com</p>
            <p>• Controls: Enabled</p>
            <p>• Red border: Should be visible</p>
            <p>• If you see this but NO video, Safari blocks external videos</p>
          </div>
        </div>
      </section>

      {/* Simple test sections */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Video Test Results</h2>
          <p className="text-xl text-gray-600">Check if the video played above. If not, there's a browser/platform issue.</p>
        </div>
      </section>
    </div>
  );
}