'use client';

import Link from 'next/link';
import { ChevronLeft, Book, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const knowledgeDocs = [
  {
    title: 'Vad är functional foods?',
    slug: 'vad-a-r-functional-foods',
    description: 'En introduktion till functional foods och hur de kan stötta din hälsa.',
    readTime: '5 min'
  },
  {
    title: 'Topplista med functional foods',
    slug: 'topplista-med-functional-foods',
    description: 'De bästa functional foods-ingredienserna du bör ha i ditt kök.',
    readTime: '4 min'
  },
  {
    title: 'Att äta ute med functional foods',
    slug: 'att-a-ta-ute-med-functional-foods',
    description: 'Tips för att göra hälsosamma val när du äter på restaurang.',
    readTime: '3 min'
  }
];

export default function ProvaPaVeckaMaterial() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer */}
      <div className="h-16 md:h-0" />

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/prova-pa-vecka/oversikt" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ChevronLeft className="w-5 h-5" /> Tillbaka
              </Link>
            </div>
            <span className="text-[#014421] font-bold">Kunskapsdokument</span>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#014421]/10 rounded-2xl flex items-center justify-center">
              <Book className="w-8 h-8 text-[#014421]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#014421]">
                Veckans kunskapsdokument
              </h1>
              <p className="text-gray-600 mt-1">
                Läs och lär dig mer om functional foods
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="space-y-4">
          {knowledgeDocs.map((doc, index) => (
            <motion.div
              key={doc.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/dashboard/courses/prova-pa-vecka/knowledge/${doc.slug}`}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-[#014421] text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {doc.readTime} läsning
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {doc.title}
                    </h2>
                    <p className="text-gray-600">
                      {doc.description}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mt-2" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
