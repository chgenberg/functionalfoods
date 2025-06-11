"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle, ArrowLeft, Heart, Brain, Zap } from 'lucide-react';
import { useState } from 'react';

export default function FunctionalBasicsPage() {
  const [imageLoaded, setImageLoaded] = useState(false);

  const benefits = [
    {
      icon: Heart,
      title: "Grundläggande förståelse",
      description: "Lär dig grunderna i funktionell kost och hur den påverkar din hälsa."
    },
    {
      icon: Brain,
      title: "Praktiska verktyg",
      description: "Få konkreta verktyg och strategier för att implementera funktionell kost i ditt liv."
    },
    {
      icon: Zap,
      title: "Personlig anpassning",
      description: "Lär dig anpassa din kost efter dina individuella behov och mål."
    }
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Back Link */}
        <Link href="/utbildning" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till kurser
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
          {/* Course Image */}
          <div className="flex justify-center lg:justify-end animate-fade-in">
            <div className="relative">
              <div className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <Image 
                  src="/functional_basics.png" 
                  alt="Functional Basics" 
                  width={400}
                  height={400}
                  className="rounded-2xl shadow-xl"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse w-[400px] h-[400px]" />
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Functional <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">Basics</span>
            </h1>
            
            <div className="flex items-center gap-4 text-text-secondary mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>4 veckor</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Nybörjarnivå</span>
            </div>

            <p className="text-lg text-text-secondary mb-8">
              En grundläggande kurs som ger dig kunskap om funktionell kost och dess påverkan på din hälsa. 
              Perfekt för dig som vill lära dig grunderna och få verktyg för att göra hållbara förändringar i din kosthållning.
            </p>

            {/* Price Box */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-xl text-gray-400 line-through">1,495 kr</span>
                <span className="text-3xl font-light text-primary">1,196 kr</span>
                <span className="text-sm text-accent bg-accent/10 px-2 py-1 rounded">-20%</span>
              </div>
            </div>

            {/* Quick Features */}
            <div className="space-y-3">
              {['Grundläggande teori', 'Praktiska övningar', 'Expertkunskap', 'Livstidsåtkomst'].map((feature, i) => (
                <div key={i} className="flex items-center text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent mr-3" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-light text-center mb-12">
            Vad du <span className="text-gradient">uppnår</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <benefit.icon className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-xl font-medium text-primary mb-3">{benefit.title}</h3>
                <p className="text-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-4">Redo att börja din resa?</h2>
            <p className="text-text-secondary mb-6">
              Investera i din hälsa idag och känn skillnaden redan inom några veckor.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 