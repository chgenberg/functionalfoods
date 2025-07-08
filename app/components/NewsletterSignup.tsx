'use client';

import { useState } from 'react';
import { FiMail, FiCheck, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'hero';
  showName?: boolean;
}

export default function NewsletterSignup({ 
  title = "Massor av matglädje - gratis!",
  subtitle = "Skriv upp dig på vårt nyhetsbrev och få rabatter, erbjudanden och matglädje från Functional foods varje vecka.",
  variant = 'default',
  showName = false
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyAccepted) {
      setMessage('Du måste acceptera vår integritetspolicy');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Tack för din prenumeration!');
        // Rensa formuläret
        setEmail('');
        setFirstName('');
        setLastName('');
        setPrivacyAccepted(false);
      } else {
        setStatus('error');
        setMessage(data.error || 'Något gick fel. Försök igen senare.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ett fel uppstod. Försök igen senare.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.se"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                'Prenumerera'
              )}
            </button>
          </div>
          
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span className="text-gray-600">
              Jag har tagit del av informationen rörande hanteringen av personuppgifter, 
              <a href="/integritetspolicy" className="text-primary hover:underline ml-1">läs mer</a>
            </span>
          </label>

          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <FiMail className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg mb-8 opacity-90">{subtitle}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {showName && (
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Förnamn"
                  className="px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Efternamn"
                  className="px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.se"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email || !privacyAccepted}
                className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : status === 'success' ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Prenumererad!
                  </>
                ) : (
                  'Prenumerera nu'
                )}
              </button>
            </div>
            
            <label className="flex items-center justify-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4"
                required
              />
              <span className="opacity-90">
                Jag accepterar 
                <a href="/integritetspolicy" className="underline ml-1">integritetspolicyn</a>
              </span>
            </label>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm"
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{subtitle}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {showName && (
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Förnamn"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Efternamn"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.se"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email || !privacyAccepted}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <FiLoader className="w-5 h-5 animate-spin" />
            ) : status === 'success' ? (
              <>
                <FiCheck className="w-5 h-5" />
                Tack!
              </>
            ) : (
              <>
                <FiMail className="w-5 h-5" />
                Prenumerera
              </>
            )}
          </button>
        </div>
        
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-0.5"
            required
          />
          <span className="text-gray-600">
            Jag har tagit del av informationen rörande hanteringen av personuppgifter, 
            <a href="/integritetspolicy" className="text-primary hover:underline ml-1">läs mer</a>
          </span>
        </label>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
} 