'use client';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Heart, Activity } from 'lucide-react';
import Link from 'next/link';

// Week Info Section Component
export function WeekInfoSection() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vecka 4 - Halvvägs genom kursen!</h2>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Dags för reflektion</h3>
          <p className="leading-relaxed">
            Nu har du genomfört halva kursen, och det är dags att reflektera över hur din mage känns. Jämför med vecka 1 och fundera på vilka förändringar kosten har gjort hittills. Kanske har magbesvär som uppsvälldhet och obehag minskat?
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Fördjupa din förståelse</h3>
          <p className="leading-relaxed">
            Den här veckan vill vi rekommendera att du läser dokumentet "Förstå insulinresistens och betacellsfunktion". Genom att förstå hur insulin fungerar, vad som händer när man utvecklar insulinresistens, och hur betacellerna spelar en viktig roll i att reglera blodsockernivåerna, får du en djupare förståelse för hur dessa faktorer påverkar din hälsa och din blodsockerkontroll.
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
      title: "Förstå insulinresistens och betacellsfunktion",
      description: "Djupdykning i kroppens blodsockerreglering",
      icon: Activity,
      link: "/dashboard/courses/functional-energy/material?doc=insulinresistens-betacellsfunktion"
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Dokument att läsa fjärde veckan</h2>
      
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

// Progress Check Section
export function ProgressCheckSection() {
  return (
    <div className="bg-gradient-to-br from-[#93C560]/20 to-[#73A742]/20 rounded-3xl p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6 text-[#014421]" />
        Halvvägs - Kolla in dina framsteg!
      </h3>
      <p className="text-gray-700 mb-4">
        Ta dig tid att reflektera över din resa hittills:
      </p>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">✓</span>
          <span>Hur känns din energi jämfört med vecka 1?</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">✓</span>
          <span>Har ditt blodsocker blivit mer stabilt?</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">✓</span>
          <span>Vilka recept har blivit dina favoriter?</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#014421] font-bold">✓</span>
          <span>Vad har varit den största positiva förändringen?</span>
        </li>
      </ul>
    </div>
  );
}
