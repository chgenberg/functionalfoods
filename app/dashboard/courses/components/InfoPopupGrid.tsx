'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, BookOpen, Info } from 'lucide-react';

interface InfoItem {
  title: string;
  filename: string;
  icon: string;
  description: string;
}

const allDocuments = [
  // Basics Course Documents
  { 
    title: "Frågor och svar", 
    filename: "fragor-och-svar.txt", 
    icon: "❓", 
    description: "Vanliga frågor om kursen och kosten",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Dags att komma igång!", 
    filename: "dags-att-komma-igang.txt", 
    icon: "🚀", 
    description: "Kom igång med din hälsoresa",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Att äta ute med functional foods", 
    filename: "att-ata-ute-med-functional-foods.txt", 
    icon: "🍽️", 
    description: "Tips för restaurangbesök",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Måldokument - styrelsemöte 1", 
    filename: "maldokument-styrelsemote-1.txt", 
    icon: "📋", 
    description: "Sätt upp dina hälsomål",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Fördelarna med functional foods", 
    filename: "fordelarna-med-functional-foods.txt", 
    icon: "💪", 
    description: "Varför functional foods fungerar",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Att äta ute med functional foods", 
    filename: "att-ata-ute-med-functional-foods.txt", 
    icon: "🍽️", 
    description: "Tips för restaurangbesök",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Benbuljong", 
    filename: "benbuljong.txt", 
    icon: "🍲", 
    description: "Hälsosam benbuljong och dess fördelar",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Att välja rätt kolhydrater", 
    filename: "att-valja-ratt-kolhydrater.txt", 
    icon: "🌾", 
    description: "Smarta kolhydratsalternativ",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Ersättningsguide för kolhydrater", 
    filename: "ersattningsguide-for-kolhydrater.txt", 
    icon: "🔄", 
    description: "Smarta kolhydratsalternativ",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "3 steg till ett friskare liv", 
    filename: "functional-foods-3-steg-till-ett-friskare-liv.txt", 
    icon: "🎯", 
    description: "Enkla steg mot bättre hälsa",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Functional foods topplista", 
    filename: "functional-foods-topplista.txt", 
    icon: "🏆", 
    description: "De bästa functional foods",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Motivation & reflektion", 
    filename: "motivation-och-reflektion.txt", 
    icon: "🌟", 
    description: "Håll motivationen uppe",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Ät mer functional foods enkelt", 
    filename: "at-mer-functional-foods-pa-ett-enkelt-satt.txt", 
    icon: "🥗", 
    description: "Praktiska tips för vardagen",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Functional foods som livsstil", 
    filename: "functional-foods-som-livsstil.txt", 
    icon: "🌱", 
    description: "Gör det till en livsstil",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Vad är functional foods?", 
    filename: "vad-ar-functional-foods.txt", 
    icon: "🤔", 
    description: "Grundläggande om functional foods",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  
  // Flow Course Specific Documents
  { 
    title: "Kosten - en guide till bättre mage och tarm", 
    filename: "kosten-guide-mage-tarm.txt", 
    icon: "📖", 
    description: "Kostguide för maghälsa",
    courseTypes: ['flow'] as const
  },
  { 
    title: "Vanliga mag- och tarmproblem", 
    filename: "vanliga-mag-och-tarmproblem.txt", 
    icon: "🤧", 
    description: "Förstå mag- och tarmproblem",
    courseTypes: ['flow'] as const
  },
  { 
    title: "Tillskott som kan stödja mag- och tarmhälsa", 
    filename: "tillskott-mag-tarm.txt", 
    icon: "💊", 
    description: "Kosttillskott för mage och tarm",
    courseTypes: ['flow'] as const
  },
  { 
    title: "Superpulver", 
    filename: "superpulver.txt", 
    icon: "✨", 
    description: "Kraftfulla superpulver",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Drycker", 
    filename: "drycker.txt", 
    icon: "🥤", 
    description: "Hälsosamma dryckesval",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  { 
    title: "Fermenterade livsmedel, probiotika och prebiotika", 
    filename: "fermenterade-livsmedel-probiotika-prebiotika.txt", 
    icon: "🥒", 
    description: "Stärk din tarmflora",
    courseTypes: ['flow'] as const
  },
  { 
    title: "Livsstilsfaktorer: stress, sömn och fysisk aktivitet", 
    filename: "livsstilsfaktorer-stress-somn-aktivitet.txt", 
    icon: "🧘", 
    description: "Balansera livsstilsfaktorer",
    courseTypes: ['flow'] as const
  },
  { 
    title: "Att välja rätt proteiner", 
    filename: "att-valja-ratt-proteiner.txt", 
    icon: "💪", 
    description: "Guide till bästa proteinval",
    courseTypes: ['basics', 'flow', 'energy'] as const
  },
  
  // Energy Course Documents
  { 
    title: "Naturens egna hälsobomber", 
    filename: "naturens-egna-halsobomber.txt", 
    icon: "💥", 
    description: "Kraftfulla superfoods från naturen",
    courseTypes: ['energy'] as const
  },
  { 
    title: "Måldokument - styrelsemöte 2", 
    filename: "maldokument-styrelsemote-2.txt", 
    icon: "📊", 
    description: "Utveckla dina hälsomål vidare",
    courseTypes: ['energy'] as const
  },
  { 
    title: "Periodisk fasta ger klarhet och energi", 
    filename: "periodisk-fasta-klarhet-energi.txt", 
    icon: "⏰", 
    description: "Fördelarna med periodisk fasta",
    courseTypes: ['energy'] as const
  },
  { 
    title: "Reflektion vecka 3", 
    filename: "reflektion-vecka-3.txt", 
    icon: "💭", 
    description: "Reflektera över din framsteg",
    courseTypes: ['energy'] as const
  }
];

interface InfoPopupGridProps {
  courseType: 'basics' | 'flow' | 'energy';
}

export default function InfoPopupGrid({ courseType }: InfoPopupGridProps) {
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Function to convert markdown to HTML
  const markdownToHtml = (text: string): string => {
    // Replace **text** with <strong>text</strong>
    let html = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Replace single * for emphasis
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Replace line breaks with <br> tags
    html = html.replace(/\n/g, '<br>');
    
    // Replace bullet points
    html = html.replace(/^- (.+)$/gm, '• $1');
    
    // Handle headings
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[#014421] mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#014421] mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#014421] mt-8 mb-4">$1</h1>');
    
    return html;
  };

  const openPopup = async (item: InfoItem) => {
    setSelectedInfo(item);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/scraped-content/${item.filename}`);
      if (response.ok) {
        const text = await response.text();
        
        // The files are already cleaned, just extract content after separator
        let cleanContent = text;
        
        if (text.includes('--------------------------------------------------------------------------------')) {
          const parts = text.split('--------------------------------------------------------------------------------');
          if (parts.length > 1) {
            cleanContent = parts[1].trim();
          }
        }
        
        setContent(cleanContent);
      } else {
        setContent('Kunde inte ladda innehållet. Försök igen senare.');
      }
    } catch (error) {
      setContent('Fel vid laddning av innehåll.');
    }
    
    setLoading(false);
  };

  return (
    <>
      {/* Info Grid */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-[#014421] mb-4">Kunskap och information</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Utforska våra guider och artiklar för att fördjupa din kunskap om functional foods
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allDocuments.map((item, index) => (
            <motion.button
              key={item.filename}
              onClick={() => openPopup(item)}
              className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="dashboard-emoji mb-2 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h4 className="font-semibold text-sm text-[#014421] mb-1 line-clamp-2">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2">
                {item.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {selectedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Solid Green */}
              <div className="bg-[#014421] text-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{selectedInfo.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedInfo.title}</h2>
                      <p className="text-white/80">{selectedInfo.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInfo(null)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
                  </div>
                ) : (
                  <div 
                    className="prose prose-lg max-w-none space-y-4"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                  />
                )}
              </div>

              {/* Modal Footer - Always visible */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Del av Functional Foods kunskapsbank</span>
                </div>
                <button
                  onClick={() => setSelectedInfo(null)}
                  className="px-6 py-2 bg-[#014421] text-white rounded-lg hover:bg-[#116530] transition-colors font-medium"
                >
                  Stäng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 