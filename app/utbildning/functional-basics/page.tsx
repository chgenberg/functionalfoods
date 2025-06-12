"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiClock, FiCheckCircle, FiArrowLeft, FiHeart, FiZap, FiShoppingCart, FiUsers, FiBook, FiStar, FiPlay, FiTarget, FiVideo, FiUser } from 'react-icons/fi';
import { GiBrain, GiStomach, GiWheat, GiHeartBeats, GiMuscleUp } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

export default function FunctionalBasicsPage() {
  // Add CSS for gradient animation
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(106, 90, 205, 0.5);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(106, 90, 205, 0.7);
      }
    `;
    document.head.appendChild(style);
  }
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { addItem } = useCart();

  const course = {
    id: 'functional-basics',
    name: 'Functional Basics',
    price: 2295,
    type: 'course' as const,
    image: '/functional_basics.png',
    quantity: 1
  };

  const handleAddToCart = () => {
    addItem(course);
  };

  const benefits = [
    {
      icon: FiZap,
      title: "Mer energi & bättre humör",
      description: "Stabilt blodsocker minskar humörsvängningar hos både barn och vuxna.",
      color: "text-yellow-600"
    },
    {
      icon: GiStomach,
      title: "Bättre matsmältning",
      description: "Fiberrik mat och probiotiska livsmedel stöder tarmhälsan och minskar magproblem.",
      color: "text-green-600"
    },
    {
      icon: FiHeart,
      title: "Starkare immunförsvar",
      description: "Näringsrik mat med antioxidanter hjälper kroppen att bekämpa sjukdomar.",
      color: "text-red-600"
    },
    {
      icon: GiBrain,
      title: "Mindre inflammation & stress",
      description: "Rätt matval kan minska inflammation och främja lugn och återhämtning.",
      color: "text-blue-600"
    },
    {
      icon: GiHeartBeats,
      title: "Hormonell balans",
      description: "Alla kroppens hormoner påverkas positivt av en näringsrik kost.",
      color: "text-purple-600"
    },
    {
      icon: GiMuscleUp,
      title: "Hälsobalans",
      description: "Främja en hälsosam vikt och välmående genom smarta matval.",
      color: "text-orange-600"
    }
  ];

  const whatYouGet = [
    {
      icon: FiBook,
      title: "75 Recept & Måltidsplan",
      description: "Enkla, goda och näringsrika måltider för hela familjen"
    },
    {
      icon: GiBrain,
      title: "Djupgående näringslära",
      description: "Förstå sambandet mellan mat, hälsa och longevity"
    },
    {
      icon: FiShoppingCart,
      title: "Råvaruguide & inköpslista",
      description: "Smarta inköp för att fylla köket med rätt mat"
    },
    {
      icon: FiCheckCircle,
      title: "Steg-för-steg-planering",
      description: "Lär dig att planera och balansera dina måltider"
    },
    {
      icon: FiPlay,
      title: "Videolektioner varje vecka",
      description: "Lättillgängligt och inspirerande innehåll"
    },
    {
      icon: FiUsers,
      title: "One-to-one coachning",
      description: "Personlig coaching med Ulrika och gruppstöd"
    }
  ];

  const forWho = [
    "Vill förbättra din hälsa steg för steg utan att det blir krångligt",
    "Vill bli av med ojämnt blodsocker och känna dig mätt efter måltider", 
    "Vill ha mer energi och känna dig piggare hela dagen",
    "Vill lära dig mer om antiinflammatorisk kost och longevity",
    "Vill skapa bättre matvanor på ett hållbart sätt"
  ];

  const functionalFoodsBenefits = [
    { icon: GiHeartBeats, text: "Stöd för hormonsystemet" },
    { icon: FiHeart, text: "Stärka immunförsvaret" },
    { icon: GiStomach, text: "Förbättra matsmältningen" },
    { icon: FiZap, text: "Balansera energinivåerna" }
  ];

  return (
    <main className="min-h-screen pt-20" style={{ 
      background: 'linear-gradient(135deg, #fffdf3 0%, #f8f5e8 50%, #fffdf3 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradient 15s ease infinite'
    }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/utbildning" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors group">
            <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Tillbaka till kurser
          </Link>
        </motion.div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto mb-16">
          {/* Course Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-end order-2 lg:order-1"
          >
            <div className="relative group">
              {/* Mobile image */}
              <div className={`block lg:hidden transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-300`}>
                <Image 
                  src="/ulrika_mobile.png" 
                  alt="Functional Basics Mobile" 
                  width={350}
                  height={350}
                  className="rounded-2xl shadow-2xl"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {/* Desktop image */}
              <div className={`hidden lg:block transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-300`}>
                <Image 
                  src="/functional_basics.png" 
                  alt="Functional Basics" 
                  width={450}
                  height={450}
                  className="rounded-2xl shadow-2xl"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse w-[350px] h-[350px] lg:w-[450px] lg:h-[450px]" />
              )}
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                Grundkurs
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center"
              >
                <FiStar className="w-4 h-4 mr-1" />
                75 Recept
              </motion.div>
            </div>
          </motion.div>

          {/* Course Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight"
            >
              Functional <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Basics</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 text-text-secondary mb-6"
            >
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <FiClock className="w-5 h-5 text-primary" />
                <span className="font-medium">6 veckor</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <FiTarget className="w-5 h-5 text-primary" />
                <span className="font-medium">Grundkurs</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <FiUsers className="w-5 h-5 text-primary" />
                <span className="font-medium">Familjevänlig</span>
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg lg:text-xl text-text-secondary mb-8 leading-relaxed"
            >
              Vill du använda maten som ditt främsta verktyg för bättre hälsa och ett längre liv? 
              Kursen Functional Basics ger dig kunskap, recept och måltidsplaner som stärker ditt immunförsvar 
              och får kropp och sinne att prestera på topp.
            </motion.p>

            {/* Price Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-6 border border-white/50 max-w-[260px] mx-auto flex flex-col items-center gap-3"
            >
              <div className="text-2xl font-bold text-primary">2,295 kr</div>
              <div className="text-sm text-gray-600">6 veckors komplett kurs</div>
              <button 
                onClick={handleAddToCart}
                className="bg-primary text-white px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition-colors w-full"
              >
                Lägg i varukorg
              </button>
              <div className="w-full border-t border-gray-200 my-2"></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiBook className="w-4 h-4 text-primary" />
                  75 Recept & måltidsplaner
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiVideo className="w-4 h-4 text-primary" />
                  Videolektioner varje vecka
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiUser className="w-4 h-4 text-primary" />
                  1-på-1 coaching
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiClock className="w-4 h-4 text-primary" />
                  Livstidsåtkomst
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { id: 'overview', label: 'Översikt' },
            { id: 'benefits', label: 'Vad du uppnår' },
            { id: 'content', label: 'Innehåll' },
            { id: 'foods', label: 'Functional Foods' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white/70 text-text-secondary hover:bg-white/90 hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 mb-16"
            >
              {/* Course Description */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-light mb-6 text-center">
                  En perfekt start för <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">bättre hälsa</span>
                </h2>
                <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                  Ulrika har skapat näringsrika och goda recept för hela familjen, och måltidsplanerna säkerställer en varierad kost med alla viktiga näringsämnen. 
                  Kursen är en perfekt start för dig som vill laga hälsosam mat från grunden, bygga goda vanor och göra functional foods och longevity till en naturlig del av din vardag.
                </p>
                
                <h3 className="text-xl font-medium mb-4">För vem?</h3>
                <p className="text-text-secondary mb-6">
                  Den här kursen är för dig som vill förbättra din hälsa steg för steg och samtidigt njuta av god och näringsrik mat – utan att det blir krångligt.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forWho.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <FiCheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <span className="text-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food Examples */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
                <h3 className="text-2xl font-light mb-6 text-center">
                  Vad för typ av <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">mat?</span>
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  I Functional Basics lagar vi mat baserad på näringsrika råvaror. Naturliga smaker kombineras med hälsosamma fetter, 
                  proteinrika ingredienser och långsamma kolhydrater för att skapa balanserade måltider.
                </p>
                <p className="text-text-secondary mb-6">
                  <strong>Du får hela 75 recept i kursen</strong> och här är några exempel på rätter du får laga:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    'Pokébowl med kyckling',
                    'Havrefrallor med morötter och aprikoser',
                    'Laxburgare med krämig grönsaksröra',
                    'Turkiska lammfärsspett med raita',
                    'Vegetarisk currygryta med panéer',
                    'Bananplättar med jordgubbar och kokos',
                    'Mandelkaka med frukt'
                  ].map((dish, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GiWheat className="w-4 h-4 text-accent" />
                      <span className="text-text-secondary">{dish}</span>
                    </div>
                  ))}
                </div>
                <p className="text-text-secondary mt-6 italic">
                  Maten är både njutbar och näringsrik – en enkel väg till bättre hälsa genom smarta val i köket!
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-light text-center mb-12">
                Vinsten med att äta enligt <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Functional Foods</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <benefit.icon className={`w-10 h-10 mb-4 ${benefit.color}`} />
                    <h3 className="text-xl font-medium text-primary mb-3">{benefit.title}</h3>
                    <p className="text-text-secondary">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
                <p className="text-text-secondary leading-relaxed">
                  Functional foods handlar om mat som inte bara mättar, utan också stärker kroppen inifrån. 
                  Vi fokuserar på råvaror som är vetenskapligt bevisade att stötta kroppen på olika sätt. 
                  Genom att inkludera dessa näringsrika livsmedel i hela familjens kost kan ni uppleva förbättringar inom alla dessa områden.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-light text-center mb-12">
                Vad får du i <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">programmet?</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {whatYouGet.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-primary mb-2">{item.title}</h3>
                        <p className="text-text-secondary">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'foods' && (
            <motion.div
              key="foods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-light text-center mb-8">
                Vad är <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Functional Foods?</span>
              </h2>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto mb-8">
                <p className="text-lg text-text-secondary mb-8 leading-relaxed text-center">
                  Functional Foods är naturliga livsmedel med specifika hälsofrämjande egenskaper. 
                  De hjälper kroppen att fungera optimalt genom att ge stöd åt olika system i kroppen.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {functionalFoodsBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <benefit.icon className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-text-secondary font-medium">{benefit.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-3xl mx-auto border border-white/50">
            <h2 className="text-2xl md:text-3xl font-light text-primary mb-4">
              Redo att börja din <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">hälsoresa?</span>
            </h2>
            <p className="text-text-secondary mb-8 text-lg leading-relaxed">
              Investera i din hälsa idag och känn skillnaden redan inom några veckor. 
              Med 75 recept, personlig coaching och livstidsåtkomst får du alla verktyg du behöver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleAddToCart}
                className="bg-primary text-white px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <FiShoppingCart className="w-5 h-5" />
                Lägg i varukorg - 2,295 kr
              </button>
              <div className="text-sm text-text-secondary">
                6 veckors komplett kurs
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 