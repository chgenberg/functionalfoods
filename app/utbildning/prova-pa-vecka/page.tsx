"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import AddToCart from '@/app/components/AddToCart';
import HealthDisclaimer from '@/app/components/HealthDisclaimer';
import FaqAccordion from '@/app/components/FaqAccordion';
import { Clock, CheckCircle, ArrowLeft, Heart, Zap, ShoppingCart, Users, Book, Star, Play, Target, Video, User, ChevronRight, Calendar, Utensils, FileText } from 'lucide-react';
import { formatPrice } from '@/app/lib/utils';
import { trackAddToCart, trackViewContent } from '@/app/lib/analytics';

export default function ProvaPaVeckaPage() {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCart();

  // Fire ViewContent once
  useEffect(() => {
    trackViewContent({ id: 'prova-pa-vecka', name: 'Prova på vecka med Functional Foods!', price: 0 });
  }, []);

  const course = {
    id: 'prova-pa-vecka',
    name: 'Prova på vecka med Functional Foods!',
    price: 0,
    type: 'course' as const,
    image: '/prova-pa/prova-pa.png',
    quantity: 1
  };

  const handleStartCourse = () => {
    addItem(course);
    try { trackAddToCart({ id: course.id, name: course.name, price: course.price, quantity: 1 }, 'SEK'); } catch {}
    router.push('/cart');
  };

  const objectives = [
    'Minska sötsuget',
    'Få ökad energi',
    'Grundläggande kunskap inom functional foods',
    'Förstå hur maten påverkar din kropp',
    'Lära dig laga snabb och näringsrik mat'
  ];

  const includes = [
    {
      icon: Calendar,
      title: '7 dagars kostschema',
      description: 'Kompletta måltidsplaner för hela veckan'
    },
    {
      icon: Utensils,
      title: '15 näringsrika recept',
      description: 'Smakrika och lättlagade rätter'
    },
    {
      icon: ShoppingCart,
      title: 'Färdig inköpslista',
      description: 'Allt du behöver handla för veckan'
    },
    {
      icon: Book,
      title: '3 kunskapsdokument',
      description: 'Lär dig grunderna i functional foods'
    },
    {
      icon: Users,
      title: 'Facebook-community',
      description: 'Daglig kontakt med Team Ulrika'
    },
    {
      icon: Video,
      title: 'Introduktionsvideo',
      description: 'Välkomstvideo från Ulrika'
    }
  ];

  const forWho = [
    'Vill lära dig mer om antiinflammatorisk kost och longevity',
    'Vill förbättra din hälsa steg för steg utan att det blir krångligt',
    'Vill bli av med ojämnt blodsocker och känna dig mätt efter måltider',
    'Vill ha mer energi och känna dig piggare hela dagen',
    'Vill skapa bättre matvanor på ett hållbart sätt'
  ];

  const sampleRecipes = [
    'Bananpannkaka med keso, blåbär och mango',
    'Ugnsbakad blomkål med ratatouille',
    'Blodapelsin med vit chokladkräm',
    'Kalkonbolognese med morotspasta',
    'Fisktaco med mangosalsa och sesamsås'
  ];

  const faqs = [
    {
      question: 'Kostar kursen verkligen ingenting?',
      answer: 'Ja! Prova på-veckan är helt gratis. Vi vill ge dig möjligheten att uppleva hur functional foods kan göra skillnad för din hälsa innan du bestämmer dig för en längre kurs.'
    },
    {
      question: 'Vad behöver jag för att börja?',
      answer: 'Du behöver bara ett konto på vår hemsida. När du registrerar dig får du tillgång till kostschemat, recepten, inköpslistan och kunskapsdokumenten direkt.'
    },
    {
      question: 'Är recepten svåra att laga?',
      answer: 'Nej, alla recept är designade för att vara enkla och snabba att laga. De flesta tar max 30-45 minuter och kräver inga avancerade matlagningstekniker.'
    },
    {
      question: 'Passar kursen för vegetarianer?',
      answer: 'Den här prova på-veckan innehåller recept med kött och fisk. Kontakta oss om du vill ha tips på vegetariska alternativ.'
    },
    {
      question: 'Vad händer efter prova på-veckan?',
      answer: 'Efter veckan kan du välja att fortsätta med en av våra längre kurser som Functional Basics (6 veckor) eller Functional Energy för ännu bättre resultat.'
    }
  ];

  return (
    <main className="min-h-screen pt-20" style={{ 
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e8f5e9 100%)'
    }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/utbildning" className="inline-flex items-center gap-2 text-[#014421] hover:text-[#116530] font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till kurser
          </Link>
        </motion.div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                src="/prova-pa/prova-pa.png"
                alt="Prova på vecka med Functional Foods"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
                onLoad={() => setImageLoaded(true)}
              />
              {/* Free Badge */}
              <div className="absolute top-6 right-6 bg-[#014421] text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                GRATIS!
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#014421]/10 text-[#014421] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              7 dagars gratis prova på-kurs
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#014421] mb-6 leading-tight">
              Prova på vecka med Functional Foods!
            </h1>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              En prova-på-kurs med ett urval av functional foods-recept som ger dig en stabil och inspirerande start. Du får grunderna i hur du enkelt kommer igång och lär dig hur mervärdesmat påverkar kroppen – du kommer att märka skillnad!
            </p>

            {/* Price & CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-4xl font-bold text-[#014421]">0 kr</span>
                  <span className="text-gray-500 ml-2">Helt gratis</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleStartCourse}
                className="w-full bg-[#014421] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#116530] transition-colors shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Starta gratis nu
              </motion.button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Ingen betalning krävs • Direkt tillgång
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <Calendar className="w-6 h-6 mx-auto text-[#014421] mb-2" />
                <span className="text-sm font-medium text-gray-700">7 dagar</span>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <Utensils className="w-6 h-6 mx-auto text-[#014421] mb-2" />
                <span className="text-sm font-medium text-gray-700">15 recept</span>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <Users className="w-6 h-6 mx-auto text-[#014421] mb-2" />
                <span className="text-sm font-medium text-gray-700">Community</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* What You'll Achieve */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#014421] text-center mb-12">
            Vad du uppnår efter veckan
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {objectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg text-center"
              >
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-gray-800">{objective}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* What's Included */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#014421] text-center mb-12">
            Det här ingår i kursen
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {includes.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="w-12 h-12 bg-[#014421]/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#014421]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* For Who */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-[#014421] mb-8">
              För dig som...
            </h2>
            <div className="space-y-4">
              {forWho.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-lg text-gray-700">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Sample Recipes */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#014421] text-center mb-12">
            Exempel på rätter i kursen
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {sampleRecipes.map((recipe, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-lg text-center"
              >
                <Utensils className="w-6 h-6 text-[#014421] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">{recipe}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Community Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-[#014421] rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Kunskap, coachning & community
                </h2>
                <p className="text-white/90 leading-relaxed mb-6">
                  Under prova på-veckan får du praktisk kunskap om Functional Foods. Du guidas steg för steg genom färdiga måltider och recept som gör det lätt att lyckas i vardagen.
                </p>
                <p className="text-white/90 leading-relaxed">
                  Via den slutna Facebookgruppen får du daglig coachning, möjlighet att ställa frågor och personlig stöttning från Team Ulrika. Communityt ger motivation, inspiration och igenkänning – att göra resan tillsammans gör det både enklare och roligare.
                </p>
              </div>
              <div className="flex justify-center">
                <a
                  href="https://www.facebook.com/groups/provapavecka/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-[#014421] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-6 h-6" />
                  Gå med i Facebook-gruppen
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#014421] text-center mb-12">
            Vanliga frågor
          </h2>
          <div className="max-w-3xl mx-auto">
            <FaqAccordion faqs={faqs} />
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#014421] mb-6">
              Redo att börja din resa?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Prova på functional foods helt gratis i en vecka och upplev själv hur maten kan göra skillnad för din hälsa och energi.
            </p>
            <motion.button
              onClick={handleStartCourse}
              className="bg-[#014421] text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-[#116530] transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Starta gratis nu – 0 kr
            </motion.button>
          </div>
        </motion.section>

        {/* Health Disclaimer */}
        <div className="mt-16">
          <HealthDisclaimer />
        </div>
      </div>
    </main>
  );
}
