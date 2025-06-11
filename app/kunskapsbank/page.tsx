"use client";
import Image from 'next/image';
import Link from 'next/link';
import { FiBookOpen, FiSearch, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { GiCookingPot } from 'react-icons/gi';
import { useState } from 'react';

export default function KunskapsbankPage() {
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const sections = [
    {
      id: 'blog',
      title: "Blogginlägg",
      description: "Läs våra senaste artiklar om hälsa, kost och livsstil",
      image: "/blogg.png",
      href: "/kunskapsbank/blogg",
      icon: FiBookOpen,
      color: "text-blue-600"
    },
    {
      id: 'recipes',
      title: "Recept",
      description: "Utforska våra hälsosamma och goda recept",
      image: "/recept.png",
      href: "/kunskapsbank/recept",
      icon: GiCookingPot,
      color: "text-green-600"
    },
    {
      id: 'search',
      title: "Sök",
      description: "Hitta specifik information i vår kunskapsbank",
      image: "/sok.png",
      href: "/kunskapsbank/sok",
      icon: FiSearch,
      color: "text-purple-600"
    },
    {
      id: 'faq',
      title: "FAQ",
      description: "Svar på vanliga frågor om kost och hälsa",
      image: "/faq.png",
      href: "/kontakt/faq",
      icon: FiMessageCircle,
      color: "text-orange-600"
    }
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">Kunskapsbank</span>
          </h1>
          <p className="text-lg text-text-secondary">
            Utforska vår samling av artiklar, recept och expertkunskap om functional foods och hälsosam livsstil
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
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onLoad={() => setImagesLoaded(prev => ({ ...prev, [section.id]: true }))}
                  />
                </div>
                {!imagesLoaded[section.id] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                
                {/* Icon Overlay */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  {section.icon && <section.icon className={`w-5 h-5 ${section.color}`} />}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-medium text-primary mb-2 group-hover:text-accent transition-colors">
                  {section.title}
                </h2>
                <p className="text-text-secondary text-sm mb-4">{section.description}</p>
                
                <div className="flex items-center text-accent text-sm font-medium">
                  <span>Utforska</span>
                  <FiArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-3">Vill du lära dig mer?</h2>
            <p className="text-text-secondary mb-6">
              Fördjupa din kunskap med våra omfattande kurser om functional foods och hälsosam livsstil.
            </p>
            <Link href="/utbildning" className="btn-primary inline-flex items-center">
              Se våra kurser
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 