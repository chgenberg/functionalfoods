"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FiBookOpen, FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';
import AddToCart from '@/app/components/AddToCart';
import { motion } from 'framer-motion';
import { GiFruitBowl, GiHealthNormal } from 'react-icons/gi';
import { FiBook, FiChevronRight } from 'react-icons/fi';

export default function UtbildningPage() {
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({ basics: false, flow: false });

  const courses = [
    {
      id: 'basics',
      title: 'Functional Basics',
      description: 'Lär dig grunderna om funktionella livsmedel, recept och måltidsplanering.',
      image: '/functional_basics.png',
      href: '/utbildning/functional-basics',
      features: ['Grundläggande koncept', 'Praktiska recept', 'Måltidsplanering'],
      duration: '4 veckor',
      level: 'Nybörjare'
    },
    {
      id: 'flow',
      title: 'Functional Flow',
      description: 'Fokus på maghälsa, antiinflammatorisk kost och ett naturligt flöde i vardagen.',
      image: '/functional_flow.png',
      href: '/utbildning/functional-flow',
      features: ['Maghälsa', 'Antiinflammation', 'Energibalans'],
      duration: '6 veckor',
      level: 'Fortsättning'
    }
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Vårt <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">kursutbud</span>
          </h1>
          <p className="text-lg text-text-secondary">
            Varje kropp är unik – därför erbjuder vi kunskap om functional foods och mervärdesmat 
            anpassad efter dina behov och mål, för ökad hälsa och livskvalitet.
          </p>
        </div>

        {/* Courses Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Functional Basics */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
          >
            <Link href="/utbildning/functional-basics" className="h-64 relative overflow-hidden block cursor-pointer">
              <Image
                src="/basic.JPG"
                alt="Functional Basics kurs"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </Link>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Functional Basics</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Lär dig grunderna i functional foods och börja din resa mot bättre hälsa. 
                Perfekt för dig som vill ha en strukturerad introduktion.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiClock className="text-green-600" />
                  <span>6 veckors program</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiBook className="text-green-600" />
                  <span>75+ recept</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiUsers className="text-green-600" />
                  <span>Community & support</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-800">997 kr</p>
                  <p className="text-sm text-gray-500">Engångsbetalning</p>
                </div>
              </div>

              <div className="flex gap-3">
                <AddToCart 
                  id="functional-basics"
                  name="Functional Basics"
                  price={997}
                  type="course"
                />
                <Link
                  href="/utbildning/functional-basics"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  Läs mer
                  <FiChevronRight />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Functional Flow */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
          >
            <Link href="/utbildning/functional-flow" className="h-64 relative overflow-hidden block cursor-pointer">
              <Image
                src="/flow.JPG"
                alt="Functional Flow kurs"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </Link>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Functional Flow</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ta din hälsa till nästa nivå med avancerade koncept och strategier. 
                För dig som vill optimera din livsstil maximalt.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiClock className="text-[#1a4324]" />
                  <span>6 veckors avancerat program</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiBook className="text-[#1a4324]" />
                  <span>75+ avancerade recept</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiUsers className="text-[#1a4324]" />
                  <span>Premium support</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-800">1497 kr</p>
                  <p className="text-sm text-gray-500">Engångsbetalning</p>
                </div>
              </div>

              <div className="flex gap-3">
                <AddToCart 
                  id="functional-flow"
                  name="Functional Flow"
                  price={1497}
                  type="course"
                />
                <Link
                  href="/utbildning/functional-flow"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  Läs mer
                  <FiChevronRight />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <FiBookOpen className="w-5 h-5 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-3">Osäker på vilken kurs som passar dig?</h2>
            <p className="text-text-secondary mb-6">
              Kontakta oss så hjälper vi dig att hitta rätt utbildning för dina behov och mål.
            </p>
            <Link href="/kontakt/formular" className="btn-secondary inline-flex items-center">
              Kontakta oss
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 