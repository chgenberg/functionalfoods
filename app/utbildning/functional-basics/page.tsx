"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle, ShoppingCart, ArrowLeft, Sparkles, Heart, Brain, Utensils } from 'lucide-react';
import { useState } from 'react';

export default function FunctionalBasicsPage() {
  const [imageLoaded, setImageLoaded] = useState(false);

  const benefits = [
    {
      icon: Sparkles,
      title: "Mer energi & bättre humör",
      description: "Stabilt blodsocker minskar humörsvängningar hos både barn och vuxna."
    },
    {
      icon: Heart,
      title: "Starkare immunförsvar",
      description: "Näringsrik mat med antioxidanter hjälper kroppen att bekämpa sjukdomar."
    },
    {
      icon: Brain,
      title: "Hormonell balans",
      description: "Alla kroppens hormoner påverkas positivt av en näringsrik kost."
    }
  ];

  const courseIncludes = [
    "75 näringsrika recept",
    "Kompletta måltidsplaner",
    "Inköpslistor",
    "Vetenskaplig grund",
    "Livstidsåtkomst",
    "Expertkunskap"
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
              Functional <span className="text-gradient">Basics</span>
            </h1>
            
            <div className="flex items-center gap-4 text-text-secondary mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>6 veckor</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Nybörjarnivå</span>
            </div>

            <p className="text-lg text-text-secondary mb-8">
              Vill du använda maten som ditt främsta verktyg för bättre hälsa och ett längre liv? 
              Functional Basics ger dig kunskap, recept och måltidsplaner som stärker ditt immunförsvar 
              och får kropp och sinne att prestera på topp.
            </p>

            {/* Price Box */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-light text-primary">2,295 kr</span>
              </div>
              
              <button className="btn-primary w-full flex items-center justify-center group">
                <ShoppingCart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Lägg till i varukorg
              </button>
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-2 gap-3">
              {courseIncludes.map((feature, i) => (
                <div key={i} className="flex items-center text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-light text-center mb-12">
            Vad är <span className="text-gradient">Functional Foods?</span>
          </h2>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg text-text-secondary mb-6">
              Functional Foods är naturliga livsmedel med specifika hälsofrämjande egenskaper. 
              De hjälper kroppen att fungera optimalt genom att ge stöd åt hormonsystemet, 
              immunförsvaret, matsmältningen och energinivåerna.
            </p>
            
            <div className="bg-accent/10 rounded-xl p-6 border-l-4 border-accent">
              <Utensils className="w-8 h-8 text-accent mb-3" />
              <p className="text-text-secondary">
                <strong>Exempel på rätter:</strong> Pokébowl med kyckling, havrefrallor med morötter och aprikoser, 
                laxburgare med krämig grönsaksröra, vegetarisk currygryta, bananplättar med jordgubbar och kokos.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-light text-center mb-12">
            Vinsten med att äta enligt <span className="text-gradient">Functional Foods</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <benefit.icon className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-xl font-medium text-primary mb-3">{benefit.title}</h3>
                <p className="text-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-4">För vem?</h2>
            <p className="text-text-secondary mb-6">
              Den här kursen är för dig som vill förbättra din hälsa steg för steg och samtidigt njuta av god och näringsrik mat – utan att det blir krångligt.
            </p>
            <p className="text-text-secondary">
              Perfekt för dig som vill bli av med ojämnt blodsocker, känna dig mätt och tillfreds efter måltider, 
              få mer energi och lära dig mer om antiinflammatorisk kost.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 