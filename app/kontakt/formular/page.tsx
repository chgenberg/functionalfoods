"use client";
import { useState } from 'react';

import { useT } from '@/app/lib/i18n/LanguageProvider';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function KontaktFormular() {
  const t = useT();
  const [formData, setFormData] = useState({ namn: '', email: '', amne: '', meddelande: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setShowSuccess(true);
        setFormData({ namn: '', email: '', amne: '', meddelande: '' });
        setTimeout(() => setShowSuccess(false), 5000);
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
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Send className="w-4 h-4" />
            <span>{t('contact.replyIn24h','Vi svarar inom 24 timmar')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            {t('contact.title','Kontakta')} <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold animate-gradient">{t('contact.weAreHere','oss')}</span>
          </h1>
          <p className="text-lg text-text-secondary">
            {t('contact.intro1','Har du frågor om functional foods eller vill boka en konsultation?')} {t('contact.intro2','Vi finns här för att hjälpa dig på din hälsoresa.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-primary">{t('contact.phone','Telefon')}</h3>
                  <p className="text-text-secondary">+46 70 123 45 67</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-primary">{t('contact.email','E-post')}</h3>
                  <p className="text-text-secondary">info@functionalfoods.se</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-primary">{t('contact.address','Adress')}</h3>
                  <p className="text-text-secondary">{t('footer.city','Stockholm, Sverige')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-primary">{t('contact.hours','Öppettider')}</h3>
                  <p className="text-text-secondary">{t('contact.hours.val','Mån-Fre: 9:00-17:00')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label htmlFor="namn" className="block text-sm font-medium text-primary mb-2">{t('contact.name','Namn')}</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'namn' ? 'text-accent' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        id="namn"
                        value={formData.namn}
                        onChange={(e) => setFormData({...formData, namn: e.target.value})}
                        onFocus={() => setFocusedField('namn')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                        placeholder={t('contact.placeholder.name','Ditt namn')}
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">{t('contact.email','E-post')}</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-accent' : 'text-gray-400'}`} />
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                        placeholder={t('contact.placeholder.email','din@email.se')}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="amne" className="block text-sm font-medium text-primary mb-2">{t('contact.subject','Ämne')}</label>
                  <div className="relative">
                    <Send className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'amne' ? 'text-accent' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      id="amne"
                      value={formData.amne}
                      onChange={(e) => setFormData({...formData, amne: e.target.value})}
                      onFocus={() => setFocusedField('amne')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                      placeholder={t('contact.placeholder.subject','Vad gäller din fråga?')}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="meddelande" className="block text-sm font-medium text-primary mb-2">{t('contact.message','Meddelande')}</label>
                  <textarea
                    id="meddelande"
                    value={formData.meddelande}
                    onChange={(e) => setFormData({...formData, meddelande: e.target.value})}
                    onFocus={() => setFocusedField('meddelande')}
                    onBlur={() => setFocusedField(null)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-none"
                    placeholder={t('contact.placeholder.message','Berätta mer om hur vi kan hjälpa dig...')}
                    required
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-text-secondary">
                    {formData.meddelande.length}/500
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg font-medium relative overflow-hidden group">
                  <span className="relative z-10 flex items-center">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t('contact.sending','Skickar...')}
                      </>
                    ) : (
                      <>
                        {t('contact.send','Skicka meddelande')}
                        <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-hover to-accent transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
              </form>

              {showSuccess && (
                <div className="mt-6 p-4 bg-background-secondary border border-border rounded-lg animate-fade-in">
                  <p className="text-secondary font-medium">{t('contact.success','✓ Tack för ditt meddelande! Vi återkommer inom 24 timmar.')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-3">{t('contact.faq','Vanliga frågor?')}</h2>
            <p className="text-text-secondary mb-6">
              {t('contact.faqIntro','Kolla in vår FAQ-sektion för snabba svar på de vanligaste frågorna om functional foods.')}
            </p>
            <a href="/kontakt/faq" className="btn-secondary inline-flex items-center">
              {t('contact.faqSee','Se vanliga frågor')}
              <Send className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
} 