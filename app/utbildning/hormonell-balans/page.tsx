"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { GiBrain, GiStomach, GiWheat, GiHeartBeats } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import AddToCart from '@/app/components/AddToCart';
import CourseReviews from '@/app/components/CourseReviews';
import HealthDisclaimer from '@/app/components/HealthDisclaimer';
import FaqAccordion from '@/app/components/FaqAccordion';
import { Clock, CheckCircle, ArrowLeft, Heart, Zap, ShoppingCart, Users, Book, Star, Play, Target, Video, User } from 'lucide-react';
import { formatPrice } from '@/app/lib/utils';
import { trackAddToCart, trackViewContent } from '@/app/lib/analytics';

export default function HormonellBalansPage() {
  const router = useRouter();
  const [coursePrice, setCoursePrice] = useState<number | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);

  // Fetch actual course price from database
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/admin/functional-courses', {
          credentials: 'include'
        });
        if (response.ok) {
          const courses = await response.json();
          const hormone = courses.find((c: any) => c.id === 'functional-hormone' || c.id === 'hormonell-balans');
          if (hormone) {
            // Calculate prices with VAT
            const basePriceIncl = hormone.basePrice ? Math.round(hormone.basePrice * 1.25) : null;
            const salePriceIncl = hormone.salePrice ? Math.round(hormone.salePrice * 1.25) : null;
            
            // Set original price (basePrice)
            setOriginalPrice(basePriceIncl);
            
            // Use salePrice if available, otherwise basePrice or price
            const activePriceIncl = salePriceIncl ?? basePriceIncl ?? Math.round(hormone.price * 1.25);
            setCoursePrice(activePriceIncl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch course price:', error);
        // Fallback to hardcoded prices
        setCoursePrice(995);
        setOriginalPrice(2295);
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrice();
  }, []);

  // Fire ViewContent once when price is available (server fallback handles blocked clients)
  useEffect(() => {
    if (!coursePrice) return; // Wait for price to load
    trackViewContent({ id: 'hormonell-balans', name: 'Hormonell Balans', price: coursePrice });
  }, [coursePrice]);
  
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

  // Use fetched price or fallback
  const VAT_RATE = 0.25;
  const displayPriceIncl = coursePrice ?? 995; // Campaign price
  const displayOriginalPriceIncl = originalPrice ?? 2295; // Original price
  const displayPriceExcl = Math.round((displayPriceIncl / (1 + VAT_RATE)) * 100) / 100;
  const hasDiscount = originalPrice && coursePrice && originalPrice > coursePrice;

  const course = {
    id: 'functional-hormone',
    name: 'Hormonell Balans',
    price: displayPriceExcl, // Pris exkl. moms
    type: 'course' as const,
    image: '/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif',
    quantity: 1
  };

  const handleAddToCart = () => {
    addItem(course);
    try { trackAddToCart({ id: course.id, name: course.name, price: course.price, quantity: 1 }, 'SEK'); } catch {}
    router.push('/cart');
  };

  const benefits = [
    {
      icon: GiHeartBeats,
      title: "Hormonell balans",
      description: "Rätt kost stödjer kroppens hormonproduktion och hjälper dig återfå balans på cellnivå.",
      color: "text-purple-600"
    },
    {
      icon: Zap,
      title: "Mildra PMS och klimakteriebesvär",
      description: "Genom antiinflammatorisk kost och rätt näringsämnen kan symptom minskas betydligt.",
      color: "text-yellow-600"
    },
    {
      icon: GiBrain,
      title: "Bättre humör och energi",
      description: "Näringsrik mat påverkar hjärnans funktion positivt och ger mer stabil energi.",
      color: "text-blue-600"
    },
    {
      icon: Heart,
      title: "Förebygg inflammationer",
      description: "Rätt kost kan minska inflammationer som påverkar hormonbalansen negativt.",
      color: "text-red-600"
    },
    {
      icon: Users,
      title: "Gruppstöd och coaching",
      description: "Få stöd och vägledning från Functional Foods teamet under hela kursen.",
      color: "text-green-600"
    }
  ];

  const whatYouGet = [
    {
      icon: Book,
      title: "72 Recept & Måltidsplan",
      description: "Antiinflammatoriska, näringsrika måltider för hormonell balans"
    },
    {
      icon: GiBrain,
      title: "Kunskap om hormoner",
      description: "Lär dig om de 6 viktigaste faktorerna för hormonell balans"
    },
    {
      icon: ShoppingCart,
      title: "Råvaruguide & inköpslista",
      description: "Smarta inköp för att fylla köket med rätt mat"
    },
    {
      icon: CheckCircle,
      title: "Steg-för-steg-planering",
      description: "Lär dig vilka livsmedel som blockerar och rubbar hormonbalansen"
    },
    {
      icon: Play,
      title: "Videolektioner varje vecka",
      description: "Lättillgängligt och inspirerande innehåll"
    },
    {
      icon: Users,
      title: "Coaching & stöd",
      description: "Personlig coaching med Ulrika och teamet under hela kursen"
    }
  ];

  const forWho = [
    "Känner dig ofta trött, nedstämd och att känslorna snurrar runt inombords",
    "Upplever hormonella besvär vid PMS, förklimakteriet eller klimakteriet", 
    "Vill lära dig vilken mat som stödjer din hormonproduktion naturligt",
    "Vill förebygga och påverka din hormonella balans positivt"
  ];

  const functionalFoodsBenefits = [
    { icon: GiHeartBeats, text: "Stöd för hormonsystemet" },
    { icon: Heart, text: "Minska inflammationer" },
    { icon: GiStomach, text: "Förbättra matsmältningen" },
    { icon: Zap, text: "Balansera energinivåerna" }
  ];

  return (
    <main className="min-h-screen pt-20" style={{ 
                      background: 'var(--background-secondary)'
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
              {/* Mobile image */}
              <div className={`block lg:hidden transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-300`}>
                <Image 
                  src="/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif" 
                  alt="Hormonell Balans" 
                  width={350}
                  height={350}
                  className="rounded-2xl shadow-2xl object-cover"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {/* Desktop image */}
              <div className={`hidden lg:block transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-300`}>
                <Image 
                  src="/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif" 
                  alt="Hormonell Balans" 
                  width={450}
                  height={450}
                  className="rounded-2xl shadow-2xl object-cover"
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
                className="absolute -top-4 -right-4 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                Hormonkurs
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center"
              >
                <Star className="w-4 h-4 mr-1" />
                72 Recept
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
              Hormonell <span className="text-accent font-bold">Balans</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 text-text-secondary mb-6"
            >
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">6 veckor</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-medium">Hormonkurs</span>
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg lg:text-xl text-text-secondary mb-8 leading-relaxed"
            >
              För dig som vill få koll på dina hormoner! Känner du dig ofta trött, nedstämd och att känslorna snurrar runt inombords? Du är inte ensam! Ungefär 8 av 10 kvinnor upplever olika typer av hormonella besvär vid PMS, i förklimakteriet eller i klimakteriet. Men det finns lösningar för att må bättre – med rätt kost och coachning kan symptomen minskas!
            </motion.p>

            {/* Price Box */}
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 max-w-[280px] flex flex-col items-center gap-3"
              >
                <div className="text-3xl font-bold" style={{ color: '#E7345D' }}>{formatPrice(displayPriceIncl)} kr</div>
                {hasDiscount && (
                  <div className="text-sm text-gray-500 line-through">Ord. pris {formatPrice(displayOriginalPriceIncl)} kr</div>
                )}
                <div className="text-xs text-gray-500">(inkl. 25% moms)</div>
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
                    <Book className="w-4 h-4 text-primary" />
                    72 Recept & måltidsplaner
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-primary" />
                    Coaching med Ulrika + team
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-primary" />
                    1 års åtkomst
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Course Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16 max-w-4xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-light mb-6 text-center">
              Se en förhandstitt på <span className="text-accent font-bold">kursen</span>
            </h2>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src="https://player.vimeo.com/video/1131209106"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-center text-text-secondary mt-4 text-sm">
              Få en känsla för kursen och se hur Ulrika guidar dig genom varje vecka
            </p>
          </div>
        </motion.div>

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
                  För dig som vill få koll på <span className="text-accent font-bold">dina hormoner</span>
                </h2>
                <div className="prose prose-lg max-w-none text-text-secondary mb-6 leading-relaxed">
                  <p className="mb-4">
                    Känner du dig ofta trött, nedstämd och att känslorna snurrar runt inombords? Du är inte ensam! Ungefär 8 av 10 kvinnor upplever olika typer av hormonella besvär vid PMS, i förklimakteriet eller i klimakteriet. Men det finns lösningar för att må bättre – med rätt kost och coachning kan symptomen minskas! Ulrika har skapat en unik kurs som inte bara adresserar dina bekymmer, utan också ger dig verktygen för att återta kontrollen över ditt liv och komma i hormonell balans!
                  </p>
                  
                  <h3 className="text-xl font-medium mb-4 mt-6">Förebygga och påverka</h3>
                  <p className="mb-4">
                    Hormonell Balans är nödvändigt för att du ska må bra och kunna förebygga sjukdomar, – speciellt i 35-55 årsåldern, då hormonnivåerna förändras, och du blir mer lättpåverkad av både fel mat och stress. Vi har samlat ett urval av studier och forskning som stödjer innehållet i Ulrikas kurser (du hittar kunskapsbanken i menyn) för dig som vill fördjupa dig mer. Kursen bygger på principerna inom Functional Foods – näring som påverkar kroppens funktioner positivt och hjälper dig återfå balans på cellnivå.
                  </p>
                  
                  <p className="mb-4">
                    Att kosten och kaloriintag är avgörande som flertalet studier visar är ingen nyhet. Vad som däremot är viktigt att lyfta fram är HUR stor påverkan kosten faktiskt har på vår hälsa. Hälsa är ju så mycket mer än vikt och även om kosten absolut är avgörande när man vill göra en viktnedgång så kan den även påverka dig som har värk och inflammationer i kroppen, lider av mag- och tarmproblem, klimakteriebesvär eller andra hormonella problem.
                  </p>
                  
                  <p className="mb-4">
                    Maten du äter påverkar mycket i kroppen, din hormonella produktion, hjärnans funktion, ditt humör och givetvis din hälsa. Om din kost inte innehåller rätt näringsämnen kan din kropp inte producera hormoner på rätt sätt, och inte heller upprätthålla hormonbalansen. Det kommer du märka av genom tex försämrad sömn och irritation. Genom Functional Foods lär du dig hur du med näringsrika råvaror, rätt kombinationer av fett, protein och kolhydrater samt antiinflammatoriska livsmedel kan stödja hormonproduktionen naturligt.
                  </p>
                  
                  <p className="mb-4">
                    Med rätt kost kan du dock påverka din hormonella balans positivt och mildra besvären vid PMS, i förklimakteriet och i klimakteriet.
                  </p>
                </div>
                
                <h3 className="text-xl font-medium mb-4">För vem?</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {forWho.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <span className="text-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food Examples */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
                <h3 className="text-2xl font-light mb-6 text-center">
                  Kost och <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Kunskap</span>
                </h3>
                <div className="prose prose-lg max-w-none text-text-secondary mb-6 leading-relaxed">
                  <p className="mb-4">
                    Hormonell Balans innehåller hälsosam mat som bygger på antiinflammatorisk kost där tyngden ligger på mat, som i sin tur stödjer kroppens hormonella balans. Kursen innehåller inget gluten, socker och det är minimalt med komjölksprodukter. Det är en varierad kost med mycket grönsaker, naturligt protein och bra fetter.
                  </p>
                  <p className="mb-4 font-medium">
                    Här är några rätter som finns med:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                      'Lövbiff teriyaki med nudelsallad',
                      'Kycklingbiffar med mangosalsa',
                      'Torskgryta med rotfrukter och curry',
                      'Yoghurt med kokosgranola och mango',
                      'Tomatsoppa med kanel och ingefära',
                      'Persisk köttgryta',
                      'Bananpannkaka med frukt och bär',
                      'Skinkpaj med broccoli och cheddar'
                    ].map((dish, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <GiWheat className="w-4 h-4 text-accent" />
                        <span className="text-text-secondary">{dish}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mb-4 mt-6">
                    I kursen får du lära dig vilken mat som blockerar och rubbar din hormonella balans, så du vet vad du bör undvika. Du får även lära dig mer om hormoner och deras funktioner samt vad de 6 viktigaste faktorerna är för att komma i hormonell balans.
                  </p>
                </div>
              </div>

              {/* Coachning Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
                <h3 className="text-2xl font-light mb-6 text-center">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Coachning</span>
                </h3>
                <div className="prose prose-lg max-w-none text-text-secondary mb-6 leading-relaxed">
                  <p className="mb-4">
                    Den slutna gruppen är en av framgångsfaktorerna för att lyckas med genomförandet av kursen och att hjälpa till att nå dina mål. Du får möjlighet att både ge och få inspiration, tips och pepp under hela kursen. Functional foods teamet coachar, stöttar dig, ger tips, svarar på frågor och guidar dig under hela kursperioden.
                  </p>
                </div>
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
                  Genom att inkludera dessa näringsrika livsmedel i din kost kan du uppleva förbättringar inom alla dessa områden.
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
        <div className="bg-primary rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Redo att börja din hälsoresa?</h3>
            <p className="text-lg mb-6 text-white/90">
              Få tillgång till hela kursen och börja din transformation redan idag
            </p>
            <div className="flex justify-center">
              <AddToCart 
                id="functional-hormone"
                name="Hormonell Balans"
                price={course.price}
                type="course"
                image={course.image}
              />
            </div>
          </div>
      </div>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Vanliga frågor</h2>
          <FaqAccordion className="max-w-3xl mx-auto" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Health Disclaimer */}
        <HealthDisclaimer variant="banner" />
        
        <CourseReviews courseId="functional-hormone" />
      </div>
    </main>
  );
}

