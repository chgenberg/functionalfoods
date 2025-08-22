'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiHeart, FiSend, FiCheckCircle } from 'react-icons/fi';

interface CourseReviewFormProps {
  courseId: string;
  courseName: string;
  onSubmitSuccess?: () => void;
}

export default function CourseReviewForm({ courseId, courseName, onSubmitSuccess }: CourseReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !feedback.trim() || !consent) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user', // This should come from auth context
          courseId,
          rating,
          answers: {
            feedback: feedback.trim(),
            wouldRecommend: rating >= 4,
            completedAt: new Date().toISOString()
          },
          consent,
          source: 'IN_APP'
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        onSubmitSuccess?.();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Tack för din recension!</h3>
        <p className="text-gray-600 mb-4">
          Din feedback hjälper oss att förbättra kursen och hjälper andra att fatta rätt beslut.
        </p>
        <p className="text-sm text-gray-500">
          Din recension kommer att granskas och publiceras inom 1-2 arbetsdagar.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <FiHeart className="w-12 h-12 text-[#014421] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Hur upplevde du {courseName}?</h3>
        <p className="text-gray-600">
          Din feedback är ovärderlig för oss och hjälper andra att fatta rätt beslut
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="text-center">
          <label className="block text-lg font-medium text-gray-900 mb-4">
            Hur många stjärnor ger du kursen?
          </label>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all duration-200 transform hover:scale-110"
              >
                <FiStar
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            {rating === 0 && 'Klicka för att betygsätta'}
            {rating === 1 && 'Inte bra 😞'}
            {rating === 2 && 'Kunde vara bättre 😐'}
            {rating === 3 && 'Okej 🙂'}
            {rating === 4 && 'Riktigt bra! 😊'}
            {rating === 5 && 'Fantastisk! 🤩'}
          </div>
        </div>

        {/* Feedback Text */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-3">
            Berätta om din upplevelse
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Vad var bäst med kursen? Vad kunde förbättras? Hur känner du dig efter att ha genomfört kursen?"
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#014421] focus:border-transparent resize-none"
            required
          />
          <div className="text-sm text-gray-500 mt-2">
            {feedback.length}/500 tecken
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-5 h-5 text-[#014421] border-gray-300 rounded focus:ring-[#014421]"
            required
          />
          <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
            Jag godkänner att min recension publiceras på kurssidan för att hjälpa andra potentiella kursdeltagare. 
            Endast mitt förnamn och betyg kommer att visas offentligt.
          </label>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-4">
          <motion.button
            type="submit"
            disabled={!rating || !feedback.trim() || !consent || isSubmitting}
            className="bg-[#014421] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
            whileHover={{ scale: !rating || !feedback.trim() || !consent ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSend className="w-5 h-5" />
            {isSubmitting ? 'Skickar...' : 'Skicka recension'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
} 