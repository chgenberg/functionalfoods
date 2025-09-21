"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

import { GiBrain, GiStomach, GiWheat, GiHeartBeats, GiMuscleUp } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import AddToCart from '@/app/components/AddToCart';
import CourseReviews from '@/app/components/CourseReviews';
import HealthDisclaimer from '@/app/components/HealthDisclaimer';
import { Clock, CheckCircle, ArrowLeft, Heart, Zap, ShoppingCart, Users, Book, Star, Play, Target, Video, User, ChevronRight, Battery, Coffee, Moon } from 'lucide-react';

export default function FunctionalEnergyPage() {
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
    id: 'functional-energy',
    name: 'Functional Insulin balance/Energy',
    price: 2295,
    type: 'course' as const,
    image: '/Kurser_bilder/Functional_insulin balance.jpg',
    quantity: 1
  };

  const handleAddToCart = () => {
    addItem(course);
  };

  const benefits = [
    {
      icon: Battery,
      title: "Stabilt blodsocker",
      description: "Slipp energidippar och blodsockerkrascher. Få jämn energi hela dagen genom att balansera blodsockret naturligt."
    },
    {
      icon: Coffee,
      title: "Mindre sötsug", 
      description: "Minska behovet av snacks och kaffe genom att ge kroppen rätt bränsle från början."
    },
    {
      icon: GiBrain,
      title: "Bättre fokus",
      description: "Förbättra din mentala klarhet och koncentration genom stabila energinivåer."
    },
    {
      icon: Moon,
      title: "Förbättrad sömn",
      description: "Balanserat blodsocker ger bättre sömn och återhämtning under natten."
    }
  ];

  const includes = [
    {
      icon: Book,
      title: "85 Recept & Måltidsplan",
      description: "Blodsockerstabila recept med fokus på långsam energi"
    },
    {
      icon: GiBrain,
      title: "Djupgående näringslära",
      description: "Lär dig hur mat påverkar blodsocker och energinivåer"
    },
    {
      icon: ShoppingCart,
      title: "Råvaruguide & inköpslista",
      description: "Handla smart för stabilare blodsocker"
    },
    {
      icon: CheckCircle,
      title: "Steg-för-steg-planering",
      description: "Planera måltider för jämn energi hela dagen"
    },
    {
      icon: Play,
      title: "Videolektioner varje vecka",
      description: "Praktiska tips för bättre energibalans"
    },
    {
      icon: Users,
      title: "One-to-one coachning",
      description: "Personlig coaching med Ulrika för dina behov"
    }
  ];

  const forWho = [
    "Upplever blodsockerdippar och energikrascher under dagen",
    "Vill minska sötsug, eftermiddagskaos och humörsvängningar", 
    "Vill lära dig äta för hållbar energi – inte quick fixes",
    "Söker en kost som ger skärpa, mättnad och bättre ork",
    "Vill förstå hur du kan balansera din kost för bättre mental och fysisk prestation"
  ];

  const functionalFoodsBenefits = [
    { icon: GiHeartBeats, text: "Stödja hormonsystemet" },
    { icon: Heart, text: "Stärka immunförsvaret" },
    { icon: GiStomach, text: "Förbättra matsmältningen" },
    { icon: Zap, text: "Ge jämnare energibalanser" }
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
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
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
                  src="/Kurser_bilder/Functional_insulin balance.jpg" 
                  alt="Functional Energy - Havregrynsgrön med apelsin och kokos" 
                  width={450}
                  height={450}
                  className="rounded-2xl shadow-2xl object-cover"
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
                className="absolute -top-4 -right-4 bg-[#93C560] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                För stabilt blodsocker
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center"
              >
                <Star className="w-4 h-4 mr-1" />
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
              Functional <span className="bg-gradient-to-r from-[#93C560] to-[#7FB547] bg-clip-text text-transparent font-bold">Insulin balance/Energy</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 text-text-secondary mb-6"
            >
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Clock className="w-5 h-5 text-[#93C560]" />
                <span className="font-medium">6 veckor</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Users className="w-5 h-5 text-[#93C560]" />
                <span className="font-medium">Personlig coaching</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Play className="w-5 h-5 text-[#93C560]" />
                <span className="font-medium">Videolektioner</span>
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg lg:text-xl text-text-secondary mb-8 leading-relaxed"
            >
              Lär dig stabilisera blodsockret och få jämn energi hela dagen. 
              Perfekt för dig som är i riskzonen för typ 2-diabetes, har prediabetes eller vill bromsa en utveckling som redan är på gång.
            </motion.p>

            {/* Price Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-6 border border-[#93C560]/20 max-w-[260px] mx-auto flex flex-col items-center gap-3"
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
                  <Book className="w-4 h-4 text-[#93C560]" />
                  85 Recept & måltidsplaner
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Video className="w-4 h-4 text-[#93C560]" />
                  Videolektioner varje vecka
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-[#93C560]" />
                  1-på-1 coaching
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-[#93C560]" />
                  1 års åtkomst
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Video Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-[#014421] mb-4">Upptäck Functional Insulin balance/Energy</h2>
              <p className="text-lg text-gray-600">Se hur kursen hjälper dig få stabilt blodsocker och jämn energi</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-full inline-flex">
                {['overview', 'results', 'content', 'functional'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === tab 
                        ? 'bg-white text-primary shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'overview' && 'Översikt'}
                    {tab === 'results' && 'Resultat'}
                    {tab === 'content' && 'Innehåll'}
                    {tab === 'functional' && 'Functional Foods'}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-100"
                >
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Functional Insulin balance/Energy - Kursöversikt"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </motion.div>
              )}

              {activeTab === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h3 className="text-2xl font-bold text-[#014421] mb-6">Vad du kommer uppnå</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-6 h-6 text-[#93C560]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#014421] mb-1">{benefit.title}</h4>
                          <p className="text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h3 className="text-2xl font-bold text-[#014421] mb-6">Vad ingår i kursen?</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {includes.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#93C560]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-[#93C560]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#014421] mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'functional' && (
                <motion.div
                  key="functional"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h3 className="text-2xl font-bold text-[#014421] mb-6">Varför Functional Foods?</h3>
                  <p className="text-gray-700 mb-6">
                    Functional Foods är naturliga livsmedel med specifika hälsofrämjande egenskaper. 
                    I denna kurs lär du dig hur dessa livsmedel kan stabilisera ditt blodsocker och ge dig jämn energi hela dagen.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {functionalFoodsBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 bg-[#F3EFE3] rounded-lg p-4">
                        <benefit.icon className="w-6 h-6 text-[#93C560] flex-shrink-0" />
                        <span className="text-gray-700">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* For Who Section - Compact Version */}
        <section className="py-16 bg-[#F3EFE3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-[#014421] mb-4">För vem är kursen?</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6"
            >
              {forWho.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-white rounded-lg p-4"
                >
                  <CheckCircle className="w-5 h-5 text-[#93C560] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-[#F3EFE3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-[#014421] mb-4">Vanliga frågor</h2>
            </motion.div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "Passar kursen för mig som har diabetes?",
                  a: "Kursen är utformad för att hjälpa till med blodsockerkontroll, men ersätter inte medicinsk behandling. Konsultera alltid din läkare."
                },
                {
                  q: "Vilken typ av mat lagar vi?",
                  a: "Mat som ger långvarigt bränsle med fokus på långsamma kolhydrater, fibrer, kvalitetsfetter och proteinrika råvaror."
                },
                {
                  q: "Hur mycket tid behöver jag lägga per vecka?",
                  a: "Räkna med 3-4 timmar för matlagning och planering, plus tid för videolektioner."
                },
                {
                  q: "Får jag tillgång till allt material direkt?",
                  a: "Ja, du får direkt tillgång till hela kursen och kan gå i din egen takt."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h3 className="font-bold text-[#014421] mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Health Disclaimer */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <HealthDisclaimer variant="banner" />
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-16">
          <CourseReviews courseId="functional-energy" limit={6} />
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#014421] to-[#116530]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Redo att ta kontroll över din energi?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Börja din resa mot stabilt blodsocker och jämn energi idag. Din kropp kommer att tacka dig!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AddToCart 
                  id={course.id}
                  name={course.name}
                  price={course.price}
                  type={course.type}
                  image={course.image}
                />
                <Link 
                  href="/utbildning" 
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/20 transition-colors border border-white/30"
                >
                  Se alla kurser
                </Link>
              </div>

              <p className="text-white/70 text-sm mt-8">
                Tillgång till kursen i 1 år • 30 dagars öppet köp • Personlig support
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
} 