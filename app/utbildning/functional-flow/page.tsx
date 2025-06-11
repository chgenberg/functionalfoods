"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiClock, FiCheckCircle, FiArrowLeft, FiHeart, FiZap, FiShoppingCart, FiUsers, FiBook, FiStar, FiPlay, FiVideo, FiUser } from 'react-icons/fi';
import { GiBrain, GiStomach, GiWheat, GiHeartBeats } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

export default function FunctionalFlowPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { addItem } = useCart();

  const course = {
    id: 'functional-flow',
    name: 'Functional Flow',
    price: 1836,
    type: 'course' as const,
    image: '/functional_flow.png',
    quantity: 1
  };

  const handleAddToCart = () => {
    addItem(course);
  };

  const benefits = [
    {
      icon: GiStomach,
      title: "Förbättrad tarmflora",
      description: "Genom att minimera processad mat, socker och onödiga tillsatser kan tarmfloran balanseras och inflammation minskas.",
      color: "text-green-600"
    },
    {
      icon: GiBrain,
      title: "Minskad inflammation",
      description: "En kost rik på antiinflammatoriska livsmedel kan minska kroppens inflammatoriska processer och förbättra den allmänna hälsan.",
      color: "text-blue-600"
    },
    {
      icon: FiZap,
      title: "Balanserat blodsocker",
      description: "Håll blodsockret stabilt för jämnare energi genom dagen och bättre allmän hälsa.",
      color: "text-yellow-600"
    },
    {
      icon: GiHeartBeats,
      title: "Bättre matsmältning",
      description: "Fibrer och prebiotiska livsmedel stärker tarmens funktion och förbättrar matsmältningen för bättre näringsupptag.",
      color: "text-red-600"
    }
  ];

  const whatYouGet = [
    {
      icon: FiBook,
      title: "85 Recept & Måltidsplan",
      description: "Enkla, goda och näringsrika måltider för en bättre hälsa"
    },
    {
      icon: GiBrain,
      title: "Djupgående näringslära",
      description: "Förstå sambandet mellan mat, tarmhälsa och energi"
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
    "Har en orolig eller uppblåst mage",
    "Känner dig ofta trött eller energilös", 
    "Vill minska inflammation och stärka immunförsvaret",
    "Söker en hållbar väg till bättre hälsa utan krångliga dieter"
  ];

  const functionalFoodsBenefits = [
    { icon: GiHeartBeats, text: "Stödja hormonsystemet" },
    { icon: FiHeart, text: "Stärka immunförsvaret" },
    { icon: GiStomach, text: "Förbättra matsmältningen" },
    { icon: FiZap, text: "Ge jämnare energibalanser" }
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
              <div className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-300`}>
                <Image 
                  src="/functional_flow.png" 
                  alt="Functional Flow" 
                  width={450}
                  height={450}
                  className="rounded-2xl shadow-2xl"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse w-[450px] h-[450px]" />
              )}
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                -20% Rabatt
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center"
              >
                <FiStar className="w-4 h-4 mr-1" />
                85 Recept
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
              Functional <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Flow</span>
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
                <FiUsers className="w-5 h-5 text-primary" />
                <span className="font-medium">Community</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <FiPlay className="w-5 h-5 text-primary" />
                <span className="font-medium">Videolektioner</span>
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg lg:text-xl text-text-secondary mb-8 leading-relaxed"
            >
              Vill du skapa en hållbar vardag där din kropp samarbetar med dig – inte mot dig? 
              Functional Flow är en 6-veckorskurs med fokus på maghälsa, antiinflammatorisk kost och naturligt flöde i vardagen.
            </motion.p>

            {/* Price Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-6 border border-primary/10 max-w-[260px] mx-auto flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-400 line-through">2,295 kr</span>
                <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">-20%</span>
              </div>
              <div className="text-2xl font-bold text-primary">1,836 kr</div>
              <div className="text-sm text-gray-600">6 veckors komplett kurs</div>
              <button className="bg-primary text-white px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition-colors w-full">
                Lägg i varukorg
              </button>
              <div className="w-full border-t border-gray-200 my-2"></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiBook className="w-4 h-4 text-primary" />
                  85 Recept & måltidsplaner
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
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {[
            { id: 'overview', label: 'Översikt' },
            { id: 'benefits', label: 'Resultat' },
            { id: 'content', label: 'Innehåll' },
            { id: 'functional-foods', label: 'Functional Foods' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm text-text-secondary hover:bg-white hover:text-primary'
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto mb-16"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-primary/10">
                <h2 className="text-3xl font-light text-center mb-8 text-primary">
                  För vem är kursen?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {forWho.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-green-50 rounded-lg"
                    >
                      <FiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-light text-center mb-12 text-primary">
                Konkreta resultat du kan <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">se och känna</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/10 group"
                  >
                    <div className="flex items-center mb-4">
                      {benefit.icon && <benefit.icon className={`w-12 h-12 ${benefit.color} mb-2 group-hover:scale-110 transition-transform`} />}
                      <h3 className="text-xl font-bold text-primary ml-3">{benefit.title}</h3>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-light text-center mb-12 text-primary">
                Vad får du i <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">programmet?</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {whatYouGet.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/10 group"
                  >
                    <item.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'functional-foods' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-16"
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-primary/10 mb-8">
                  <h2 className="text-3xl font-light text-center mb-6 text-primary">
                    Varför <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Functional Foods?</span>
                  </h2>
                  <p className="text-lg text-text-secondary leading-relaxed text-center mb-8">
                    Functional Foods är naturliga livsmedel med specifika hälsofrämjande egenskaper. 
                    Det kan till exempel vara antiinflammatoriska kryddor, fiberrika grönsaker eller 
                    fermenterade livsmedel som stärker tarmfloran.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {functionalFoodsBenefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg"
                      >
                        <benefit.icon className="w-8 h-8 text-primary flex-shrink-0" />
                        <span className="text-text-secondary font-medium">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
                  <h3 className="text-2xl font-bold text-primary mb-4 text-center">Vilken typ av mat ingår?</h3>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    I Functional Flow lagar vi mat baserad på näringsrika råvaror. Naturliga smaker kombineras med 
                    hälsosamma fetter, proteinrika ingredienser och långsamma kolhydrater för att skapa balanserade måltider.
                  </p>
                  <div className="bg-white/80 rounded-lg p-4">
                    <p className="text-sm text-text-secondary font-medium">
                      <strong>Exempel på rätter:</strong> Linssoppa, laxgratäng med broccoli och scampi, chiapudding, 
                      fänkålssallad med grapefrukt och burrata, ugnsomelett med keso och bär och mycket mycket mer!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto border border-primary/20">
            <h2 className="text-3xl font-light text-primary mb-4">Redo att börja din resa?</h2>
            <p className="text-lg text-text-secondary mb-6 leading-relaxed">
              Magen är som en kompass för hur resten av kroppen mår, och när den är i balans 
              känner du ett lugn och har en energi som sprider sig i kroppen.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="bg-primary text-white px-10 py-4 rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium shadow-lg inline-flex items-center gap-3"
            >
              <FiShoppingCart className="w-5 h-5" />
              Investera i din hälsa - 1,836 kr
            </motion.button>
            <p className="text-sm text-text-secondary mt-4">
              💚 Ge din mage kärlek genom mat som läker och en livsstil som ger lugn
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 