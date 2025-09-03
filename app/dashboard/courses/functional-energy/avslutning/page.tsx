"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Star, Heart, ArrowRight, Download, Share2, BookOpen, Target, Zap, Battery, Coffee, Moon } from 'lucide-react';

export default function FunctionalEnergyAvslutningPage() {
  const achievements = [
    { icon: Battery, title: "Energistarten", description: "Genomförde din första vecka med stabilt blodsocker" },
    { icon: Coffee, title: "Sockerfri", description: "Minskade ditt sockerberoende och sötsug" },
    { icon: Zap, title: "Stabil energi", description: "Höll energin uppe en hel vecka utan dippar" },
    { icon: Moon, title: "Bättre sömn", description: "Förbättrade din sömnkvalitet genom balanserat blodsocker" },
    { icon: Trophy, title: "Kursmästare", description: "Slutförde hela 6-veckors programmet" }
  ];

  const benefits = [
    "Stabilare blodsocker utan stora svängningar",
    "Jämnare energi hela dagen utan eftermiddagsdippar",
    "Minskat sötsug och beroende av snacks",
    "Förbättrad sömn och återhämtning",
    "Större kunskap om functional foods",
    "Hållbara matvanor för framtiden"
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F1E8] via-[#F3EFE3] to-[#EDE5D8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#93C560] to-[#7FBA3D] rounded-full flex items-center justify-center shadow-2xl">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-[#014421] mb-6">
              Grattis till en ny livsstil med Functional Foods!
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Du har slutfört din 6-veckors resa mot stabilt blodsocker och jämn energi. 
              Det är dags att fira dina framsteg!
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                <span className="text-[#014421] font-bold">6 veckor</span>
                <span className="text-gray-600 ml-2">genomförda</span>
              </div>
              <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                <span className="text-[#014421] font-bold">85 recept</span>
                <span className="text-gray-600 ml-2">upptäckta</span>
              </div>
              <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                <span className="text-[#014421] font-bold">42 dagar</span>
                <span className="text-gray-600 ml-2">av hälsosam mat</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Congratulations Message */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-xl mb-6">
                Nu är du i mål och har under 6 veckor gett din kropp mervärdesmat och lärt dig laga goda functional foods-rätter som stödjer din hälsa. Du har gjort stora framsteg och förändrat din hälsa på många sätt, särskilt när det gäller att hantera blodsockernivåerna.
              </p>
              
              <p className="mb-6">
                Efter att ha följt veckornas kostscheman och inköpslistor, är det dags att ta nästa steg och börja planera din kost på egen hand. Du har fått kunskap om hur Functional Foods fungerar och vilka råvaror som bör ingå dagligen i din kost för att hålla blodsockret stabilt och främja en god hälsa.
              </p>
              
              <p className="mb-6">
                Jag hoppas också att du känner glädje i köket och tycker att det är roligt att laga mat på ett hälsosamt sätt som verkligen stödjer din hälsa.
              </p>
              
              <div className="bg-[#F3EFE3] rounded-2xl p-6 my-8 border-l-4 border-[#93C560]">
                <p className="text-[#014421] font-medium text-lg">
                  💡 Det viktigaste för att fortsätta med Functional Foods som livsstil är de positiva resultaten du upplever. Ta en stund och reflektera över de förändringar du känner både kroppsligt och mentalt. Du mår med stor sannolikhet bättre och det är något du verkligen vill fortsätta att må – för både din hälsa och ditt välmående framöver!
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Achievements Grid */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#014421] mb-4">Dina prestationer</h2>
            <p className="text-lg text-gray-600">Du har uppnått dessa milstolpar under din resa</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#93C560] to-[#7FBA3D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#014421] mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <div className="mt-4">
                  <Star className="w-5 h-5 text-yellow-400 mx-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Reflection */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#014421] to-[#116530] rounded-3xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Reflektera över dina förändringar</h2>
            <p className="text-lg mb-8 text-center opacity-90">
              Ta en stund att tänka på alla positiva förändringar du upplevt:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-[#93C560] rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Next Steps */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold text-[#014421] mb-8 text-center">Fortsätt din hälsoresa</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#93C560]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-[#93C560]" />
                </div>
                <h3 className="text-xl font-bold text-[#014421] mb-3">Fortsätt lära</h3>
                <p className="text-gray-600 mb-4">Utforska fler recept och kunskapsartiklar i vår kunskapsbank</p>
                <Link 
                  href="/kunskapsbank"
                  className="text-[#93C560] hover:text-[#014421] font-medium inline-flex items-center gap-2"
                >
                  Utforska mer <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#93C560]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-[#93C560]" />
                </div>
                <h3 className="text-xl font-bold text-[#014421] mb-3">Sätt nya mål</h3>
                <p className="text-gray-600 mb-4">Fortsätt utvecklas med nya hälsomål och utmaningar</p>
                <Link 
                  href="/dashboard/courses/functional-energy/goals"
                  className="text-[#93C560] hover:text-[#014421] font-medium inline-flex items-center gap-2"
                >
                  Mina mål <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#93C560]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-[#93C560]" />
                </div>
                <h3 className="text-xl font-bold text-[#014421] mb-3">Dela din resa</h3>
                <p className="text-gray-600 mb-4">Inspirera andra genom att dela din framgångshistoria</p>
                <Link 
                  href="/dashboard/courses/functional-energy/community"
                  className="text-[#93C560] hover:text-[#014421] font-medium inline-flex items-center gap-2"
                >
                  Community <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#93C560] to-[#7FBA3D] rounded-3xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Tack för att du genomförde Functional Energy!</h2>
            <p className="text-xl mb-8 opacity-90">
              Du har nu verktygen för ett liv med stabilt blodsocker och jämn energi
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/courses"
                className="bg-white text-[#014421] px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Utforska fler kurser
              </Link>
              <Link 
                href="/dashboard"
                className="bg-[#014421] text-white px-8 py-4 rounded-full font-medium hover:bg-[#116530] transition-colors inline-flex items-center justify-center gap-2"
              >
                Tillbaka till dashboard
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
} 