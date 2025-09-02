'use client';

import { motion } from 'framer-motion';
import { Book, Video, FileText, Download } from 'lucide-react';

const materials = [
  {
    id: 1,
    title: 'Kursmaterial - Functional Flow',
    description: 'Komplett kursmaterial med fördjupad information om avancerade functional foods-koncept',
    type: 'pdf',
    icon: FileText,
    downloadUrl: '/materials/functional-flow-guide.pdf',
  },
  {
    id: 2,
    title: 'Videoföreläsningar',
    description: 'Se alla inspelade föreläsningar från kursen när som helst',
    type: 'video',
    icon: Video,
    link: '/dashboard/courses/functional-flow/videos',
  },
  {
    id: 3,
    title: 'Receptsamling',
    description: 'Alla 85 recept samlade i ett praktiskt format',
    type: 'pdf',
    icon: Book,
    downloadUrl: '/materials/functional-flow-recipes.pdf',
  },
  {
    id: 4,
    title: 'Referenslista',
    description: 'Vetenskapliga källor och vidare läsning',
    type: 'pdf',
    icon: FileText,
    downloadUrl: '/materials/references.pdf',
  },
];

export default function FlowMaterialPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kursmaterial</h1>
        <p className="text-gray-600">
          Allt material från Functional Flow samlat på ett ställe
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {materials.map((material, index) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#1a4d78]/10 p-3 rounded-lg">
                <material.icon className="w-6 h-6 text-[#1a4d78]" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {material.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {material.description}
                </p>
                
                {material.downloadUrl ? (
                  <button className="inline-flex items-center gap-2 text-[#1a4d78] hover:text-[#2563a8] font-medium transition-colors">
                    <Download className="w-4 h-4" />
                    Ladda ner
                  </button>
                ) : (
                  <a
                    href={material.link}
                    className="inline-flex items-center gap-2 text-[#1a4d78] hover:text-[#2563a8] font-medium transition-colors"
                  >
                    Öppna
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Resources */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-[#1a4d78] to-[#2563a8] rounded-xl p-6 text-white"
      >
        <h3 className="text-xl font-semibold mb-3">Behöver du hjälp?</h3>
        <p className="mb-4">
          Om du har frågor om materialet eller behöver teknisk support, tveka inte att kontakta oss.
        </p>
        <a
          href="/dashboard/courses/functional-flow/community"
          className="inline-flex items-center gap-2 bg-white text-[#1a4d78] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Gå till community
        </a>
      </motion.div>
    </div>
  );
} 