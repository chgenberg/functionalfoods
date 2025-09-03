"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

import { GiBrain, GiStomach, GiWheat, GiHeartBeats, GiMuscleUp } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import AddToCart from '@/app/components/AddToCart';
import CourseReviews from '@/app/components/CourseReviews';
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
    name: 'Functional Energy',
    price: 2295,
    type: 'course' as const,
    image: '/Bilder_flow/gron-smoothie-med-avokado-och-hampaprotein.jpg',
    quantity: 1
  };

  const handleAddToCart = () => {
    addItem(course);
  };

  const benefits = [
    {
      icon: Battery,
      title: "Stabilt blodsocker",
      description: "Slipp energidippar och blodsockerkrascher. Få jämn energi hela dagen genom att balansera blodsockret naturligt.",
      color: "text-green-600"
    },
    {
      icon: Coffee,
      title: "Mindre sötsug",
      description: "Minska behovet av snacks och kaffe genom att ge kroppen rätt bränsle från början.",
      color: "text-yellow-600"
    },
    {
      icon: GiBrain,
      title: "Bättre fokus",
      description: "Förbättra din mentala klarhet och koncentration genom stabila energinivåer.",
      color: "text-blue-600"
    },
    {
      icon: Moon,
      title: "Förbättrad sömn",
      description: "Balanserat blodsocker ger bättre sömn och återhämtning under natten.",
      color: "text-purple-600"
    }
  ];

  const whatYouGet = [
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
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F7F1E8] via-[#F3EFE3] to-[#EDE5D8] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
          <Link href="/utbildning" className="inline-flex items-center text-gray-600 hover:text-[#014421] mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till kurser
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-[#93C560]">NY KURS</span>
                <span className="px-3 py-1 bg-[#93C560]/20 text-[#014421] rounded-full text-xs font-medium">
                  För stabilt blodsocker
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#014421] mb-6">
                Functional Energy
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                En kurs för dig som är i riskzonen för typ 2-diabetes, har prediabetes eller vill bromsa en utveckling som redan är på gång.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#93C560]" />
                  <span className="font-medium">6 veckor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#93C560]" />
                  <span className="font-medium">Personlig coaching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-[#93C560]" />
                  <span className="font-medium">85 recept</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <AddToCart 
                  product={course}
                  className="px-8 py-4 bg-[#FF7E70] text-white rounded-full font-medium hover:bg-[#FF6B5C] transition-colors shadow-lg hover:shadow-xl"
                />
                <a 
                  href="#reviews" 
                  className="px-8 py-4 bg-white text-[#014421] rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-gray-200 text-center"
                >
                  Se recensioner
                </a>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-[#014421]">150+</span> deltagare har redan fått stabila energinivåer
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.95 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/Bilder_flow/gron-smoothie-med-avokado-och-hampaprotein.jpg"
                  alt="Functional Energy - Grön smoothie med avokado"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                    <p className="text-lg font-bold text-[#014421] mb-1">2295 kr</p>
                    <p className="text-sm text-gray-600">Betalning i förskott • 6 veckors program</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#93C560]/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#FF7E70]/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-[#014421] mb-4">Välkommen till Functional Energy</h2>
            <p className="text-lg text-gray-600">Lär dig stabilisera blodsockret och få jämn energi hela dagen</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-100"
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Functional Energy Introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </motion.div>
        </div>
      </section>

      {/* Quick Benefits */}
      <section className="py-16 bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#014421] mb-4">Resultat du kan förvänta dig</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              När du lär dig äta för energi snarare än att jaga energi – kommer kroppen att svara
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 ${benefit.color}`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#014421] mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-[#014421] mb-6">Om kursen</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Välkommen till Functional Energy – en kurs för dig som vill stabilisera blodsockret och hitta en jämnare energinivå i vardagen. I den här kursen utforskar vi hur funktionell mat kan hjälpa dig att undvika blodsockersvängningar, balansera hormoner och minska trötthet.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              För dig som lever med, eller ligger i riskzonen för, typ 2-diabetes är kunskapen extra viktig. Genom att förstå hur olika råvaror påverkar blodsockret kan du göra medvetna val som faktiskt gör skillnad – både på kort och lång sikt.
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              Under sex veckor får du recept framtagna av Ulrika med fokus på låg blodsockerpåverkan, stabil energi och god smak. Du får även verktyg som måltidsplaner, inköpslistor och tips på hur du bygger en hållbar matvardag som din kropp tackar dig för.
            </p>

            <div className="bg-[#F3EFE3] rounded-2xl p-8 my-8">
              <h3 className="text-2xl font-bold text-[#014421] mb-4">Varför Functional Foods?</h3>
              <p className="text-gray-700 mb-4">
                Functional Foods är naturliga livsmedel med specifika hälsofrämjande egenskaper. Det kan till exempel vara antiinflammatoriska kryddor, fiberrika grönsaker eller fermenterade livsmedel som stärker tarmfloran. De här livsmedlen hjälper kroppen att fungera optimalt genom att:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {functionalFoodsBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <benefit.icon className="w-6 h-6 text-[#93C560] flex-shrink-0" />
                    <span className="text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-[#014421] mb-4">Vilken typ av mat ingår i kursen?</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              I Functional Energy lagar vi mat som ger kroppen långvarigt bränsle. Fokus ligger på långsamma kolhydrater, fibrer, kvalitetsfetter och proteinrika råvaror – men också på timing, måltidskomposition och smarta dryckesval.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Du får hela 85 recept i kursen och här är några exempel på rätter du får laga: Grön smoothie med avokado och hampaprotein, fröknäcke med hummus och ägg, ugnsbakad lax med grönkål och tahinidressing, kokosgröt med kanelstekta äpplen och mycket mycket mer!
            </p>

            <p className="text-gray-700 leading-relaxed">
              Allt bygger på principerna bakom Functional Foods – alltså mat som ger mervärde för kroppen och bidrar till bättre blodsockerreglering, hormonell balans, förbättrad hjärnfunktion och stabil energi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#014421] mb-4">Vad ingår i kursen?</h2>
            <p className="text-lg text-gray-600">Ett personligt konto med allt du behöver för att lyckas</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whatYouGet.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#93C560]" />
                </div>
                <h3 className="text-xl font-bold text-[#014421] mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#014421] mb-4">För vem passar kursen?</h2>
            <p className="text-lg text-gray-600">Den här kursen passar perfekt om du:</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] rounded-3xl p-8 md:p-12"
          >
            <ul className="space-y-4">
              {forWho.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-[#93C560] flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#014421] mb-4">Kursens innehåll</h2>
            <p className="text-lg text-gray-600">Strukturerat upplägg vecka för vecka</p>
          </motion.div>

          <div className="space-y-4">
            {[
              { week: "1", title: "Välkommen", items: ["Introduktion till kursen", "Sätt dina mål", "Kom igång med Functional Energy"] },
              { week: "2", title: "Frågor och svar", items: ["Ersättningsguide", "Hälsokort", "Vanliga frågor"] },
              { week: "3", title: "Om kursen", items: ["Om onlinekursen", "Om maten", "Eventuella biverkningar"] },
              { week: "4", title: "Mat & recept", items: ["Kostschema", "Recept", "Inköpslistor"] },
              { week: "5", title: "Coaching", items: ["One to one coachning", "Övning målplanering", "Coachningsfilmer", "Grupp coachning"] },
              { week: "6", title: "Kunskap & livsstil", items: ["Näringslära - protein, kolhydrater och fett", "Att äta ute", "Öka din förbränning", "Gluten", "Mag & tarmhälsa"] }
            ].map((week, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-[#93C560]">{week.week}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#014421]">{week.title}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <ul className="space-y-2 ml-16">
                  {week.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-600">• {item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
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
                product={course}
                className="px-8 py-4 bg-[#FF7E70] text-white rounded-full font-medium hover:bg-[#FF6B5C] transition-colors shadow-lg hover:shadow-xl"
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
    </main>
  );
} 