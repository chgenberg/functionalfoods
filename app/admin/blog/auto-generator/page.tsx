"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiSettings, FiClock, FiCheck, FiX, FiInfo, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

export default function AutoBlogGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [showTopics, setShowTopics] = useState(false);

  const blogTopics = [
    'Vad menas egentligen med "functional foods"?',
    'Historien bakom funktionell mat – från 1980-talets Japan till dagens EU-definitioner',
    'Så läser du en hälsopåståenden-etikett utan att bli lurad',
    'Lingon som nordiskt "superbär" – påverkan på blodsocker och tarmflora',
    'Probiotika vs. prebiotika: skillnader, synergieffekter och bästa källor',
    'Adaptogener 101 – vad gör ashwagandha, reishi & co. för stress?',
    'Omega-3 från alger: hållbart alternativ till fiskolja',
    'Kefir, kimchi, kombucha – fermenterade stjärnor för maghälsa',
    'Betaglukaner i havre: därför sänker de kolesterol',
    'Funktionella drycker: boom eller bubbla? Marknadstrender 2025',
    'Gurkmeja & curcumin – antiinflammatoriskt eller bara hype?',
    'Plant-based protein med extra mervärden: ärtas, hampa och lupin',
    'Hur påverkar choklad med högt kakaoinnehåll hjärnan?',
    'Resistenta stärkelser – kalla potatisar som prebiotiskt vapen',
    'Personlig nutrition: DNA-tester möter functional food-recept',
    'Blåbärsantocyaniner och synskärpa – vad säger forskningen?',
    'Regelverket kring Novel Foods i EU – en snabbguide',
    'Är "biohacking-kaffe" med MCT-olja mer än en trend?',
    'Funktionellt snack: frystorkade grönsaker med vitaminboost',
    'Collagenpeptider – hud, leder eller placebo?',
    'Svenska havets superalg: knöltång som jod- och fiberkälla',
    'Fytoöstrogener i linfrön – vän eller fiende?',
    'Träning + nitratrika rödbetor: prestationshöjare på naturlig väg',
    'Hur påverkar surdegsgärning mineralupptaget i fullkornsbröd?',
    'Regenerativt jordbruk och funktionella råvaror – ett hållbarhetsperspektiv',
    'Grönte-katechiner och fettförbränning: evidens eller överdrift?',
    'Mikrobiom-vänliga desserter – recept som både smakar och gör gott',
    'CBD-infuserad mat: juridik, säkerhet och framtidspotential i Sverige',
    'Resveratrol i druvskal: anti-aging i verkligheten?',
    'Functional pet food – när hundens matskål blir high-tech',
    'Blodsocker­vänliga bakverk med baljväxtmjöl',
    'Hög-fenolisk olivolja och hjärt-kärlhälsa',
    'Fytonäringsämnen i rödkål – mer än bara C-vitamin',
    'Smarta förpackningar som förlänger probiotikans hållbarhet',
    'Koll på kolin – det bortglömda näringsämnet i ägg och alg',
    'Kan functional food minska klimatskam? Konsumentpsykologi',
    'Postbiotika – nästa våg efter pro- och prebiotika',
    'Nootropiska ingredienser: lion\'s mane, L-teanin & koffein i samspel',
    'Havtorn: C-vitaminbomb för immunförsvaret',
    'Selenberikade grödor – nödvändigt i Norden?',
    'Funktionell mat för klimakteriet: soja, flax & polyfenoler',
    'Allergensäkra innovationer: garanterat nöt- och glutenfritt men näringsrikt',
    'Hur väl fungerar mikroinkapsling av vitaminer i idrottsnutrition?',
    'Från biprodukt till booster: polyfenoler ur äppelpressrester',
    'Glykemiskt index vs. glykemisk belastning – praktisk guide',
    'Sötpotatisfibers resistenta stärkelse i low-carb-bröd',
    'Matcha vs. sencha – funktionella skillnader i grönt te',
    'Bevaka blodsockret: CGM-trenden möter funktionell kost',
    'Mental hälsa och tarm-hjärna-axeln: mat som påverkar humöret',
    'Framtidens skolmat: näringstät och funktionsfokuserad',
    'Startup-case: svenska bolag som lyckats med funktionella livsmedel'
  ];

  const handleManualGeneration = async () => {
    setIsGenerating(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/cron/auto-blog', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setLastResult(result);
    } catch (error) {
      setLastResult({
        success: false,
        error: 'Kunde inte ansluta till API:et',
        details: error instanceof Error ? error.message : 'Okänt fel'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            ← Tillbaka till bloggen
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Automatisk Blogginlägg-Generator
          </h1>
          <p className="text-gray-600">
            Hantera automatisk generering av blogginlägg med AI
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Huvudkontroller */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manuell generering */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiPlay className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Manuell Generering</h2>
                  <p className="text-gray-600 text-sm">Skapa ett blogginlägg direkt</p>
                </div>
              </div>

              <button
                onClick={handleManualGeneration}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Genererar blogginlägg...
                  </>
                ) : (
                  <>
                    <FiPlay className="w-5 h-5" />
                    Generera Blogginlägg Nu
                  </>
                )}
              </button>

              {lastResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-lg border ${
                    lastResult.success 
                      ? 'bg-background border-border text-secondary' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {lastResult.success ? (
                      <FiCheck className="w-5 h-5 text-primary" />
                    ) : (
                      <FiX className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {lastResult.success ? 'Framgång!' : 'Fel uppstod'}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{lastResult.message}</p>
                  {lastResult.result?.post && (
                    <div className="text-sm">
                      <p><strong>Titel:</strong> {lastResult.result.post.title}</p>
                      <p><strong>Slug:</strong> {lastResult.result.post.slug}</p>
                      <p><strong>Publicerad:</strong> {new Date(lastResult.result.post.publishedAt).toLocaleString('sv-SE')}</p>
                    </div>
                  )}
                  {lastResult.error && (
                    <p className="text-sm mt-2"><strong>Fel:</strong> {lastResult.details}</p>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Automatisk schemaläggning info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Automatisk Schemaläggning</h2>
                  <p className="text-gray-600 text-sm">Konfiguration för automatisk publicering</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Aktuella Inställningar</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span>Körs slumpmässigt under dagtid (08:00-18:00)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiRefreshCw className="w-4 h-4" />
                      <span>30% chans att köra vid varje kontroll</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiSettings className="w-4 h-4" />
                      <span>Använder OpenAI GPT-4 för innehållsgenerering</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <FiInfo className="w-5 h-5" />
                    <span className="font-medium">Schemaläggning via Cron Jobs</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    För att aktivera automatisk publicering, konfigurera en cron job som anropar:
                  </p>
                  <code className="block bg-blue-100 text-blue-800 text-sm p-2 rounded mt-2 font-mono">
                    GET /api/cron/auto-blog
                  </code>
                  <p className="text-blue-700 text-sm mt-2">
                    Rekommenderat: Kör varje timme under dagtid
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidopanel */}
          <div className="space-y-6">
            {/* Ämnesöversikt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tillgängliga Ämnen</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Totalt antal ämnen:</span>
                  <span className="font-medium text-gray-900">{blogTopics.length}</span>
                </div>
                <button
                  onClick={() => setShowTopics(!showTopics)}
                  className="w-full text-left text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  {showTopics ? 'Dölj ämneslista' : 'Visa alla ämnen'}
                </button>
                {showTopics && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="max-h-96 overflow-y-auto"
                  >
                    <div className="space-y-2 text-sm">
                      {blogTopics.map((topic, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-gray-700">
                          {topic}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Statistik */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Funktioner</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background-secondary rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AI-genererat innehåll</p>
                    <p className="text-sm text-gray-600">~1000 ord per inlägg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background-secondary rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Automatisk SEO</p>
                    <p className="text-sm text-gray-600">Slug och meta-beskrivning</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background-secondary rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Direkt publicering</p>
                    <p className="text-sm text-gray-600">Synligt för användare</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background-secondary rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Duplikatskydd</p>
                    <p className="text-sm text-gray-600">Kontrollerar befintliga inlägg</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 