'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader, ArrowRight } from 'lucide-react';
import { useT } from '@/app/lib/i18n/LanguageProvider';

interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'hero';
  showName?: boolean;
}

export default function NewsletterSignup({ 
  title,
  subtitle,
  variant = 'default',
  showName = false
}: NewsletterSignupProps) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [hp, setHp] = useState('');

  const localTitle = title ?? t('newsletter.title','Få de senaste tipsen om Functional Foods');
  const localSubtitle = subtitle ?? t('newsletter.subtitle','Bli först med att få våra bästa råd och recept direkt i din inkorg');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) { setEmailError(t('newsletter.invalidEmail','Ogiltig e‑postadress')); return; }
    setEmailError(null);
    if (hp) { return; }
    if (!privacyAccepted) {
      setMessage(t('newsletter.error','Något gick fel. Försök igen senare.'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, hp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || t('newsletter.success','Tack för din prenumeration!'));
        setEmail('');
        setFirstName('');
        setLastName('');
        setPrivacyAccepted(false);
      } else {
        setStatus('error');
        setMessage(data.error || t('newsletter.error','Något gick fel. Försök igen senare.'));
      }
    } catch (error) {
      setStatus('error');
      setMessage(t('newsletter.genericError','Ett fel uppstod. Försök igen senare.'));
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{localTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.emailPlaceholder','din@email.se')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9dc46d] focus:border-transparent"
              required
            />
            <input type="text" value={hp} onChange={(e)=>setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button
              type="submit"
              disabled={status === 'loading' || !email}
                              className="px-4 py-2 bg-[#FF7e70] text-white rounded-lg hover:bg-[#e56b5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                t('newsletter.subscribeShort','Prenumerera')
              )}
            </button>
          </div>
          {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
          
          <div className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              id="privacy-checkbox-compact"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-[#1a4324] border-gray-300 rounded focus:ring-2 focus:ring-[#9dc46d] cursor-pointer hover:border-[#9dc46d] transition-colors relative z-10"
              style={{ accentColor: '#1a4324' }}
              required
            />
            <label htmlFor="privacy-checkbox-compact" className="text-gray-600 cursor-pointer select-none flex-1">
              {t('newsletter.acceptPrivacy','Jag accepterar ')}
              <a href="/integritetspolicy" className="text-[#1a4324] hover:underline ml-1 relative z-10">
                {t('newsletter.policy','integritetspolicyn')}
              </a>
            </label>
          </div>

          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-sm ${status === 'success' ? 'text-primary' : 'text-red-600'}`}
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-white rounded-3xl p-8 md:p-10 max-w-xl mx-auto border border-[#F3EFE3] shadow-2xl"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-16 h-16 bg-[#F3EFE3] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Mail className="w-8 h-8 text-[#112A12]" />
          </motion.div>
          
          <h3 className="text-2xl md:text-3xl font-bold mb-2 text-[#112A12] text-center">{localTitle}</h3>
          <p className="text-[#112A12]/80 text-center mb-8">{localSubtitle}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.emailPlaceholder','din@email.se')}
                className="w-full px-6 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-500 
                         border-2 border-[#F3EFE3] focus:border-[#93C560]
                         transition-all duration-300 outline-none shadow-lg group-hover:shadow-xl"
                required
              />
              {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
              <input type="text" value={hp} onChange={(e)=>setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            </div>
            
            <label 
              htmlFor="privacy-checkbox-hero-new" 
              className="flex items-center gap-3 p-4 rounded-2xl bg-[#F3EFE3] border border-[#F3EFE3] cursor-pointer hover:bg-[#e9e3d6] transition-all duration-300 group"
            >
              <input
                type="checkbox"
                id="privacy-checkbox-hero-new"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-[#112A12]/30 bg-transparent checked:bg-[#93C560] checked:border-[#93C560] focus:ring-2 focus:ring-[#93C560] focus:ring-offset-0 cursor-pointer transition-all duration-300"
                required
              />
              <span className="text-[#112A12]/80 text-sm flex-1 select-none">
                {t('newsletter.acceptPrivacy','Jag accepterar ')}
                <a 
                  href="/integritetspolicy" 
                  className="underline underline-offset-2 hover:text-[#112A12] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('newsletter.policy','integritetspolicyn')}
                </a>
              </span>
            </label>
            
            <motion.button
              type="submit"
              disabled={status === 'loading' || !email || !privacyAccepted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-[#FF7e70] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#e56b5e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              {status === 'loading' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{t('newsletter.subscribing','Prenumererar...')}</span>
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>{t('newsletter.success','Tack för din prenumeration!')}</span>
                </>
              ) : (
                <>
                  <span>{t('newsletter.subscribe','Prenumerera på nyhetsbrev')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-center text-sm ${status === 'success' ? 'text-[#112A12]' : 'text-red-600'}`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{localTitle}</h3>
      <p className="text-gray-600 mb-6">{localSubtitle}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {showName && (
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('newsletter.firstName','Förnamn')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9dc46d] focus:border-transparent"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('newsletter.lastName','Efternamn')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9dc46d] focus:border-transparent"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.emailPlaceholder','din@email.se')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9dc46d] focus:border-transparent"
            required
          />
          <input type="text" value={hp} onChange={(e)=>setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {emailError && <span className="text-xs text-red-600">{emailError}</span>}
          <button
            type="submit"
            disabled={status === 'loading' || !email || !privacyAccepted}
            className="px-6 py-2 bg-[#1a4324] text-white font-medium rounded-lg hover:bg-[#9dc46d] hover:text-[#1a4324] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : status === 'success' ? (
              <>
                <Check className="w-5 h-5" />
                {t('newsletter.thanksShort','Tack!')}
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                {t('newsletter.subscribeShort','Prenumerera')}
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            id="privacy-checkbox-default"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-[#1a4324] border-gray-300 rounded focus:ring-2 focus:ring-[#9dc46d] cursor-pointer hover:border-[#9dc46d] transition-colors relative z-10"
            style={{ accentColor: '#1a4324' }}
            required
          />
          <label htmlFor="privacy-checkbox-default" className="text-gray-600 cursor-pointer select-none flex-1">
            {t('newsletter.acceptPrivacy','Jag accepterar ')}
            <a href="/integritetspolicy" className="text-[#1a4324] hover:underline ml-1 relative z-10">{t('newsletter.policy','integritetspolicyn')}</a>
          </label>
        </div>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm ${status === 'success' ? 'text-primary' : 'text-red-600'}`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
} 