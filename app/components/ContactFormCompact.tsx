"use client";
import { useState } from 'react';
import { FiSend, FiMail, FiMessageSquare } from 'react-icons/fi';
import { useT } from '../lib/i18n/LanguageProvider';

export default function ContactFormCompact() {
  const t = useT();
  const [formData, setFormData] = useState({
    namn: '',
    email: '',
    meddelande: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amne: t('contact.quick.subject','Snabbmeddelande från footer')
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setShowSuccess(true);
        setFormData({ namn: '', email: '', meddelande: '' });
        setTimeout(() => { setShowSuccess(false); setIsExpanded(false); }, 5000);
      } else {
        alert(result.error || t('newsletter.error','Något gick fel. Försök igen senare.'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(t('newsletter.genericError','Ett fel uppstod. Försök igen senare.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <FiMessageSquare className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">{t('contact.quick.title','Snabbkontakt')}</h3>
        </div>
        <button className="text-white hover:text-accent transition-colors">
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t('contact.placeholder.name','Ditt namn')}
              value={formData.namn}
              onChange={(e) => setFormData({...formData, namn: e.target.value})}
              className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-accent transition-colors"
              required
            />
            <input
              type="email"
              placeholder={t('contact.placeholder.email','din@email.se')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>
          
          <textarea
            placeholder={t('contact.placeholder.message','Skriv ditt meddelande här...')}
            value={formData.meddelande}
            onChange={(e) => setFormData({...formData, meddelande: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-accent transition-colors resize-none"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('contact.sending','Skickar...')}
              </>
            ) : (
              <>
                {t('contact.quick.send','Skicka')}
                <FiSend className="w-4 h-4" />
              </>
            )}
          </button>

          {showSuccess && (
            <div className="p-3 bg-primary/20 border border-primary/30 rounded-lg">
              <p className="text-accent text-sm">{t('contact.quick.sent','✓ Meddelande skickat!')}</p>
            </div>
          )}
        </form>
      )}

      {!isExpanded && (
        <p className="text-white/60 text-sm mt-2">
          {t('contact.quick.cta','Har du en snabb fråga? Klicka här!')}
        </p>
      )}
    </div>
  );
} 