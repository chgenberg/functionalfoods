'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronRight, FiAward, FiStar, FiHeart } from 'react-icons/fi';
import { GiFruitBowl, GiAlgae, GiWheat, GiStomach, GiMeal, GiFishCooked, GiHerbsBundle, GiWaterBottle, GiMeat } from 'react-icons/gi';
import { FaSeedling } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodCategory {
  id: number;
  name: string;
  icon: React.ElementType;
  description: string;
  benefits: string[];
  examples: string[];
  color: string;
  tips: string;
}

export default function FunctionalFoodsTopplistaPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [checkedCategories, setCheckedCategories] = useState<number[]>([]);

  const topCategories: FoodCategory[] = [
    {
      id: 1,
      name: 'Antioxidantrik mat',
      icon: GiFruitBowl,
      description: 'Färgglada frukter och grönsaker som stödjer cellulär hälsa och bekämpar oxidativ stress.',
      benefits: ['Skyddar celler', 'Minskar inflammation', 'Stärker immunförsvar', 'Förebygger åldrande'],
      examples: ['Blåbär', 'Broccoli', 'Paprika', 'Sötpotatis', 'Morötter', 'Bladgrönsaker'],
      color: 'from-purple-400 to-pink-400',
      tips: 'Ät regnbågens alla färger varje dag!'
    },
    {
      id: 2,
      name: 'Grön mat & mikroalger',
      icon: GiAlgae,
      description: 'Havsgrönsaker och mikroalger är riktiga näringsbomber med komplett protein.',
      benefits: ['Komplett protein', 'Avgiftar kroppen', 'Stärker sköldkörteln', 'Ökar energi'],
      examples: ['Spirulina', 'Chlorella', 'Nori', 'Wakame', 'Kelp'],
      color: 'from-green-400 to-teal-400',
      tips: 'Börja med 1 tsk spirulina i smoothien!'
    },
    {
      id: 3,
      name: 'Fiberrika livsmedel',
      icon: GiWheat,
      description: 'Främjar matsmältning, mättnad och stabil blodsockernivå.',
      benefits: ['Förbättrar matsmältning', 'Håller mätt längre', 'Balanserar blodsocker', 'Sänker kolesterol'],
      examples: ['Havre', 'Linfrön', 'Avokado', 'Baljväxter', 'Fullkorn', 'Kokos'],
      color: 'from-yellow-400 to-orange-400',
      tips: 'Öka fiberintaget gradvis och drick mycket vatten!'
    },
    {
      id: 4,
      name: 'Probiotikarika livsmedel',
      icon: GiStomach,
      description: 'Goda bakterier som bidrar till en balanserad tarmflora och starkt immunförsvar.',
      benefits: ['Balanserad tarmflora', 'Stärkt immunförsvar', 'Bättre näringsupptag', 'Friskare hud'],
      examples: ['Yoghurt', 'Kefir', 'Kimchi', 'Surkål', 'Miso', 'Kombucha'],
      color: 'from-blue-400 to-indigo-400',
      tips: 'Ät något fermenterat varje dag!'
    },
    {
      id: 5,
      name: 'Prebiotikarika livsmedel',
      icon: GiMeal,
      description: 'Näring för de goda bakterierna som främjar en hälsosam tarmflora.',
      benefits: ['Näring för goda bakterier', 'Förbättrad matsmältning', 'Stärkt immunförsvar', 'Bättre mineralupptag'],
      examples: ['Lök', 'Vitlök', 'Sparris', 'Jordärtskocka', 'Bananer', 'Cashewnötter'],
      color: 'from-indigo-400 to-purple-400',
      tips: 'Kombinera med probiotika för bästa effekt!'
    },
    {
      id: 6,
      name: 'Omega-3-rika livsmedel',
      icon: GiFishCooked,
      description: 'Essentiella fettsyror som är hjältarna för hjärtat och hjärnan!',
      benefits: ['Skyddar hjärtat', 'Minskar inflammation', 'Stödjer hjärnfunktion', 'Förbättrar humör'],
      examples: ['Lax', 'Sardiner', 'Valnötter', 'Chiafrön', 'Hampafrön', 'Linfrön'],
      color: 'from-cyan-400 to-blue-400',
      tips: 'Ät fet fisk 2-3 gånger i veckan!'
    },
    {
      id: 7,
      name: 'Nötter och frön',
      icon: FaSeedling,
      description: 'Små men effektfulla näringsbomber fulla av hälsosamma fetter och mineraler.',
      benefits: ['Hälsosamma fetter', 'Protein och fiber', 'Mineraler', 'Antioxidanter'],
      examples: ['Mandlar', 'Valnötter', 'Chiafrön', 'Linfrön', 'Solrosfrön', 'Pumpafrön'],
      color: 'from-amber-400 to-yellow-400',
      tips: 'En handfull nötter om dagen är perfekt!'
    },
    {
      id: 8,
      name: 'Kryddor, örter och te',
      icon: GiHerbsBundle,
      description: 'Naturens egna läkemedel med kraftfulla antioxidativa och antiinflammatoriska egenskaper.',
      benefits: ['Antiinflammatoriskt', 'Antioxidanter', 'Förbättrar matsmältning', 'Stärker immunförsvar'],
      examples: ['Gurkmeja', 'Ingefära', 'Kanel', 'Persilja', 'Grönt te', 'Cayennepeppar'],
      color: 'from-orange-400 to-red-400',
      tips: 'Använd rikligt med kryddor i matlagningen!'
    },
    {
      id: 9,
      name: 'Benbuljong',
      icon: GiWaterBottle,
      description: 'Näringsrik dryck full av kollagen, mineraler och aminosyror för läkning.',
      benefits: ['Läker tarmen', 'Stärker leder', 'Förbättrar hud', 'Mineraler och kollagen'],
      examples: ['Kycklingbuljong', 'Nötbuljong', 'Fiskbuljong', 'Lammbuljong'],
      color: 'from-gray-400 to-gray-600',
      tips: 'Drick en kopp varm benbuljong dagligen!'
    },
    {
      id: 10,
      name: 'Animaliskt protein',
      icon: GiMeat,
      description: 'Högkvalitativa proteiner som ger kroppen de finaste byggmaterialen.',
      benefits: ['Komplett protein', 'B12-vitamin', 'Järn och zink', 'Muskelbyggande'],
      examples: ['Närproducerat kött', 'Ekologisk kyckling', 'MSC-märkt fisk', 'KRAV-ägg', 'Viltkött'],
      color: 'from-red-500 to-red-700',
      tips: 'Välj alltid högsta kvalitet och variera proteinkällorna!'
    }
  ];

  const handleCategoryCheck = (categoryId: number) => {
    setCheckedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const progressPercentage = (checkedCategories.length / topCategories.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/courses/functional-basics/material" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4">
            <FiArrowLeft className="mr-2" />
            Tillbaka till kursmaterial
          </Link>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mr-4">
              <FiAward className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Functional Foods Topplista</h1>
              <p className="text-gray-600">De 10 viktigaste kategorierna för optimal hälsa</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Här är de tio livsmedelskategorierna som har de mest kraftfulla hälsofrämjande egenskaperna. 
              Genom att inkludera livsmedel från varje kategori i din dagliga kost skapar du en stark grund 
              för långsiktig hälsa och välbefinnande.
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Din progress</span>
              <span className="text-sm font-bold text-primary">{checkedCategories.length}/10 kategorier</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {topCategories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            const isChecked = checkedCategories.includes(category.id);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-primary' : 'hover:shadow-xl'
                }`}
              >
                {/* Category Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center mr-4`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <span className="text-2xl font-bold text-primary mr-2">#{category.id}</span>
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{category.tips}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryCheck(category.id);
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {isChecked && <FiCheckCircle className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">{category.description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiStar className="w-4 h-4 mr-1 text-yellow-500" />
                      {category.benefits.length} fördelar
                    </div>
                    <FiChevronRight className={`w-5 h-5 text-primary transition-transform ${
                      isSelected ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <FiHeart className="w-4 h-4 mr-2 text-red-500" />
                              Hälsofördelar
                            </h4>
                            <ul className="space-y-2">
                              {category.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-primary mr-2">✓</span>
                                  <span className="text-sm text-gray-600">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Exempel</h4>
                            <div className="flex flex-wrap gap-2">
                              {category.examples.map((example, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700"
                                >
                                  {example}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Kom ihåg!</h2>
          <p className="text-lg leading-relaxed mb-4">
            Genom att inkludera livsmedel från alla dessa kategorier skapar du en näringsrik och 
            varierad kost som stödjer din kropp på alla nivåer. Det handlar inte om perfektion, 
            utan om att göra medvetna val varje dag.
          </p>
          <div className="bg-white/20 rounded-xl p-4">
            <p className="font-medium">Tips för framgång:</p>
            <ul className="mt-2 space-y-1">
              <li>• Börja med 1-2 kategorier och bygg på gradvis</li>
              <li>• Planera veckans måltider för att få med alla kategorier</li>
              <li>• Experimentera med nya livsmedel från varje kategori</li>
            </ul>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fortsätt din resa</h3>
              <p className="text-gray-600 mb-4">Lär dig mer om naturens egna hälsobomber</p>
              <Link href="/dashboard/courses/functional-basics/material/naturens-egna-halsobomber" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                Nästa modul: Naturens egna hälsobomber
                <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <GiFruitBowl className="w-16 h-16 text-primary opacity-20" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 