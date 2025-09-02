"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail } from 'lucide-react';
import { useT } from "@/app/lib/i18n/LanguageProvider";

export default function OmOssPage() {
  const t = useT();

  return (
    <main className="min-h-screen bg-[#F3EFE3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-[#014421] hover:text-[#93C560] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till förstasidan
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#014421] mb-4">Om oss</h1>
          <div className="w-24 h-1 bg-[#93C560] mx-auto"></div>
        </div>

        {/* Content Section */}
        <div className="prose prose-lg max-w-none text-gray-700">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <p className="text-xl italic text-[#014421] mb-6">
              Hippokrates skrev redan 460 f.Kr. "låt maten vara din medicin och medicinen vara mat", 
              och det gäller verkligen för Functional Foods. Detta har ingått som filosofi i Ulrika 
              Davidssons kostråd och recept de senaste tjugo åren.
            </p>
            
            <p className="mb-4">
              Här har vi samlat kunskap, recept och inspiration under ett och samma tak.
            </p>

            <h2 className="text-2xl font-bold text-[#014421] mt-8 mb-4">
              Varför är det så viktigt med functional foods?
            </h2>
            
            <p className="mb-4">
              Att förmedla värdet av kostens betydelse och förstå fördelarna med bra råvaror och 
              näringsrik mat är inte alltid lätt men oerhört viktigt. I en tid då snabbmat och 
              processade livsmedel utgör allt större del av vår kost och faktiskt bidrar till många 
              av våra livsstilssjukdomar vill vi här inspirera till att vända denna trend.
            </p>
            
            <p className="mb-6">
              Målet är att på ett enkelt sätt hjälpa till att kombinera information och kunskap med 
              hälsosamma och goda recept för en bättre hälsa och stärkt immunförsvar – för att både 
              kropp och knopp ska fungera på toppnivå!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#014421] mb-4">
              Ulrika Davidssons personliga hälsoresa
            </h2>
            
            <p className="mb-4">
              Det tog 15 år innan jag förstod att det är bara jag som kan förändra min hälsa och 
              ingen annan kommer att göra det åt mig och att jag faktiskt hade kraften att förändra 
              mitt sätt att äta och välja bra råvaror, att motionera och att inse att även jag kan lyckas.
            </p>
            
            <p className="mb-4">
              Tankar skapar känslor och framför allt om man tänker negativa tankar. Detta var orsaken 
              till att jag vid 30 års ålder vägde nästan 100 kg och min övervikt var ett faktum. 
              Visserligen hade jag fött 2 barn men efter att rannsakat mig själv insåg jag att åt för 
              mycket och alldeles fel samt var lat och inte uppskattade motion.
            </p>
            
            <p className="mb-6">
              Den 1 februari, 2002 föll "poletten" ner efter att jag hade läst om lågkolhydratskost, 
              på den tiden GI metoden. Jag började förstå att anledningen att jag åt mycket och ofta 
              var att jag baserade min kost på snabba kolhydrater som gjorde att mitt blodsocker var 
              som en berg- och dalbana. Functional foods fanns inte alls i min kosthållning. Den dagen 
              gjorde jag en radikal förändring i mitt liv som har betytt otroligt mycket för min hälsa 
              och mitt välmående.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#014421] mb-4">
              Ulrika Davidsson idag
            </h2>
            
            <p className="mb-4">
              Nu, efter över 20 år har jag skaffat mig en lång erfarenhet och mycket kunskap om såväl 
              näringslära, lågkolhydratskost, periodisk fasta, förbränning, hormonella besvär i olika 
              åldrar, mage- och tarmhälsa och livsstilssjukdomar och hur man ska leva ett hälsosamt 
              liv som stärker kroppen. Jag har gett ut över 40 kokböcker med hälsosam matlagning och 
              inspirerat 100 – tusentals människor till ett friskare, lättare och hälsosammare liv. 
              En sak har jag lärt mig och det är att det finns ingen kostplan som passar alla! Det 
              gäller att hitta en livsstil som passar just sig själv och som man kan leva efter.
            </p>
            
            <p className="mb-6">
              Jag är övertygad om att Functional Foods är ett fantastiskt sätt att använda mat som 
              medicin för ett långt och hälsosamt liv. Att lära sig mer om Longevity, biohacking, 
              nya kosttillskott och superfoods kommer ytterligare hjälpa oss att få ett längre och 
              friskare liv.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-[#014421] text-white rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Kontakta oss</h3>
            <p className="mb-6">
              Har du frågor eller funderingar? Vi finns här för dig!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:info@functionalfoods.se" 
                className="inline-flex items-center gap-2 bg-white text-[#014421] px-6 py-3 rounded-full font-semibold hover:bg-[#93C560] hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                info@functionalfoods.se
              </a>
              <Link
                href="/om-oss/kontakta-oss"
                className="inline-flex items-center gap-2 bg-[#Ff7e70] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#ff6b5a] transition-colors"
              >
                Kontaktformulär
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 