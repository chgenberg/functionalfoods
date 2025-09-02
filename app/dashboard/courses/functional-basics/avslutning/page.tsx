'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import WeekHeroWithVideo from '@/app/dashboard/courses/components/WeekHeroWithVideo';
import VideoModal from '@/app/dashboard/courses/components/VideoModal';
import FavoriteRecipesPDF from '@/app/dashboard/courses/components/FavoriteRecipesPDF';
import CourseReviewForm from '@/app/dashboard/courses/components/CourseReviewForm';
import HelpGuide from '@/app/components/HelpGuide';
import { ArrowLeft, Check, Heart, Target, Star, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CompletionPage() {
  const [showVideo, setShowVideo] = useState(true);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Listen for help button clicks
  useEffect(() => {
    const handler = () => {
      console.log('Dashboard help event received in Completion!');
      setShowHelpGuide(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Hero Section with Video */}
      <WeekHeroWithVideo
        weekNumber={7}
        weekTitle="Kursen avslutad"
        weekSubtitle="Stort grattis! Här är din avslutningsfilm och nästa steg"
        heroImage="/Ulrika_portratt/udavidssondesktop.png"
        videoUrl="https://player.vimeo.com/video/1058943393"
      />

      {/* Course Navigation - After Hero Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType="basics" currentWeek={6} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#014421] text-center mb-8">Kursen avslutad</h1>
        
        {/* Video Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl">
            <iframe
              src="https://player.vimeo.com/video/1058943393"
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Functional Basics Completion"
            />
          </div>
        </motion.div>

        {/* Congratulations Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-[#FFB5A7] rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-[#014421] mb-6">
            Grattis till en ny livsstil med Functional Foods!
          </h2>
          
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Nu är du i mål och du har under 6 veckor gett din kropp så mycket mervärdesmat, du har lärt dig laga goda functional foods maträtter och förändrat din hälsa på många plan. Efter att du har följt dessa förberedda veckor med kostscheman och inköpslistor är det dags att ta nästa steg och börja planera själv. Du har fått lärdom och kunskap om hur Functional Foods fungerar och vilka råvaror som bör ingå dagligen i din kost. Jag hoppas också att du känner glädje i köket och tycker att det är roligt att laga din egen mat på ett hälsosamt sätt.
            </p>
            
            <p>
              Det viktigaste för att du ska vilja fortsätta med Functional Foods som livsstil, grundas i de resultat du upplever. Ta en stund och reflektera över de förändringar du känner både kroppsligt och mentalt. Du mår med stor sannolikhet väldigt bra och det vill du förstås fortsätta att göra resten av ditt liv!
            </p>
            
            <p>
              Det är dags för ett styrelsemöte med dig själv och för att reflektera över vilka förändringar du känner och vad du har fått för insikter. Jag rekommenderar att du går igenom dokumentet "Motivation och reflektion" och noterar dom förändringar du känner med din hälsa.
            </p>
          </div>

          <motion.a
            href="mailto:info@functionalfoods.se?subject=Min upplevelse av Functional Basics"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 mx-auto flex items-center gap-2 bg-gradient-to-r from-[#FFB5A7] to-[#FCD5CE] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all max-w-fit"
          >
            <Heart className="w-5 h-5" />
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
                <Star className="w-4 h-4 mt-1 flex-shrink-0 text-[#FFB5A7]" />
                <span>Fundera på vad är det som gör att du får en lägre motivation?</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 mt-1 flex-shrink-0 text-[#FFB5A7]" />
                <span>Hur ska du hantera din situation när du känner dig omotiverad?</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 mt-1 flex-shrink-0 text-[#FFB5A7]" />
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
          <FavoriteRecipesPDF courseType="basics" />
        </motion.div>

        {/* Course Review Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <CourseReviewForm 
            courseId="functional-basics"
            courseName="Functional Basics"
            onSubmitSuccess={() => {
              // Trigger completion email
              fetch('/api/courses/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: 'current-user', // This should come from auth
                  courseId: 'functional-basics'
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

      {/* Video Modal */}
      <VideoModal
        isOpen={false}
        onClose={() => {}}
        weekNumber={7}
        weekTitle="Kursen avslutad"
        videoUrl="https://player.vimeo.com/video/1058943393"
      />
    </div>
  );
} 