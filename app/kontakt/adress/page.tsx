"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiSend, FiUser, FiMail } from "react-icons/fi";

export default function AdressPage() {
  const [formData, setFormData] = useState({
    namn: "",
    email: "",
    meddelande: "",
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
          href="/kontakt"
          className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till kontakt
        </Link>

        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            VI FINNS HÄR FÖR DIG
          </h1>
          <p className="text-lg text-text-secondary mb-3">
            Vi gör vårt yttersta för att svara på alla dina frågor.
          </p>
          <p className="text-lg text-text-secondary mb-3">
            Kontakta oss via chatten, använd formuläret här nedan eller maila oss så återkommer vi inom 24 timmar.
          </p>
          <div className="mt-6 p-4 bg-white rounded-xl shadow-md inline-block">
            <p className="text-primary font-medium">Tips!</p>
            <p className="text-text-secondary">
              Titta gärna om du kan hitta svaret på din fråga under {""}
              <Link href="/kontakt/faq" className="text-accent hover:underline">
                Frågor &amp; Svar
              </Link>{" "}
              innan du kontaktar oss.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="namn" className="block text-sm font-medium text-primary mb-2">
                  Namn
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  E-post
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  Meddelande
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
                  Jag godkänner att denna hemsida sparar min information så att de kan svara på min fråga.
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
                    Skickar...
                  </>
                ) : (
                  <>
                    Skicka meddelande
                    <FiSend className="w-5 h-5" />
                  </>
                )}
              </button>

              {showSuccess && (
                <div className="p-4 bg-background-secondary border border-border rounded-lg">
                  <p className="text-secondary font-medium">
                    ✓ Tack för ditt meddelande! Vi återkommer inom 24 timmar.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 