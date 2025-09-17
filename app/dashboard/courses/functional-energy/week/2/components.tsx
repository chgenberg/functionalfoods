'use client';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Heart, Brain } from 'lucide-react';
import Link from 'next/link';

// Week Info Section Component
export function WeekInfoSection() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vecka 2 - Blodsocker och välmående</h2>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Märk förändringarna</h3>
          <p className="leading-relaxed">
            Nu när du kommit igång med kursen kanske du redan märker att ditt blodsocker känns stabilare och att du mår bättre. Matlagningen börjar kännas mer naturlig och det blir lättare att följa kostschemat.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Fortsätt planera</h3>
          <p className="leading-relaxed">
            Fortsätt planera väl inför veckan och se till att förbereda måltider i förväg. Läs gärna dokumentet "Functional foods för diabetiker" för mer kunskap om hur rätt livsmedel kan hjälpa dig att hålla blodsockret stabilt och förbättra din hälsa.
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
      title: "Functional foods för diabetiker",
      description: "Lär dig hur functional foods kan hjälpa vid diabetes",
      icon: Heart,
      link: "/dashboard/courses/functional-energy/material?doc=functional-foods-for-diabetiker"
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Dokument att läsa andra veckan</h2>
      
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
        <Brain className="w-6 h-6 text-[#014421]" />
        Tips för stabilt blodsocker
      </h3>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Ät måltider på regelbundna tider</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Kombinera alltid protein med kolhydrater</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>Mät ditt blodsocker före och efter måltider</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">•</span>
          <span>För dagbok över hur du mår</span>
        </li>
      </ul>
    </div>
  );
}
