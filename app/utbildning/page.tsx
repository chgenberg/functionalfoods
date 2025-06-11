"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FiBookOpen, FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {courses.map((course, index) => (
            <div 
              key={course.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {/* Course Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <div className={`transition-opacity duration-500 ${imageLoaded[course.id] ? 'opacity-100' : 'opacity-0'}`}>
                  <Image 
                    src={course.image} 
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onLoad={() => setImageLoaded(prev => ({ ...prev, [course.id]: true }))}
                  />
                </div>
                {!imageLoaded[course.id] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h2 className="text-2xl font-light text-primary mb-3">{course.title}</h2>
                
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-5 h-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiUsers className="w-5 h-5" />
                    <span>{course.level}</span>
                  </div>
                </div>

                <p className="text-text-secondary mb-4">{course.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {course.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-text-secondary">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link 
                  href={course.href}
                  className="btn-primary w-full flex items-center justify-center group/btn hover:scale-105 transition-all duration-300"
                >
                  <span>Läs mer</span>
                  <FiArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
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