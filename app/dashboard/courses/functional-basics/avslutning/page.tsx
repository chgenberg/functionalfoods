'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import WeekHeroWithVideo from '@/app/dashboard/courses/components/WeekHeroWithVideo';
import VideoModal from '@/app/dashboard/courses/components/VideoModal';
import { useFavoriteRecipes } from '@/app/hooks/useFavoriteRecipes';
import CourseReviewForm from '@/app/dashboard/courses/components/CourseReviewForm';
import HelpGuide from '@/app/components/HelpGuide';
import { ArrowLeft, Check, Star, Target, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

const getMealTypeSwedish = (mealType: string): string => {
  const translations: Record<string, string> = {
    'breakfast': 'Frukost',
    'lunch': 'Lunch', 
    'dinner': 'Middag',
    'snack': 'Mellanmål'
  };
  return translations[mealType] || mealType;
};

export default function CompletionPage() {
  const [showVideo, setShowVideo] = useState(true);
  const { getFavoritesByCoursetype } = useFavoriteRecipes();
  const favorites = getFavoritesByCoursetype('basics');
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
      {/* Course Navigation */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType="basics" currentWeek={6} />
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
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-[#014421] rounded-xl flex items-center justify-center">
                  <Star className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-[#014421] mb-2">
                  Mina Favoritrecept
                </h3>
                <p className="text-gray-600">
                  {favorites.length > 0 ? `${favorites.length} sparade recept från Functional Basics` : 'Inga favoritrecept ännu'}
                </p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Inga favoritrecept ännu</h4>
                <p className="text-gray-600 mb-4">
                  Stjärnmarkera recept i dina måltidsplaner för att samla dem här!
                </p>
                <div className="text-sm text-gray-500">
                  Klicka på <Star className="w-4 h-4 inline text-yellow-500" /> bredvid måltider för att lägga till dem som favoriter
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(favorites.reduce((acc, fav) => {
                  const weekKey = `Vecka ${fav.weekNumber}`;
                  if (!acc[weekKey]) {
                    acc[weekKey] = [];
                  }
                  acc[weekKey].push(fav);
                  return acc;
                }, {} as Record<string, typeof favorites>))
                  .sort(([a], [b]) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
                  .map(([week, recipes]) => (
                    <div key={week} className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-[#014421] mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {week}
                      </h4>
                      <div className="space-y-2">
                        {recipes.map((recipe, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <Star className="w-4 h-4 text-[#93C560] flex-shrink-0" />
                            <div className="flex-grow">
                              <div className="font-medium text-gray-900">{recipe.name}</div>
                              <div className="text-sm text-gray-500">
                                {recipe.dayName} • {getMealTypeSwedish(recipe.mealType)}
                              </div>
                              {recipe.recipeLink && (
                                <Link 
                                  href={recipe.recipeLink}
                                  className="text-sm text-[#014421] hover:text-[#112A12] transition-colors"
                                >
                                  Visa recept →
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
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