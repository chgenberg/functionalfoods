"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function EmailReviewForm() {
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const userId = searchParams?.get('userId');
  const courseId = searchParams?.get('courseId');
  const courseName = searchParams?.get('courseName') || 'kursen';

  useEffect(() => {
    if (!userId || !courseId) {
      setError('Ogiltig länk. Kontakta support för hjälp.');
    }
  }, [userId, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !feedback.trim() || !consent || !userId || !courseId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews/email-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          rating,
          feedback: feedback.trim(),
          consent
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Något gick fel. Försök igen.');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      setError('Något gick fel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !userId) {
    return (
      <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ogiltig länk</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-[#014421] text-white px-6 py-3 rounded-full font-medium hover:bg-[#116530] transition-colors"
          >
            Till startsidan
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-[#93C560] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#014421] mb-4">Tack för din recension!</h1>
          <p className="text-gray-600 mb-6">
            Din recension har skickats in och kommer att granskas innan publicering. 
            Tack för att du hjälper andra att förstå värdet av {courseName}!
          </p>
          <Link
            href="/"
            className="bg-[#014421] text-white px-6 py-3 rounded-full font-medium hover:bg-[#116530] transition-colors"
          >
            Till startsidan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#014421] mb-4">
            Hur upplevde du {courseName}?
          </h1>
          <p className="text-gray-600">
            Din åsikt hjälper oss att förbättra kursen och hjälper andra att fatta rätt beslut.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Hur nöjd är du med kursen?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {rating === 0 && 'Klicka för att sätta betyg'}
              {rating === 1 && 'Mycket dålig'}
              {rating === 2 && 'Dålig'}
              {rating === 3 && 'Okej'}
              {rating === 4 && 'Bra'}
              {rating === 5 && 'Utmärkt'}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-lg font-medium text-gray-900 mb-3">
              Berätta mer om din upplevelse
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 outline-none transition-colors resize-none"
              placeholder="Vad var bäst med kursen? Hur har den påverkat din hälsa? Skulle du rekommendera den till andra?"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Minst 50 tecken ({feedback.length}/50)
            </p>
          </div>

          {/* Consent */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-5 h-5 text-[#014421] border-gray-300 rounded focus:ring-[#014421]/20"
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
              Jag samtycker till att min recension publiceras på Functional Foods webbplats 
              för att hjälpa andra potentiella kursdeltagare. Jag förstår att recensionen 
              kan redigeras för klarhet men att innehållet förblir korrekt.
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!rating || feedback.length < 50 || !consent || isSubmitting}
            className="w-full bg-[#014421] text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-[#116530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Skickar recension...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Skicka recension
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Har du tekniska problem? Kontakta oss på{' '}
            <a href="mailto:support@functionalfoods.se" className="text-[#014421] hover:text-[#116530]">
              support@functionalfoods.se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-8 h-8 border-2 border-[#014421]/30 border-t-[#014421] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Laddar recensionsformulär...</p>
      </div>
    </div>
  );
}

export default function EmailReviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailReviewForm />
    </Suspense>
  );
} 