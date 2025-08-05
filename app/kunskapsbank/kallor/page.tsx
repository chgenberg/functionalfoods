"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBookOpen, FiExternalLink, FiFilter, FiCalendar, FiUser, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { BiDna, BiLeaf } from 'react-icons/bi';
import { GiMicroscope, GiHeartOrgan, GiBrain } from 'react-icons/gi';

interface Source {
  id: number;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  category: string;
  summary: string;
  url?: string;
  type: 'research' | 'review' | 'clinical' | 'book';
}

const sources: Source[] = [
  {
    id: 1,
    title: "Functional foods: Components, health benefits, challenges, and major projects",
    authors: ["Alkhatib, A.", "Tsang, C.", "Tiss, A."],
    journal: "Food Bioscience",
    year: 2017,
    doi: "10.1016/j.fbio.2017.07.003",
    category: "Översikt",
    summary: "Omfattande översikt av funktionella livsmedel, deras komponenter och hälsofördelar.",
    type: "review"
  },
  {
    id: 2,
    title: "Polyphenols: food sources and bioavailability",
    authors: ["Manach, C.", "Scalbert, A.", "Morand, C.", "Rémésy, C.", "Jiménez, L."],
    journal: "American Journal of Clinical Nutrition",
    year: 2004,
    pmid: "15113720",
    category: "Antioxidanter",
    summary: "Grundläggande forskning om polyfenolernas biotillgänglighet och källor i mat.",
    type: "research"
  },
  {
    id: 3,
    title: "Omega-3 fatty acids and health: fact sheet for health professionals",
    authors: ["National Institutes of Health"],
    journal: "NIH Office of Dietary Supplements",
    year: 2022,
    category: "Omega-3",
    summary: "Omfattande guide om omega-3 fettsyrors hälsoeffekter och rekommendationer.",
    url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
    type: "review"
  },
  {
    id: 4,
    title: "Probiotics: definition, criteria for evaluation and review of recent research",
    authors: ["Salminen, S.", "Bouley, C.", "Boutron-Ruault, M.C."],
    journal: "Food Reviews International",
    year: 1998,
    category: "Probiotika",
    summary: "Klassisk definition och utvärdering av probiotika och deras hälsoeffekter.",
    type: "review"
  },
  {
    id: 5,
    title: "Bioactive compounds in foods: their role in the prevention of cardiovascular disease and cancer",
    authors: ["Kris-Etherton, P.M.", "Hecker, K.D.", "Bonanome, A."],
    journal: "American Journal of Medicine",
    year: 2002,
    pmid: "12531201",
    category: "Bioaktiva ämnen",
    summary: "Forskning om bioaktiva ämnens roll i prevention av hjärt-kärlsjukdom och cancer.",
    type: "clinical"
  },
  {
    id: 6,
    title: "Antioxidants in food: content, measurement, significance for human health",
    authors: ["Prior, R.L.", "Cao, G."],
    journal: "Free Radical Biology and Medicine",
    year: 1999,
    category: "Antioxidanter",
    summary: "Viktig forskning om antioxidanter i mat och deras betydelse för människors hälsa.",
    type: "research"
  },
  {
    id: 7,
    title: "Functional Foods: Principles and Technology",
    authors: ["Shahidi, F."],
    journal: "CRC Press",
    year: 2016,
    category: "Allmänt",
    summary: "Omfattande bok om funktionella livsmedels principer och teknologi.",
    type: "book"
  },
  {
    id: 8,
    title: "Prebiotic effects: metabolic and health benefits",
    authors: ["Gibson, G.R.", "Hutkins, R.", "Sanders, M.E."],
    journal: "British Journal of Nutrition",
    year: 2017,
    doi: "10.1017/S0007114517001041",
    category: "Prebiotika",
    summary: "Senaste forskningen om prebiotika och deras metaboliska hälsofördelar.",
    type: "review"
  },
  {
    id: 9,
    title: "Mediterranean diet and health status: an updated meta-analysis",
    authors: ["Sofi, F.", "Abbate, R.", "Gensini, G.F.", "Casini, A."],
    journal: "Current Atherosclerosis Reports",
    year: 2010,
    category: "Kost",
    summary: "Meta-analys av medelhavsdieten och dess hälsoeffekter.",
    type: "clinical"
  },
  {
    id: 10,
    title: "Dietary fiber: An overview",
    authors: ["Anderson, J.W.", "Baird, P.", "Davis Jr, R.H."],
    journal: "Nutrition Research",
    year: 2009,
    category: "Fiber",
    summary: "Översikt av kostfiber och dess roll för hälsan.",
    type: "review"
  }
];

