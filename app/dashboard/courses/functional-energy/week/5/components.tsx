'use client';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Heart, Dumbbell, Moon, Brain } from 'lucide-react';
import Link from 'next/link';

// Week Info Section Component
export function WeekInfoSection() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vecka 5 - Helhetsperspektiv på hälsan</h2>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Använd din kunskap</h3>
          <p className="leading-relaxed">
            Nu har du fått mycket kunskap och en bättre förståelse för kosten som fungerar för din hälsa och blodsockerkontroll. Du har lärt dig vad som får din kropp och mage att må bra, och vad som kan orsaka obehag. Det är nu dags att börja använda denna kunskap för att skapa måltider som stödjer både din maghälsa och ditt blodsocker.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Mer än bara mat</h3>
          <p className="leading-relaxed">
            Den här veckan vill vi att du fördjupar dig i fler faktorer som påverkar ditt blodsocker, förutom kosten. Läs gärna dokumentet "En hälsosam livsstil för stabilt blodsocker" för att få en bättre förståelse för hur även andra livsstilsfaktorer som motion, sömn och stress påverkar din blodsockernivå och kan hjälpa dig att skapa en hållbar och balanserad livsstil.
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
      title: "En hälsosam livsstil för stabilt blodsocker",
      description: "Livsstilsfaktorer utöver kosten",
      icon: Dumbbell,
      link: "/dashboard/courses/functional-energy/material?doc=halsosam-livsstil-blodsocker"
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Dokument att läsa femte veckan</h2>
      
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

// Lifestyle Factors Section
export function LifestyleFactorsSection() {
  return (
    <div className="bg-gradient-to-br from-[#93C560]/20 to-[#73A742]/20 rounded-3xl p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Livsstilsfaktorer för stabilt blodsocker</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-5 h-5 text-[#014421]" />
            <h4 className="font-semibold text-gray-900">Motion</h4>
          </div>
          <p className="text-sm text-gray-700">
            Regelbunden fysisk aktivitet hjälper kroppen att använda insulin mer effektivt
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-[#014421]" />
            <h4 className="font-semibold text-gray-900">Sömn</h4>
          </div>
          <p className="text-sm text-gray-700">
            God sömnkvalitet är avgörande för hormonbalans och blodsockerkontroll
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-[#014421]" />
            <h4 className="font-semibold text-gray-900">Stress</h4>
          </div>
          <p className="text-sm text-gray-700">
            Stresshantering minskar kortisol som kan höja blodsockernivåerna
          </p>
        </div>
      </div>
    </div>
  );
}
