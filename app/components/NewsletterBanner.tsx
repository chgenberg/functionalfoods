"use client";
import { useState } from 'react';
import { FiMail, FiCheck, FiX } from 'react-icons/fi';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      // Här skulle du normalt skicka email till din backend/nyhetsbrevstjänst
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulera API-anrop
      
      setStatus('success');
      setEmail('');
      
      // Göm bannern efter 3 sekunder vid success
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white relative">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <FiMail className="w-5 h-5" />
            <p className="text-sm font-medium">
              Få de senaste hälsotipsen direkt i din inkorg!
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Din e-postadress"
              className="px-4 py-2 rounded-full text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={status === 'loading' || status === 'success'}
            />
            
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 ${
                status === 'success'
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {status === 'loading' && 'Skickar...'}
              {status === 'success' && (
                <span className="flex items-center gap-1">
                  <FiCheck className="w-4 h-4" />
                  Tack!
                </span>
              )}
              {status === 'idle' && 'Prenumerera'}
              {status === 'error' && 'Försök igen'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  );
} 