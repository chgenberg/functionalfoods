'use client';

import { motion } from 'framer-motion';
import { Download, FileText, Book, CheckCircle } from 'lucide-react';

const downloads = [
  {
    id: 1,
    title: 'Functional Energy - Komplett kursguide',
    description: 'Hela kursen i PDF-format med alla veckor och recept',
    size: '15.2 MB',
    type: 'PDF',
    icon: Book,
  },
  {
    id: 2,
    title: 'Veckoscheman',
    description: 'Alla 6 veckors kostscheman i utskriftsvänligt format',
    size: '3.8 MB',
    type: 'PDF',
    icon: FileText,
  },
  {
    id: 3,
    title: 'Inköpslistor',
    description: 'Kompletta inköpslistor för alla veckor',
    size: '1.2 MB',
    type: 'PDF',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Receptsamling',
    description: 'Alla 85 recept i ett dokument',
    size: '8.5 MB',
    type: 'PDF',
    icon: Book,
  },
  {
    id: 5,
    title: 'Råvaruguide',
    description: 'Fördjupad information om funktionella råvaror',
    size: '4.3 MB',
    type: 'PDF',
    icon: FileText,
  },
];

export default function EnergyDownloadsPage() {
  const handleDownload = (fileName: string) => {
    // In a real app, this would trigger a file download
    console.log(`Downloading ${fileName}...`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nedladdningar</h1>
        <p className="text-gray-600">
          Ladda ner kursmaterial för offline-användning
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> Ladda ner allt material för att ha tillgång till kursen även offline. 
              Perfekt för resor eller när du inte har internetuppkoppling.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {downloads.map((download, index) => (
          <motion.div
            key={download.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-[#93C560]/10 p-3 rounded-lg">
                  <download.icon className="w-6 h-6 text-[#93C560]" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {download.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {download.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{download.type}</span>
                    <span>•</span>
                    <span>{download.size}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(download.title)}
                className="flex items-center gap-2 bg-[#93C560] text-white px-4 py-2 rounded-lg hover:bg-[#7FB547] transition-colors"
              >
                <Download className="w-4 h-4" />
                Ladda ner
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Download All */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-gradient-to-r from-[#93C560] to-[#7FB547] rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ladda ner allt material</h3>
            <p className="text-white/80">
              Få alla filer i ett ZIP-arkiv (32.5 MB)
            </p>
          </div>
          <button
            onClick={() => handleDownload('Functional Energy - Allt material')}
            className="flex items-center gap-2 bg-white text-[#93C560] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Ladda ner allt
          </button>
        </div>
      </motion.div>
    </div>
  );
} 