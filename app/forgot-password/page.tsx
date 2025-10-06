"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Ange din e-postadress');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Ett fel uppstod. Försök igen.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ett tekniskt fel uppstod. Kontrollera din internetanslutning och försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to login */}
        <Link 
          href="/login" 
          className="inline-flex items-center text-text-primary hover:text-primary mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till inloggning
        </Link>

        <div className="bg-background-secondary rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300">
          {/* Header with Logo */}
          <div className="pt-10 pb-4 px-8 text-center bg-background-secondary">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-full mb-4 shadow-lg">
              <Mail className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Glömt lösenord?
            </h2>
            <p className="text-text-secondary">
              Ange din e-postadress så skickar vi instruktioner för att återställa ditt lösenord.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            {/* Success Message */}
            {status === 'success' && (
              <div className="bg-[#f0fdf4] border border-[#93C560] text-[#014421] px-4 py-3 rounded-xl text-sm animate-slideIn">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#93C560] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">E-post skickad!</h3>
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Något gick fel</h3>
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-postadress
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.se"
                  className="w-full pl-11 pr-4 py-3 bg-background-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={isSubmitting || status === 'success'}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || status === 'success'}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                isSubmitting || status === 'success'
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#FF7e70] text-white hover:bg-[#e56b5e] hover:scale-[1.02] shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Skickar...
                </span>
              ) : status === 'success' ? (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  E-post skickad
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />
                  Skicka återställningslänk
                </span>
              )}
            </button>

            {/* Help text */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-text-secondary mb-4">
                Kom ihåg att kontrollera din skräppost-mapp om du inte ser e-posten inom några minuter.
              </p>
              <p className="text-sm text-text-secondary">
                Behöver du hjälp?{' '}
                <Link href="/kontakt" className="text-[#014421] hover:text-[#116530] font-medium hover:underline">
                  Kontakta oss
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
} 