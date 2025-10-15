"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send, User, Mail } from 'lucide-react';
import { useT } from "@/app/lib/i18n/LanguageProvider";

export default function AdressPage() {
  const t = useT();
  const [formData, setFormData] = useState({
    namn: "",
    email: "",
    meddelande: "",
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroError, setHeroError] = useState(false);

  const canSubmit =
    consent && formData.namn.trim() !== "" && formData.email.trim() !== "" && formData.meddelande.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namn: formData.namn,
          email: formData.email,
          amne: "Kontakt via adress-sidan",
          meddelande: formData.meddelande,
          consent,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result?.error || "Ett fel uppstod. Försök igen senare.");
        return;
      }

      setShowSuccess(true);
      setFormData({ namn: "", email: "", meddelande: "" });
      setConsent(false);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Ett fel uppstod. Försök igen senare.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fffdf3" }}>
      <div className="container-custom section-padding">
        {/* Back Link */}
        <Link
          href="/"
          prefetch={false}
          className="inline-flex items-center text-text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('contact.backHome','Tillbaka till förstasidan')}
        </Link>

        {/* Hero Image */}
        <div className="relative h-56 md:h-72 lg:h-96 rounded-2xl overflow-hidden shadow-lg mb-10 group">
          {!heroError && (
            <Image
              src="/kontakta-oss/gronsallad.jpg"
              alt="Kontakta oss"
              fill
              priority
              unoptimized
              sizes="100vw"
              className={`object-cover will-change-transform transition-transform duration-700 group-hover:scale-[1.03] ${heroLoaded ? 'animate-kenburns' : ''}`}
              onLoadingComplete={() => setHeroLoaded(true)}
              onError={() => setHeroError(true)}
            />
          )}
          {/* Fallback skeleton / bakgrund */}
          {!heroLoaded && !heroError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          )}
          {heroError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8 text-white">
            {/* Removed the 24h reply badge per request */}
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow">{t('contact.title','Kontakta oss')}</h1>
          </div>
        </div>

        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            {t('contact.weAreHere','VI FINNS HÄR FÖR DIG')}
          </h2>
          <p className="text-lg text-text-secondary mb-3">
            {t('contact.intro1','Vi gör vårt yttersta för att svara på alla dina frågor.')}
          </p>
          <p className="text-lg text-text-secondary mb-3">
            {t('contact.intro2','Kontakta oss via chatten, använd formuläret här nedan eller maila oss så återkommer vi inom 24 timmar.')}
          </p>
          <div className="mt-6 p-4 bg-white rounded-xl shadow-md inline-block">
            <p className="text-primary font-medium">{t('contact.tip','Tips!')}</p>
            <p className="text-text-secondary">
              {t('contact.tipText1','Titta gärna om du kan hitta svaret på din fråga under ')}
              <Link href="/kontakt/faq" className="text-accent hover:underline">
                {t('contact.faqTitle','Frågor & Svar')}
              </Link>{" "}
              {t('contact.tipText2','innan du kontaktar oss.')}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="namn" className="block text-sm font-medium text-primary mb-2">
                  {t('contact.name','Namn')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="namn"
                    type="text"
                    value={formData.namn}
                    onChange={(e) => setFormData({ ...formData, namn: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Ditt namn"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                  {t('contact.email','E-post')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="din@mail.se"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="meddelande" className="block text-sm font-medium text-primary mb-2">
                  {t('contact.message','Meddelande')}
                </label>
                <textarea
                  id="meddelande"
                  rows={6}
                  value={formData.meddelande}
                  onChange={(e) => setFormData({ ...formData, meddelande: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                  placeholder="Skriv ditt meddelande här..."
                  required
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-border text-accent focus:ring-accent"
                  required
                />
                <span className="text-sm text-text-secondary">
                  {t('contact.consent','Jag godkänner att denna hemsida sparar min information så att de kan svara på min fråga.')}
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg font-medium disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('contact.sending','Skickar...')}
                  </>
                ) : (
                  <>
                    {t('contact.send','Skicka meddelande')}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              {showSuccess && (
                <div className="p-4 bg-background-secondary border border-border rounded-lg">
                  <p className="text-secondary font-medium">
                    ✓ {t('contact.success','Tack för ditt meddelande! Vi återkommer inom 24 timmar.')}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate3d(0, 0, 0); }
          100% { transform: scale(1.06) translate3d(2%, -1%, 0); }
        }
        .animate-kenburns {
          animation: kenburns 18s ease-out infinite alternate;
        }
      `}</style>
    </main>
  );
} 