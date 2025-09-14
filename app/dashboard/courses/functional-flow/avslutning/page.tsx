'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import FavoriteRecipesPDF from '@/app/dashboard/courses/components/FavoriteRecipesPDF';
import CourseReviewForm from '@/app/dashboard/courses/components/CourseReviewForm';
import HelpGuide from '@/app/components/HelpGuide';
import { ArrowLeft, Check, Star, Target, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CompletionPage() {
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Listen for help button clicks
  useEffect(() => {
    const handler = () => {
      console.log('Dashboard help event received in Flow Completion!');
      setShowHelpGuide(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Course Navigation */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType="flow" currentWeek={6} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#014421] text-center mb-8">Kursen avslutad</h1>
        
        {/* Congratulations Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-[#93C560] rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-[#014421] mb-6">
            Grattis till en ny livsstil med Functional Foods!
          </h2>
          
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Nu har du genomfört Functional Flow och tagit din hälsa till nästa nivå! Under 6 veckor har du fördjupat din kunskap om avancerad näringsoptimering, prestationshöjande kost och antiinflammatoriska livssstilsval. Du har lärt dig att optimera din energi, förbättra återhämtning och skapa en personlig hälsostrategi som fungerar för dig.
            </p>
            
            <p>
              Det viktigaste för att du ska vilja fortsätta med Functional Foods som livsstil, grundas i de resultat du upplever. Ta en stund och reflektera över de förändringar du känner både kroppsligt och mentalt. Du mår med stor sannolikhet väldigt bra och det vill du förstås fortsätta att göra resten av ditt liv!
            </p>
            
            <p>
              Det är dags för ett styrelsemöte med dig själv och för att reflektera över vilka förändringar du känner och vad du har fått för insikter. Jag rekommenderar att du går igenom dokumentet "Motivation och reflektion" och noterar dom förändringar du känner med din hälsa.
            </p>
          </div>

          <motion.a
            href="mailto:info@functionalfoods.se?subject=Min upplevelse av Functional Flow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 mx-auto flex items-center gap-2 bg-gradient-to-r from-[#93C560] to-[#7BA94D] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all max-w-fit"
          >
            <Star className="w-5 h-5" />
            Berätta vad du tycker och få vår e-bok "Functional Foods" utan kostnad
          </motion.a>
        </motion.div>

        {/* Motivation and Reflection Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#014421] rounded-2xl shadow-lg p-8 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Motivation och reflektion</h3>
          </div>
          
          <div className="space-y-4 text-white/90 leading-relaxed mb-8">
            <p>
              Om du tar en stund och kartlägger ditt liv och hur din vardag ser ut så kan du hitta orsaker som gör att du inte prioriterar dig själv i den mån du behöver för att må bra. Det finns en stor fördel att tänka positivt. Det skapar en oerhört viktig känsla, en självkänsla som du kan ha glädje av när du vill göra en hälsoförändring. Den bidrar till att ditt beteende blir rätt och riktigt och kan dessutom ta bort en fokus på viktminskning och istället ge ett långsiktigt beteende med fokus på hälsa.
            </p>
            
            <p>
              Motivation är en färskvara – det handlar om att vara förberedd på utmaningarna och hitta en positiv inställning som håller dig på rätt spår när du gör din hälsoförändring.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Några frågor du kan ställa till dig själv
            </h4>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 mt-1 flex-shrink-0 text-[#027A48]" />
                <span>Fundera på vad är det som gör att du får en lägre motivation?</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 mt-1 flex-shrink-0 text-[#027A48]" />
                <span>Hur ska du hantera din situation när du känner dig omotiverad?</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 mt-1 flex-shrink-0 text-[#027A48]" />
                <span>Har du någon i din närhet som kan stötta dig och peppa dig?</span>
              </li>
            </ul>
            
            <p className="mt-4 text-sm">
              Det är en stor skillnad på att använda negativa ord som måste, ska eller borde och att säga ord med en mer positiv innebörd. Prova att säga till dig själv: "jag vill och har lust att göra något åt min egen hälsa" Då kommer du ha större förutsättningar att lyckas!
            </p>
            
            <p className="mt-3 text-sm">
              Allt handlar om att hitta en livsstil som fungerar för dig. Det gäller att ha långsiktiga mål som du kan nå och med mycket motivation, inspiration och matglädje kommer du förhoppningsvis att det inte är så svårt och motivationen kommer när du känner en förbättring i din hälsa.
            </p>
          </div>
        </motion.div>

        {/* Favorite Recipes Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <FavoriteRecipesPDF courseType="flow" />
        </motion.div>

        {/* Course Review Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <CourseReviewForm 
            courseId="functional-flow"
            courseName="Functional Flow"
            onSubmitSuccess={() => {
              // Trigger completion email
              fetch('/api/courses/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: 'current-user', // This should come from auth
                  courseId: 'functional-flow'
                })
              }).catch(console.error);
            }}
          />
        </motion.div>
      </div>

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpGuide} 
        onClose={() => setShowHelpGuide(false)} 
      />
    </div>
  );
} 