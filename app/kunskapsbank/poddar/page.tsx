"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PlayCircle, PauseCircle, Clock, Headphones } from 'lucide-react';
import { useLanguage, useT } from '@/app/lib/i18n/LanguageProvider';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  coverUrl?: string;
  date: string;
}

const demoEpisodes: Episode[] = [
  {
    id: "ep1",
    title: "Hur påverkar functional foods din energi?",
    description: "Vi pratar om blodsocker, proteinintag och smarta livsmedelsval för jämnare energi.",
    duration: "18:42",
    audioUrl: "/demo-audio/episode1.mp3",
    coverUrl: "/images/blog-placeholder.jpg",
    date: "2025-07-01",
  },
  {
    id: "ep2",
    title: "Maghälsa: fiber, fermenterat och balans",
    description: "Allt om prebiotika, probiotika och hur du bygger en resilient tarmflora.",
    duration: "24:10",
    audioUrl: "/demo-audio/episode2.mp3",
    coverUrl: "/images/blog-placeholder.jpg",
    date: "2025-07-08",
  },
];

export default function PodcastsPage() {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const t = useT();
  const { locale } = useLanguage();

  const togglePlay = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    if (currentId === id && !audio.paused) {
      audio.pause();
      return;
    }
    if (currentId && audioRefs.current[currentId] && !audioRefs.current[currentId]!.paused) {
      audioRefs.current[currentId]!.pause();
    }
    audio.play();
    setCurrentId(id);
  };

  const dateLocale = locale === 'sv' ? 'sv-SE' : locale === 'en' ? 'en-GB' : locale === 'es' ? 'es-ES' : locale === 'de' ? 'de-DE' : 'fr-FR';

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fffdf3" }}>
      <div className="container-custom section-padding">
        <Link href="/kunskapsbank" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('podcasts.back','Tillbaka till Kunskapsbank')}
        </Link>

        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Headphones className="w-4 h-4" />
            <span>{t('podcasts.badge','Lyssna och lär')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">{t('podcasts.title','Poddar')}</h1>
          <p className="text-lg text-text-secondary">{t('podcasts.subtitle','Våra senaste poddavsnitt om hälsa, kost och functional foods – med en enkel och snygg spelare.')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {demoEpisodes.map((ep) => (
            <div key={ep.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={ep.coverUrl || "/images/blog-placeholder.jpg"}
                  alt={ep.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-primary mb-2">{ep.title}</h2>
                <p className="text-text-secondary text-sm mb-4">{ep.description}</p>
                <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                  <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {ep.duration}</span>
                  <span>{new Date(ep.date).toLocaleDateString(dateLocale)}</span>
                </div>

                <div className="bg-background-secondary border border-border rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlay(ep.id)}
                      className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary transition-colors"
                      aria-label={t('podcasts.playPause','Spela/Pausa')}
                    >
                      {currentId === ep.id && audioRefs.current[ep.id] && !audioRefs.current[ep.id]!.paused ? (
                        <PauseCircle className="w-7 h-7" />
                      ) : (
                        <PlayCircle className="w-7 h-7" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="h-2 bg-white rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-accent transition-all duration-300" />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-text-secondary">
                        <span>0:00</span>
                        <span>{ep.duration}</span>
                      </div>
                    </div>

                    <audio
                      ref={(el) => { audioRefs.current[ep.id] = el; }}
                      src={ep.audioUrl}
                      preload="none"
                      onEnded={() => setCurrentId(null)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 