'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, Dumbbell, Brain, Heart, Sparkles } from 'lucide-react';

interface FunctionalFoodsOverviewProps {
  onContinue: () => void;
}

const FunctionalFoodsOverview: React.FC<FunctionalFoodsOverviewProps> = ({ onContinue }) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stepIcons = {
    1: <Utensils className="w-8 h-8 text-orange-500" />,
    2: <Dumbbell className="w-8 h-8 text-orange-500" />,
    3: <Brain className="w-8 h-8 text-orange-500" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 relative z-10">
        <motion.div {...fadeIn} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            FUNCTIONAL FOODS
          </h1>
          <div className="h-1 w-32 bg-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            3 STEG TILL ETT FRISKARE LIV
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-gray-100"
        >
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-lg leading-relaxed">
              Genom att fokusera på kosten, träningen och din mentala hälsa – tre steg till ett friskare liv – kan du skapa en balanserad och hållbar livsstilsförändring. Varje steg du tar för dig närmare ett friskare och starkare liv. Du har kraften att skapa den förändring du önskar och resan börjar redan idag!
            </p>
            
            <p className="text-lg leading-relaxed">
              Att förändra sin livsstil kan kännas som en stor utmaning, men med rätt inställning och god planering kan det vara både inspirerande och givande. I den här boken är det främst fokus på hur du kan använda kosten inom Functional Foods kombinerat med 800-kalorierdieten, men här får du en snabb introduktion till alla de tre viktiga stegen:
            </p>
          </div>

          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 md:p-10 shadow-lg border border-orange-200"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-lg">
                {stepIcons[1]}
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">Steg 1</h3>
                <h4 className="text-2xl font-semibold text-gray-800">– Välj mat med mervärde</h4>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
              <p>
                Känner du dig trött när du har ätit? Hamnar du ofta i matkoma? Det gör du inte när du äter Functional Foods. Första steget är det mest betydande för hälsan, för att läka och bygga en hälsosam kropp och ett alert sinne. Maten du äter ska ge mervärde för kroppen och stötta och läka kroppens alla organ. Maten ska ge energi och framförallt vara njutbar att äta!
              </p>
              <p>
                Recepten i den här boken bygger på Functional Foods och du kommer upptäcka såväl nya smaker som nya råvaror och hur de kan tillagas. Ge dig själv tid i köket så hoppas jag att du ska känna lust och inspiration när du väl lagar maten.
              </p>
              <p>
                För att du enkelt ska komma igång med Functional Foods och 800-kalorierdieten har jag skapat kostscheman för sex veckor. Kombinationen kommer ge dig en bra start på din hälsoresa.
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 md:p-10 shadow-lg border border-green-200"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-lg">
                {stepIcons[2]}
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">Steg 2</h3>
                <h4 className="text-2xl font-semibold text-gray-800">– Inför regelbunden träning</h4>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
              <p>
                En kvart om dagen kan förvandla ditt liv! Låter det för bra för att vara sant? Sanningen är att korta, regelbundna träningspass kan ha en enorm positiv inverkan på hälsan och välmåendet.
              </p>
              <p>
                Schemalägg en fast tid varje dag, gärna på morgonen, för att träna 15 minuter så hjälper det dig att skapa en rutin. Ha träningskläder och utrustning redo så att du enkelt kan komma igång utan att behöva förbereda för mycket. Lyckas du med morgonträningen kan det göra en fantastisk skillnad. Det kan vara så enkelt som att stretcha, yoga eller ta en snabb promenad runt kvarteret. Morgonträning väcker kroppen och sinnet samt ökar energin och din mentala klarhet. Det sätter tonen för en produktiv dag. Träning förbättrar dessutom humöret, eftersom fysisk aktivitet frigör endorfiner – kroppens naturliga lyckohormoner. Tänk att börja varje dag med ett leende.
              </p>
              <p>
                Genom att starta smått, hitta något du älskar och hålla det enkelt och hållbart, kan du bygga en vana som förbättrar både din fysiska och mentala hälsa. Korta, intensiva träningspass kan vara lika effektiva som längre träningspass.
              </p>
              <p>
                En viktig nyckel till framgång jag brukar föreslå är att fira dina framsteg. Oavsett om det är för att du känner dig starkare, mer energisk eller helt enkelt att du håller fast vid nya goda vanor.
              </p>
              <p>
                Om du har svårt att avsätta 15 minuter i ett sträck, fördela rörelsen över dagen. Gör fem minuter stretching på morgonen, fem minuter promenad på lunchen och fem minuter styrketräning på kvällen.
              </p>
              
              <div className="mt-4">
                <p className="font-semibold mb-2">Här är några träningsformer du kan prova hemma som inte kräver redskap:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>HIIT-pass eller yoga (hitta ett pass på YouTube och inspireras av)</li>
                  <li>Kroppsviktsövningar (till exempel armhävningar, crunch, utfall och benböj)</li>
                  <li>Burpees är en av de bästa pulshöjande övningarna du kan utföra och som kan kombineras med en rask promenad!</li>
                </ul>
              </div>
              
              <p className="font-semibold text-orange-600 mt-4">
                Och du, varför vänta? Börja idag! Små steg leder till stora resultat över tid!
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 md:p-10 shadow-lg border border-purple-200"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-lg">
                {stepIcons[3]}
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">Steg 3</h3>
                <h4 className="text-2xl font-semibold text-gray-800">– Stärk ditt mentala välbefinnande</h4>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
              <p>
                En hälsosam livsstil handlar också om att ta hand om ditt inre mentala välbefinnande.
              </p>
              <p>
                Många upplever stress i olika former som kan vara kopplat till oro eller ångest. Man kan känna stress att inte räcka till för familjen, vännerna och känna sig maktlös inför det som händer runtom i världen. Kanske jobbar man för mycket och har svårt att säga nej. Eller så är man uttråkad eller känner sig inte behövd eller älskad.
              </p>
              <p>
                Allt fler känner idag oro över sin hälsa. Istället för att göra ett krafttag och förändra sin livsstil gör man tvärtom och äter mer osunt. Ofta för att socker och snabba kolhydrater lindrar för stunden. Samtidigt kan man bli mer stressad av sociala medier där man ser alla andra äta sunt och träna.
              </p>
              
              <div className="mt-6">
                <p className="font-semibold mb-4">Här är några sätt för att stärka ditt mentala välbefinnande:</p>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">ÖVA MINDFULNESS OCH MEDITATION.</h5>
                    <p>Ta några minuter varje dag för att meditera eller öva mindfulness. Det kan hjälpa dig att hantera stress och hitta ett inre lugn. Öva på mindfulness när du lagar mat till exempel. Lukta på grönsakerna. Ta in färgerna. Smaka och föreställ dig nyttan de kommer att göra för att bygga upp kroppen.</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">ÄT MEDVETET.</h5>
                    <p>Öva på att äta långsamt. Njut av varje tugga. Lyssna på kroppen och sluta äta när du är mätt. "Mindful eating" hjälper dig undvika att överäta och att uppskatta maten mer.</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">SÄTT UPP POSITIVA AFFIRMATIONER.</h5>
                    <p>Börja dagen med att säga positiva saker till dig själv. Det kan vara enkla saker som: "Jag är stark" eller "Jag gör positiva förändringar i mitt liv".</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">SÖK STÖD OCH GEMENSKAP.</h5>
                    <p>Omge dig med människor som stöttar och inspirerar dig. Det kan vara vänner, familj eller en stödgrupp. Att ha någon att dela din resa med kan göra den mycket lättare och roligare.</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">SÄTT GRÄNSER.</h5>
                    <p>Lär dig att säga nej till aktiviteter och människor som inte bidrar positivt till ditt liv. Prioritera din tid och energi till det som verkligen betyder något.</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">PRIORITERA LUGN OCH RO.</h5>
                    <p>Säg nej till saker och aktiviteter som gör att du känner dig stressad. Ta dig tid för avkoppling, god sömn och att vistas i naturen.</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">SJÄLVREFLEKTION OCH MÅLSÄTTNING.</h5>
                    <p>Reflektera regelbundet över dina framsteg och justera målen efter behov. En tydlig vision av vad du vill uppnå ger dig motivation att fortsätta.</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">ÖVA PÅ POSITIVA TANKAR.</h5>
                    <p>Se på dig själv med kärlek. Ge dig beröm och tänk positiva tankar om att du nu ger dig själv en hälsosam livsstil.</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold uppercase text-orange-600">PRIORITERA SÖMNEN.</h5>
                    <p>Återhämtning på natten är viktigt för att hormonerna ska balanseras. Det påverkar sinnet men också förbränningen. Sömn ger dig energi för att leva ett längre och friskare liv.</p>
                  </div>
                </div>
              </div>
              
              <p className="mt-6">
                Följer du dessa tre steg skapar du en hållbar och inspirerande väg mot bättre hälsa. Kom ihåg att varje litet steg räknas och att din resa är unik.
              </p>
              
              <p className="font-semibold text-orange-600 text-lg mt-4">
                Men nu ska vi fokusera på maten!
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Continue Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <span>Se dina personliga rekommendationer</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 opacity-10 animate-pulse">
          <Heart className="w-40 h-40 text-orange-400" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10 animate-pulse">
          <Sparkles className="w-32 h-32 text-purple-400" />
        </div>
        
        {/* Additional decorative circles */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
          <div className="w-96 h-96 bg-orange-200 rounded-full opacity-5"></div>
        </div>
        <div className="absolute top-1/4 right-0 translate-x-1/2">
          <div className="w-64 h-64 bg-purple-200 rounded-full opacity-5"></div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalFoodsOverview; 