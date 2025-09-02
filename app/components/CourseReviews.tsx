"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, ThumbsUp, X, AlertCircle } from 'lucide-react';
import { useErrorHandler } from '../lib/errorHandler';

interface Review {
  id: string;
  courseId: string;
  rating?: number | null;
  answers: any;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export default function CourseReviews({ courseId, limit = 6 }: { courseId: string; limit?: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { withErrorHandling } = useErrorHandler();

  useEffect(() => {
    const loadReviews = async () => {
      const result = await withErrorHandling(
        async () => {
          const res = await fetch(`/api/reviews?courseId=${courseId}&status=APPROVED`);
          if (!res.ok) {
            throw new Error(`Failed to fetch reviews: ${res.status}`);
          }
          const data = await res.json();
          return data.reviews || [];
        },
        'CourseReviews.loadReviews',
        (errorMessage) => setError(errorMessage)
      );

      if (result) {
        const reviewList = result;
        setReviews(limit && limit > 0 ? reviewList.slice(0, limit) : reviewList);
      }
      setLoading(false);
    };

    loadReviews();
  }, [courseId, limit, withErrorHandling]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-100 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Kunde inte ladda recensioner</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Försök igen
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Bli den första att recensera!</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Denna kurs är ny och vi skulle uppskatta din feedback efter genomförd kurs. 
            Din recension hjälper andra att fatta rätt beslut.
          </p>
        </div>
      </section>
    );
  }

  // Calculate average rating
  const ratingsWithValues = reviews.filter(r => r.rating).map(r => r.rating!);
  const averageRating = ratingsWithValues.length > 0 
    ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length 
    : 0;

  const getDisplayName = (review: Review) => {
    if (review.user?.name) {
      return review.user.name.split(' ')[0]; // First name only
    }
    if (review.user?.email) {
      return review.user.email.split('@')[0].charAt(0).toUpperCase() + review.user.email.split('@')[0].slice(1);
    }
    return 'Anonym';
  };

  const getFeedbackText = (review: Review) => {
    if (typeof review.answers === 'object' && review.answers.feedback) {
      return review.answers.feedback;
    }
    if (Array.isArray(review.answers) && review.answers.length > 0) {
      return review.answers[0]?.a || review.answers[1]?.a || '';
    }
    return '';
  };

  return (
    <section className="py-16 bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Stats */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-6"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900">
              {averageRating.toFixed(1)} / 5
            </span>
            <span className="text-gray-500">
              ({reviews.length} {reviews.length === 1 ? 'recension' : 'recensioner'})
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Vad säger våra deltagare?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Äkta recensioner från människor som har genomfört kursen och förändrat sina liv
          </motion.p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              onClick={() => setSelectedReview(review)}
            >
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (review.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-6 line-clamp-4 leading-relaxed">
                "{getFeedbackText(review).slice(0, 150)}..."
              </p>

              {/* Reviewer Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 bg-[#014421] rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{getDisplayName(review)}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(review.createdAt).toLocaleDateString('sv-SE', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              </div>

              {/* Read More Indicator */}
              <div className="mt-3 text-[#014421] text-sm font-medium flex items-center gap-1">
                <FiThumbsUp className="w-4 h-4" />
                Klicka för att läsa mer
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show More Button */}
        {limit && reviews.length >= limit && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setReviews([])} // This would load more in a real implementation
              className="bg-[#014421] text-white px-8 py-3 rounded-full font-medium hover:bg-[#116530] transition-colors"
            >
              Visa fler recensioner
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Kursrecension</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Stäng"
              >
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar
                    key={star}
                    className={`w-6 h-6 ${
                      star <= (selectedReview.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xl font-bold text-gray-900">
                {selectedReview.rating || 5}/5 stjärnor
              </span>
            </div>

            {/* Full Review */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Feedback:</h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                "{getFeedbackText(selectedReview)}"
              </p>
            </div>

            {/* Reviewer Info */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
              <div className="w-12 h-12 bg-[#014421] rounded-full flex items-center justify-center">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{getDisplayName(selectedReview)}</div>
                <div className="text-sm text-gray-500">
                  Genomförde kursen {new Date(selectedReview.createdAt).toLocaleDateString('sv-SE', { 
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
} 