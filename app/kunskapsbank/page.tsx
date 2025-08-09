"use client";
import Image from 'next/image';
import Link from 'next/link';
import { FiBookOpen, FiSearch, FiMessageCircle, FiArrowRight, FiBook } from 'react-icons/fi';
import { GiCookingPot } from 'react-icons/gi';
import { useState } from 'react';
import { useT } from '../lib/i18n/LanguageProvider';

export default function KunskapsbankPage() {
  const t = useT();
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const sections = [
    {
      id: 'blog',
      title: t('kb.sections.blog.title','Artiklar'),
      description: t('kb.sections.blog.desc','Läs våra senaste artiklar om hälsa, kost och livsstil'),
      image: "/kunskapsbank/smoothie.jpg",
      href: "/kunskapsbank/blogg",
      icon: FiBookOpen,
      color: "text-blue-600"
    },
    {
      id: 'recipes',
      title: t('kb.sections.recipes.title','Recept'),
      description: t('kb.sections.recipes.desc','Utforska våra hälsosamma och goda recept'),
      image: "/kunskapsbank/kottfarssas.JPG",
      href: "/kunskapsbank/recept",
      icon: GiCookingPot,
      color: "text-primary"
    },
    {
      id: 'raw-materials',
      title: t('kb.sections.raw.title','Råvaror'),
      description: t('kb.sections.raw.desc','Läs om våra funktionella råvaror och deras hälsofördelar'),
      image: "/kunskapsbank/musli.jpg",
      href: "/kunskapsbank/ingredienser",
      icon: GiCookingPot,
      color: "text-red-600"
    },
    {
      id: 'sources',
      title: t('kb.sections.sources.title','Källor'),
      description: t('kb.sections.sources.desc','Vetenskapliga referenser och forskning bakom functional foods'),
      image: "/kunskapsbank/aggrora.jpg",
      href: "/kunskapsbank/kallor",
      icon: FiBook,
      color: "text-indigo-600"
    },
    {
      id: 'search',
      title: t('kb.sections.search.title','Sök'),
      description: t('kb.sections.search.desc','Hitta specifik information i vår kunskapsbank'),
      image: "/kunskapsbank/sallad.JPG",
      href: "/kunskapsbank/sok",
      icon: FiSearch,
      color: "text-purple-600"
    },
    {
      id: 'faq',
      title: t('kb.sections.faq.title','Q&A'),
      description: t('kb.sections.faq.desc','Vanliga frågor och svar om Functional Foods, kurser och mer'),
      image: "/kunskapsbank/Gronsakswok.jpg",
      href: "/kunskapsbank/qa",
      icon: FiMessageCircle,
      color: "text-orange-600"
    },
    {
      id: 'podcasts',
      title: t('kb.sections.pod.title','Poddar'),
      description: t('kb.sections.pod.desc','Lyssna på våra poddavsnitt om hälsa och functional foods'),
      image: "/kunskapsbank/smoothie.jpg",
      href: "/kunskapsbank/poddar",
      icon: FiBookOpen,
      color: "text-emerald-600"
    }
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">{t('kb.title','Kunskapsbank')}</span>
          </h1>
          <p className="text-lg text-text-secondary">
            {t('kb.subtitle','Utforska vår samling av artiklar, recept och expertkunskap om functional foods och hälsosam livsstil')}
          </p>
        </div>
        
        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {sections.map((section, index) => (
            <Link
              key={section.id}
              href={section.href}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="relative h-48 bg-gray-100">
                <div className={`transition-opacity duration-500 ${imagesLoaded[section.id] ? 'opacity-100' : 'opacity-0'}`}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onLoad={() => setImagesLoaded(prev => ({ ...prev, [section.id]: true }))}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/blog-placeholder.jpg';
                      setImagesLoaded(prev => ({ ...prev, [section.id]: true }));
                    }}
                    loading="lazy"
                  />
                </div>
                {!imagesLoaded[section.id] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-medium text-primary mb-2 group-hover:text-accent transition-colors">
                  {section.title}
                </h2>
                <p className="text-text-secondary text-sm mb-4">{section.description}</p>
                
                <div className="flex items-center text-accent text-sm font-medium">
                  <span>{t('kb.explore','Utforska')}</span>
                  <FiArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-3">{t('kb.cta.title','Vill du lära dig mer?')}</h2>
            <p className="text-text-secondary mb-6">{t('kb.cta.desc','Fördjupa din kunskap med våra omfattande kurser om functional foods och hälsosam livsstil.')}</p>
            <Link href="/utbildning" className="btn-primary inline-flex items-center">
              {t('kb.cta.btn','Se våra kurser')}
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
