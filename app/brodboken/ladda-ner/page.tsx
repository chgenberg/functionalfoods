"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Download, 
  Lock, 
  Check, 
  AlertCircle,
  Gift,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

function DownloadContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const [token, setToken] = useState(tokenFromUrl || '');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [ebookName, setEbookName] = useState('');
  const [downloadPath, setDownloadPath] = useState('');
  const [downloadsRemaining, setDownloadsRemaining] = useState(0);

  // Auto-verify if token is in URL
  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const verifyToken = async (tokenToVerify: string) => {
    setIsChecking(true);
    setError('');

    try {
      const response = await fetch('/api/ebook/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToVerify })
      });

      const data = await response.json();

      if (data.valid) {
        setIsUnlocked(true);
        setEbookName(data.ebookName);
        setDownloadPath(data.downloadPath);
        setDownloadsRemaining(data.downloadsRemaining);
      } else {
        setError(data.error || 'Ogiltig nedladdningskod');
      }
    } catch (err) {
      setError('Ett fel uppstod. Försök igen.');
    }
    
    setIsChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    await verifyToken(token.trim());
  };

  const handleDownload = () => {
    if (!downloadPath) return;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadPath;
    link.download = 'test-baka-glutenfritt-ebok.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#112A12] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-[#93C560]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7E70] rounded-full border border-white/30 mb-6">
            <Gift className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">E-bok nedladdning</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#93C560] mb-4">
            Baka Glutenfritt – E-bok
          </h1>
          <p className="text-gray-500">
            av Ulrika Davidsson
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden"
        >
          {/* Book preview */}
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="relative w-16 h-20 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <Image
                src="/baka-glutenfritt.png"
                alt="Baka Glutenfritt E-bok"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-white font-semibold">{ebookName || 'Baka Glutenfritt – E-bok'}</h2>
              <p className="text-gray-500 text-sm">PDF • 26 recept</p>
            </div>
          </div>

          <div className="p-8">
            {isChecking && !isUnlocked ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-[#93C560] animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Verifierar din nedladdningskod...</p>
              </div>
            ) : !isUnlocked ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-[#93C560]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Ange din nedladdningskod
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Koden finns i ditt orderbekräftelse-mejl
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      placeholder="Ange din nedladdningskod"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all font-mono tracking-wider text-center"
                      disabled={isChecking}
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isChecking || !token}
                    className="w-full px-6 py-3 bg-[#FF7E70] text-white font-semibold rounded-xl hover:bg-[#660C21] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Kontrollerar...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Lås upp
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Upplåst! 🎉
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Klicka på knappen nedan för att ladda ner din e-bok
                </p>

                <button
                  onClick={handleDownload}
                  className="w-full px-6 py-4 bg-[#FF7E70] text-white font-bold rounded-xl hover:bg-[#660C21] transition-all flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Ladda ner E-bok (PDF)
                </button>

                <p className="text-gray-400 text-xs mt-4">
                  {downloadsRemaining > 0 
                    ? `Du har ${downloadsRemaining} nedladdning${downloadsRemaining !== 1 ? 'ar' : ''} kvar`
                    : 'Detta var din sista nedladdning'
                  }
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Help section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            Problem med nedladdningen?{' '}
            <a href="mailto:info@functionalfoods.se" className="text-[#93C560] hover:underline">
              Kontakta oss
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function DownloadEbookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a1f14] via-[#102a1c] to-[#0a1f14] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#93C560] animate-spin" />
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
