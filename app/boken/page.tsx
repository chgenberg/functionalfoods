"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { formatPrice } from '@/app/lib/utils';

// Default content (fallback)
const DEFAULT_CONTENT = {
  title: 'Functional Foods: Mat för ett friskare liv',
  subtitle: 'Din guide till en hälsosammare livsstil genom smart kost',
  description: 'Välkommen till framtidens kost för god hälsa och ett friskare liv! Functional Foods är ofta naturligt berikade med specifika näringsämnen som är kända för att främja hälsan.',
  shortDescription: 'I Ulrika Davidssons nya bok får du lära dig om den smarta maten som ökar din energi, boostar ditt immunförsvar, ger en lugnare mage och gör att du tappar i vikt.',
  image: '/boken.png',
  price: '239',
  features: ['60+ recept', 'Expertkunskap', '240 sidor'],
  authorSection: 'Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker. Hennes online-kurser har hjälpt tiotusentals personer att finna en mer hållbar och hälsosam livsstil.',
  quote: 'Du kommer snabbt att märka att du har mer energi och ork, och se en skillnad på vågen. Du kommer inte att ångra dig!'
};

interface PageContent {
  title?: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  price?: string;
  features?: string[];
  authorSection?: string;
  quote?: string;
}

export default function BookPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent>(DEFAULT_CONTENT);

  // Merge custom content with defaults
  const content = { ...DEFAULT_CONTENT, ...pageContent };

  // Fetch custom page content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/pages/boken');
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setPageContent(data.content);
          }
        }
      } catch (error) {
        console.error('Failed to fetch page content:', error);
      }
    };
    fetchContent();
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            {content.title?.includes(':') ? (
              <>
                {content.title.split(':')[0]}: <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">{content.title.split(':')[1]}</span>
              </>
            ) : (
              content.title
            )}
          </h1>
          <p className="text-lg text-text-secondary">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Book Image */}
          <div className="flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative group">
              <div className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <Image
                  src={content.image || '/boken.png'}
                  alt={content.title || 'Functional Foods: Mat för ett friskare liv'}
                  width={400}
                  height={600}
                  className="rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-white/50 rounded-2xl animate-pulse" />
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {/* Price and Buy Button */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col items-center mb-4">
                <p className="text-3xl font-light text-primary numeric">{formatPrice(parseInt(content.price || '239'))} kr</p>
                <p className="text-sm text-text-secondary mt-1">Moms ingår</p>
              </div>
              <Link
                href="https://thebookaffair.se/collections/ulrika-davidsson/products/functional-foods"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Köp nu
              </Link>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-3 gap-4">
              {(content.features || DEFAULT_CONTENT.features).slice(0, 3).map((feature, index) => {
                const icons = [Clock, CheckCircle, Clock];
                const Icon = icons[index % icons.length];
                return (
                  <div key={index} className="bg-white rounded-xl p-4 text-center">
                    <Icon className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">{feature}</p>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="space-y-4 text-text-secondary">
              <p className="leading-relaxed">
                {content.description}
              </p>
              
              <p className="leading-relaxed">
                {content.shortDescription}
              </p>

              {content.quote && (
                <div className="bg-accent/10 rounded-xl p-4 border-l-4 border-accent">
                  <p className="text-sm italic">
                    "{content.quote}"
                  </p>
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-medium text-primary mb-4">Bokdetaljer</h3>
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-text-secondary">ISBN</dt>
                  <dd className="font-medium">9789189740648</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-text-secondary">Utgivningsdatum</dt>
                  <dd className="font-medium">2024-11-19</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-text-secondary">Dimensioner</dt>
                  <dd className="font-medium">248 x 175 x 23 mm</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-text-secondary">Vikt</dt>
                  <dd className="font-medium">700g</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Author Section */}
        <div className="mt-16 text-center max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-light text-primary mb-4">Om författaren</h2>
            <p className="text-text-secondary leading-relaxed">
              {content.authorSection}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 