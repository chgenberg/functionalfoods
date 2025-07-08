'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBook, FiX, FiClock, FiCheckCircle, FiFileText,
  FiHeart, FiTarget, FiTrendingUp, FiAward
} from 'react-icons/fi';
import { 
  GiFruitBowl, GiHealthNormal, GiMeal, GiWheat
} from 'react-icons/gi';

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  readTime: string;
  completed?: boolean;
  content: string;
}

export default function KnowledgeMaterialPage() {
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const knowledgeItems: KnowledgeItem[] = [
    {
      id: 'vad-ar-functional-foods',
      title: 'Vad är Functional Foods?',
      description: 'Lär dig grunderna om mervärdesmat och dess 10 livsmedelskategorier',
      icon: GiFruitBowl,
      color: 'from-green-500 to-teal-600',
      readTime: '15 min',
      content: `Functional Foods är livsmedel som ger hälsofördelar utöver grundläggande näring. Dessa livsmedel innehåller bioaktiva föreningar som kan förbättra hälsan och minska risken för sjukdomar.

De 10 huvudkategorierna inom Functional Foods:

1. **Bär och frukter** - Rika på antioxidanter, vitaminer och fiber
2. **Grönsaker** - Fullpackade med vitaminer, mineraler och fytokemikalier
3. **Fullkorn** - Ger långsam energi och viktiga B-vitaminer
4. **Nötter och frön** - Innehåller hälsosamma fetter och protein
5. **Fet fisk** - Omega-3 fettsyror för hjärta och hjärna
6. **Probiotika** - Stödjer tarmhälsan och immunförsvaret
7. **Örter och kryddor** - Antiinflammatoriska egenskaper
8. **Te och kaffe** - Antioxidanter och bioaktiva föreningar
9. **Mörk choklad** - Flavonoider för hjärthälsa
10. **Fermenterade livsmedel** - Probiotika och förbättrad näringsupptag`
    },
    {
      id: 'fordelarna-med-functional-foods',
      title: 'Fördelarna med Functional Foods',
      description: 'Upptäck alla hälsofördelar och hur din kropp påverkas positivt',
      icon: GiHealthNormal,
      color: 'from-purple-500 to-pink-600',
      readTime: '20 min',
      content: `Functional Foods erbjuder många hälsofördelar som kan förbättra din livskvalitet betydligt:

**Fysiska fördelar:**
• Ökad energinivå och uthållighet
• Förbättrad matsmältning och tarmhälsa
• Stärkt immunförsvar
• Minskad inflammation i kroppen
• Bättre hjärthälsa och blodcirkulation
• Stabilare blodsockernivåer
• Hälsosammare hud, hår och naglar

**Mentala fördelar:**
• Förbättrad koncentration och fokus
• Bättre minnesfunktion
• Minskad risk för depression och ångest
• Förbättrad sömnkvalitet
• Ökad mental klarhet

**Långsiktiga fördelar:**
• Minskad risk för kroniska sjukdomar
• Hälsosamt åldrande
• Bättre viktkontroll
• Ökad livslängd med god livskvalitet`
    },
    {
      id: 'dags-att-komma-igang',
      title: 'Dags att komma igång',
      description: 'Praktiska tips för att starta din resa med functional foods',
      icon: FiTarget,
      color: 'from-orange-500 to-red-600',
      readTime: '25 min',
      content: `Att börja med Functional Foods behöver inte vara komplicerat. Här är en steg-för-steg guide:

**Vecka 1-2: Grundläggande förändringar**
• Börja dagen med ett näringsrikt frukost
• Byt ut vitt bröd mot fullkorn
• Lägg till bär i din yoghurt eller gröt
• Drick grönt te istället för läsk

**Vecka 3-4: Utöka repertoaren**
• Introducera fet fisk 2-3 gånger i veckan
• Experimentera med nya grönsaker
• Prova fermenterade livsmedel som kimchi eller kefir
• Använd mer örter och kryddor i matlagningen

**Tips för framgång:**
1. Planera dina måltider i förväg
2. Handla med lista baserad på recepten
3. Förbered matlådor för veckan
4. Ha hälsosamma snacks tillgängliga
5. Drick mycket vatten
6. Lyssna på din kropp
7. Var tålmodig - förändringar tar tid

**Vanliga misstag att undvika:**
• Att göra för stora förändringar på en gång
• Att skippa måltider
• Att inte dricka tillräckligt med vatten
• Att ge upp för tidigt`
    },
    {
      id: 'att-valja-ratt-proteiner',
      title: 'Att välja rätt proteiner',
      description: 'Guide till proteinrika livsmedel inom functional foods',
      icon: GiMeal,
      color: 'from-blue-500 to-indigo-600',
      readTime: '15 min',
      content: `Protein är en viktig byggsten för kroppen. Här är de bästa proteinvalen inom Functional Foods:

**Animaliska proteinkällor:**
• **Fet fisk** (lax, makrill, sardiner) - Omega-3 + protein
• **Ägg** - Komplett protein med alla aminosyror
• **Grekisk yoghurt** - Protein + probiotika
• **Cottage cheese** - Högt proteininnehåll, låg fetthalt

**Vegetabiliska proteinkällor:**
• **Quinoa** - Komplett protein + fiber
• **Linser** - Protein + järn + fiber
• **Kikärtor** - Protein + komplex kolhydrater
• **Hampfrön** - Protein + omega-3
• **Mandlar** - Protein + vitamin E
• **Chiafrön** - Protein + omega-3 + fiber

**Proteinbehov:**
• Normalaktiv vuxen: 0,8-1g per kg kroppsvikt
• Aktiv/tränar: 1,2-1,6g per kg kroppsvikt
• Äldre: 1-1,2g per kg kroppsvikt

**Tips för optimal proteinupptag:**
• Fördela proteinintaget över dagen
• Kombinera olika proteinkällor
• Ät protein efter träning
• Inkludera protein i varje måltid`
    },
    {
      id: 'att-valja-ratt-kolhydrater',
      title: 'Att välja rätt kolhydrater',
      description: 'Smarta kolhydrater för stabil energi och blodsockerkontroll',
      icon: GiWheat,
      color: 'from-yellow-500 to-orange-600',
      readTime: '15 min',
      content: `Kolhydrater ger energi, men kvaliteten spelar stor roll. Här är de bästa valen:

**Fullkorn och hela gryn:**
• **Havre** - Beta-glukaner för hjärthälsa
• **Quinoa** - Protein + långsam energi
• **Bovete** - Glutenfritt + antioxidanter
• **Fullkornsris** - B-vitaminer + fiber
• **Hirs** - Mineralrikt + lättsmält

**Grönsaker som kolhydratkällor:**
• **Sötpotatis** - Betakaroten + fiber
• **Rödbetor** - Nitrater för blodflöde
• **Morötter** - Vitamin A + fiber
• **Broccoli** - Låg GI + C-vitamin
• **Blomkål** - Låg i kalorier + näringsrik

**Frukt och bär:**
• **Blåbär** - Antioxidanter + låg GI
• **Äpplen** - Pektin + långsam energi
• **Päron** - Fiber + mineraler
• **Citrusfrukter** - C-vitamin + flavonoider

**Tips för stabilt blodsocker:**
• Välj hela livsmedel framför processade
• Kombinera kolhydrater med protein/fett
• Ät fiber-rika kolhydrater
• Undvik raffinerat socker
• Välj livsmedel med lågt GI`
    },
    {
      id: 'functional-foods-topplista',
      title: 'Functional Foods Topplista',
      description: 'De mest kraftfulla livsmedlen för optimal hälsa',
      icon: FiAward,
      color: 'from-indigo-500 to-purple-600',
      readTime: '10 min',
      content: `Här är de absolut bästa functional foods du bör inkludera regelbundet:

**Topp 10 Superfoods:**

1. **Blåbär** - Antioxidantkungen
   • Skyddar hjärnan
   • Förbättrar minnet
   • Antiinflammatoriskt

2. **Lax** - Omega-3 bomben
   • Hjärthälsa
   • Hjärnfunktion
   • Antiinflammatoriskt

3. **Grönkål** - Näringspaketet
   • Vitamin K, A, C
   • Kalcium
   • Antioxidanter

4. **Valnötter** - Hjärnmaten
   • Omega-3
   • Vitamin E
   • Förbättrar kognition

5. **Avokado** - Fettbomben
   • Enkelomättade fetter
   • Fiber
   • Kalium

6. **Grönt te** - Antioxidantdrycken
   • EGCG
   • L-teanin
   • Metabolism-boost

7. **Mörk choklad (70%+)** - Hjärtevännen
   • Flavonoider
   • Järn
   • Magnesium

8. **Linser** - Proteinpaketet
   • Vegetabiliskt protein
   • Järn
   • Folat

9. **Ingefära** - Inflammationshämmaren
   • Gingerol
   • Matsmältning
   • Illamående-lindring

10. **Gurkmeja** - Guldkryddan
    • Curcumin
    • Antiinflammatoriskt
    • Antioxidant`
    },
    {
      id: 'periodisk-fasta',
      title: 'Periodisk fasta - ger klarhet och energi',
      description: 'Lär dig om fördelarna med periodisk fasta och hur du kommer igång',
      icon: FiClock,
      color: 'from-green-600 to-teal-700',
      readTime: '20 min',
      content: `Periodisk fasta är ett kraftfullt verktyg för hälsa och välbefinnande:

**Vad är periodisk fasta?**
Periodisk fasta innebär att du växlar mellan perioder av ätande och fasta. Det handlar inte om VAD du äter, utan NÄR du äter.

**Populära metoder:**
• **16:8** - Fasta 16 timmar, ät inom 8 timmar
• **5:2** - Ät normalt 5 dagar, begränsa till 500-600 kcal 2 dagar
• **Eat-Stop-Eat** - 24 timmars fasta 1-2 gånger per vecka

**Fördelar med periodisk fasta:**
• Förbättrad insulinkänslighet
• Ökad fettförbränning
• Cellulär reparation (autofagi)
• Förbättrad hjärnfunktion
• Minskad inflammation
• Ökad tillväxthormon
• Förenklad vardag

**Så kommer du igång med 16:8:**
1. Välj ditt ätfönster (ex. 12:00-20:00)
2. Börja gradvis - förläng fastan stegvis
3. Drick vatten, te, svart kaffe under fastan
4. Ät näringsrika måltider i ätfönstret
5. Lyssna på din kropp

**Tips för framgång:**
• Håll dig sysselsatt under fastan
• Drick mycket vatten
• Få tillräckligt med sömn
• Ät tillräckligt under ätfönstret
• Var tålmodig - kroppen behöver vänja sig`
    },
    {
      id: 'functional-foods-3-steg',
      title: 'Functional Foods - 3 steg till ett friskare liv',
      description: 'En strukturerad approach för långsiktig framgång',
      icon: FiTrendingUp,
      color: 'from-purple-600 to-indigo-700',
      readTime: '30 min',
      content: `Här är de tre stegen för att integrera functional foods i ditt liv:

**STEG 1: RENSA & FÖRBERED (Vecka 1-2)**

*Rensa ut:*
• Processade livsmedel
• Raffinerat socker
• Transfetter
• Artificiella tillsatser

*Fyll på med:*
• Färska grönsaker och frukter
• Fullkornsprodukter
• Nötter och frön
• Naturliga kryddor

*Förberedelser:*
• Planera veckans måltider
• Förbered matlådor
• Organisera kök och skafferi
• Skapa rutiner

**STEG 2: BYGG & EXPERIMENTERA (Vecka 3-4)**

*Introducera nya livsmedel:*
• Prova en ny grönsak varje vecka
• Testa olika fullkorn
• Experimentera med kryddor
• Utforska fermenterade livsmedel

*Skapa vanor:*
• Ät frukost varje dag
• Inkludera grönsaker i varje måltid
• Drick grönt te dagligen
• Snacksa på nötter och frön

*Lär dig laga mat:*
• Prova nya recept
• Lär dig grundläggande tekniker
• Experimentera med smaker
• Gör mat från grunden

**STEG 3: FÖRFINA & UPPRÄTTHÅLL (Vecka 5+)**

*Optimera näringsintaget:*
• Balansera makronutrienter
• Fokusera på mikronäringsämnen
• Timing av måltider
• Individuell anpassning

*Långsiktig strategi:*
• 80/20 regeln (80% hälsosamt)
• Flexibilitet vid sociala tillfällen
• Fortsätt experimentera
• Följ kroppens signaler

*Livsstilsfaktorer:*
• Regelbunden motion
• God sömn
• Stresshantering
• Social gemenskap

**Nyckeln till framgång:**
Kom ihåg att detta är en livsstil, inte en diet. Var snäll mot dig själv, fira små framsteg och fokusera på hur du mår snarare än hur du ser ut.`
    }
  ];

  const toggleCompleted = (id: string) => {
    setCompletedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kunskapsmaterial</h1>
        <p className="text-gray-600 mt-2">Fördjupa din kunskap om functional foods</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Din läsning</h3>
          <span className="text-sm text-gray-600">
            {completedItems.length} av {knowledgeItems.length} slutförda
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedItems.length / knowledgeItems.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-green-500 to-teal-600"
          />
        </div>
      </div>

      {/* Knowledge Items Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {knowledgeItems.map((item) => {
          const isCompleted = completedItems.includes(item.id);
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <item.icon className="w-12 h-12" />
                  {isCompleted && (
                    <FiCheckCircle className="w-6 h-6" />
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1" />
                    {item.readTime}
                  </span>
                  <span className="text-sm font-medium text-purple-600">
                    Läs mer →
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Popup Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${selectedItem.color} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
                    <p className="opacity-90">{selectedItem.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="prose prose-lg max-w-none">
                  {selectedItem.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      );
                    } else if (paragraph.startsWith('•')) {
                      return (
                        <li key={index} className="ml-4 text-gray-700">
                          {paragraph.substring(1).trim()}
                        </li>
                      );
                    } else if (paragraph.match(/^\d+\./)) {
                      return (
                        <li key={index} className="ml-4 text-gray-700 list-decimal">
                          {paragraph}
                        </li>
                      );
                    } else if (paragraph.trim()) {
                      return (
                        <p key={index} className="text-gray-700 mb-4">
                          {paragraph}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <span className="flex items-center text-sm text-gray-500">
                  <FiClock className="mr-1" />
                  {selectedItem.readTime} läsning
                </span>
                <button
                  onClick={() => {
                    toggleCompleted(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    completedItems.includes(selectedItem.id)
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                  }`}
                >
                  {completedItems.includes(selectedItem.id) ? 'Markera som oläst' : 'Markera som läst'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 