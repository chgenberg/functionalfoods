'use client';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, FileText, Target } from 'lucide-react';
import Link from 'next/link';

// Week Info Section Component
export function WeekInfoSection() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vecka 1 - Din resa börjar här!</h2>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Förberedelse är nyckeln</h3>
          <p className="leading-relaxed">
            För att få bästa resultat i kursen är förberedelse viktigt. Handla det du behöver för veckan och förbered gärna några måltider i förväg.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Reflektera och dokumentera</h3>
          <p className="leading-relaxed">
            Under kursens gång, reflektera regelbundet över hur din kropp och ditt blodsocker känns, och skriv ned dina tankar. Drick mycket vatten och fokusera på vila och återhämtning för att ge din kropp bästa möjliga förutsättningar.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Kom igång på rätt sätt</h3>
          <p className="leading-relaxed">
            Läs gärna dokumenten "Dags att komma igång!" och "Frågor och svar" för att förbereda dig och få en bra start. Nu kör vi igång!
          </p>
        </div>
      </div>
    </div>
  );
}

// Documents Section Component
export function DocumentsSection() {
  const documents = [
    {
      title: "Dags att komma igång",
      description: "Din guide för att starta kursen på bästa sätt",
      icon: Target,
      link: "/dashboard/courses/functional-energy/material?doc=dags-att-komma-igang"
    },
    {
      title: "Frågor och svar",
      description: "Vanliga frågor om kursen och kosten",
      icon: FileText,
      link: "/dashboard/courses/functional-energy/material?doc=fragor-och-svar"
    },
    {
      title: "Vad är functional foods?",
      description: "Grunderna i functional foods filosofin",
      icon: BookOpen,
      link: "/dashboard/courses/functional-energy/material?doc=vad-ar-functional-foods"
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Dokument att läsa första veckan</h2>
      
      <div className="grid gap-4">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={doc.link}>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F7F5F0] to-[#F3EFE3] rounded-xl hover:shadow-md transition-all cursor-pointer group">
                <div className="bg-[#014421] text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <doc.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#014421] transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Tips Section Component
export function TipsSection() {
  return (
    <div className="bg-gradient-to-br from-[#93C560]/20 to-[#73A742]/20 rounded-3xl p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-[#014421]" />
        Tips för veckan
      </h3>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Planera in tid för matlagning i din kalender</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Förbered grönsaker och basvaror i förväg</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Ha alltid hälsosamma snacks tillgängliga</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Drick minst 2 liter vatten per dag</span>
        </li>
      </ul>
    </div>
  );
}