const categories = ["Alla", "Översikt", "Antioxidanter", "Omega-3", "Probiotika", "Bioaktiva ämnen", "Prebiotika", "Kost", "Fiber", "Allmänt"];

const typeColors = {
  research: "bg-blue-100 text-blue-800",
  review: "bg-green-100 text-green-800", 
  clinical: "bg-purple-100 text-purple-800",
  book: "bg-orange-100 text-orange-800"
};

const typeLabels = {
  research: "Forskning",
  review: "Översikt",
  clinical: "Klinisk",
  book: "Bok"
};

const categoryIcons: Record<string, any> = {
  "Antioxidanter": BiLeaf,
  "Omega-3": GiHeartOrgan,
  "Probiotika": GiMicroscope,
  "Bioaktiva ämnen": BiDna,
  "Prebiotika": GiMicroscope,
  "Kost": BiLeaf,
  "Fiber": BiLeaf,
  "Allmänt": FiBookOpen,
  "Översikt": FiBookOpen
};

export default function KallorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         source.journal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Alla" || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (source: Source) => {
    const citation = `${source.authors.join(', ')} (${source.year}). ${source.title}. ${source.journal}.${source.doi ? ` DOI: ${source.doi}` : ''}${source.pmid ? ` PMID: ${source.pmid}` : ''}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(source.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    sources.forEach(source => {
      stats[source.category] = (stats[source.category] || 0) + 1;
    });
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a4324] to-[#9dc46d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Vetenskapliga Källor
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Utforska de vetenskapliga referenserna bakom vår kunskap om functional foods
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <FiBookOpen className="w-5 h-5" />
                <span>{sources.length} Källor</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                <span>{Math.min(...sources.map(s => s.year))} - {Math.max(...sources.map(s => s.year))}</span>
              </div>
              <div className="flex items-center gap-2">
                <GiMicroscope className="w-5 h-5" />
                <span>{Object.keys(stats).length} Kategorier</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök efter titel, författare eller tidskrift..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9dc46d] focus:border-transparent shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#1a4324] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
                {category !== "Alla" && stats[category] && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {stats[category]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 text-gray-600">
          Visar {filteredSources.length} av {sources.length} källor
        </div>

        {/* Sources Grid */}
        <div className="grid gap-6">
          {filteredSources.map((source, index) => {
            const CategoryIcon = categoryIcons[source.category] || FiBookOpen;
            
            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Left side - Icon and metadata */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1a4324] to-[#9dc46d] rounded-xl flex items-center justify-center text-white mb-3">
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${typeColors[source.type]}`}>
                        {typeLabels[source.type]}
                      </span>
                      <div className="text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {source.year}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                          {source.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <FiUser className="w-4 h-4" />
                          <span>{source.authors.join(', ')}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">{source.journal}</span>
                          {source.year && <span> ({source.year})</span>}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {source.summary}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {source.doi && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              DOI: {source.doi}
                            </span>
                          )}
                          {source.pmid && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                              PMID: {source.pmid}
                            </span>
                          )}
                          <span className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded">
                            {source.category}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(source)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {copiedId === source.id ? (
                            <>
                              <FiCheck className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Kopierad!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-4 h-4" />
                              <span>Kopiera citat</span>
                            </>
                          )}
                        </button>
                        
                        {(source.url || source.doi) && (
                          <a
                            href={source.url || `https://doi.org/${source.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1a4324] text-white hover:bg-[#9dc46d] hover:text-[#1a4324] rounded-lg transition-colors"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            <span>Läs mer</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredSources.length === 0 && (
          <div className="text-center py-12">
            <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga källor hittades</h3>
            <p className="text-gray-500">Prova att ändra sökterm eller filter</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-16 p-6 bg-[#1a4324] rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">Om våra källor</h3>
          <p className="text-white/90 leading-relaxed">
            Alla källor är noggrant utvalda från peer-reviewade tidskrifter och erkända institutioner. 
            Vi strävar efter att använda den senaste forskningen inom functional foods och näringslära 
            för att ge dig den mest aktuella och vetenskapligt grundade informationen.
          </p>
        </div>
      </div>
    </div>
  );
} 