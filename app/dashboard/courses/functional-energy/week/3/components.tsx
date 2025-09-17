'use client';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Heart, Scale } from 'lucide-react';
import Link from 'next/link';

// Week Info Section Component
export function WeekInfoSection() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vecka 3 - Rätt kost för blodsockerkontroll</h2>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Positiva förändringar</h3>
          <p className="leading-relaxed">
            Vi hoppas att du redan märker positiva förändringar och att du känner dig bättre. Denna vecka vill vi fokusera på hur rätt kost kan hjälpa till att reglera ditt blodsocker och stödja en balanserad livsstil.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Kraftfulla livsmedelsval</h3>
          <p className="leading-relaxed">
            Att välja rätt livsmedel är en kraftfull metod för att hålla blodsockret stabilt, vilket kan ha långsiktiga fördelar för din hälsa och välbefinnande. Läs gärna dokumentet "Lågkolhydratkost och functional foods för blodsockerkontroll" för att få mer kunskap om hur du kan använda mat för att optimera din hälsa och blodsockernivåer.
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
      title: "Lågkolhydratkost och functional foods för blodsockerkontroll",
      description: "Optimera din kost för stabilt blodsocker",
      icon: Scale,
      link: "/dashboard/courses/functional-energy/material?doc=lagkolhydratskost-functional-foods"
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Dokument att läsa tredje veckan</h2>
      
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
        <Heart className="w-6 h-6 text-[#014421]" />
        Tips för lågkolhydratkost
      </h3>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Fokusera på grönsaker som växer ovanför marken</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Välj fullvärdiga proteinkällor vid varje måltid</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Inkludera hälsosamma fetter som avokado och nötter</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Undvik processad mat och dolda sockerkällor</span>
        </li>
      </ul>
    </div>
  );
}
