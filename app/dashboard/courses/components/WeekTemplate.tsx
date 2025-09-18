'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import Image from 'next/image';
import HelpGuide from '@/app/components/HelpGuide';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import DayModal from '@/app/dashboard/courses/components/DayModal';
import { dayImages } from '@/app/data/dayImages';
import { mealPlans, flowMealPlans, energyMealPlans } from '@/app/data/mealPlans';
import { Play, Clock, CheckCircle, Book, Download, TrendingUp, Award, Star, ChevronRight, Users, ShoppingCart, Calendar, Lock, ArrowRight, Settings, HelpCircle, Sun, FileText, ExternalLink, X } from 'lucide-react';
import InfoPopupGrid from '@/app/dashboard/courses/components/InfoPopupGrid';
import PrintableMealPlan from './PrintableMealPlan';

// Helper function to format meal names with bold "rester"
const formatMealName = (mealName: string) => {
  if (mealName.toLowerCase().includes('rester')) {
    const parts = mealName.split(/(\s*rester\s*)/gi);
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase().includes('rester') ? (
            <span key={index} className="font-bold text-[#014421]">rester</span>
          ) : (
            part
          )
        )}
      </span>
    );
  }
  return mealName;
};

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

interface WeekTemplateProps {
  weekNumber: number;
  courseType: 'basics' | 'flow' | 'energy';
  weekTitle: string;
  weekSubtitle: string;
  heroImage?: string;
  videoUrl?: string;
  mealPlans: any; // The specific meal plan data for this course
  courseStartDate: Date | null;
  customContent?: React.ReactNode;
}

interface KnowledgeDocument {
  title: string;
  slug: string;
  content: string;
  headerImage: string;
  relatedImages: string[];
  keyTakeaways: string[];
  readTime: number;
  course: 'basic' | 'flow' | 'energy';
  order: number;
  week?: number; // We'll add this to map documents to weeks
}

// Week-specific welcome messages
const weekMessages: Record<string, Record<number, string>> = {
  basics: {
    1: `Nu har du en spännande resa framför dig under dessa 6 veckor med näringsrika och hälsobringade recept och du kommer att få lära dig grunderna i Functional Foods. Du får praktiska kostscheman att följa, recept för alla måltider och inköpslistor för varje vecka.

Efter dessa 6 veckor har du dels lärt dig mycket om matlagning och hur du får in alla näringsämnen i din kost samt fördelarna som kommer: ökad näringsnivå, förbättrad matsmältning, bättre hjärthälsa, minskad inflammation i kroppen, ökade energinivåer och ett bättre immunförsvar.

Du kommer att tacka dig själv, även om det kan finnas dagar när det känns tufft. Mitt bästa tips är planering! Förbered dig för veckan och laga gärna upp flera maträtter på samma gång så att du är väl förberedd.

Varmt välkommen till framtidens kost för en god hälsa och ett friskare liv!

/Ulrika`,
    2: `Nu har du kommit in i din nya livsstil och kroppen börjar ge dig positiv återkoppling. Genom att ge den näring i form av antioxidanter, fibrer, probiotika, mineraler och vitaminer håller du blodsockret på en jämn nivå, vilket gör det lättare att stå emot socker och snabba kolhydrater. 

Den nya rutinen ger dig mer energi, och du märker säkert redan skillnad. För att fortsätta på bästa sätt, planera veckan noggrant. 

Den här veckan ska du också läsa dokumentet "Functional foods - 3 steg till ett friskare liv" för att ta nästa steg i din utveckling.`,
    3: `Ny vecka med nya härliga recept i ditt kostschema! Du kanske har hittat en favoritfrukost och vill hålla dig till den – kostschemat är en guide och ger dig stor flexibilitet. 

Om du vill kan du också prova 16:8 fasta, där du hoppar över frukosten och börjar äta vid lunch. Det ger fördelar för matsmältningen, men lyssna på din kropp och variera vid behov. 

Nu har du även matlådor i frysen som sparar både tid och pengar. Den här veckan ska kan du också läsa dokumenten "Periodisk fasta" och "Reflektion vecka 3".`,
    4: `Nu har du genomfört halva kursen, fått prova att laga många nya recept och ätit en varierad kost med mycket frukt och grönt, fiberrika råvaror, naturligt protein, bra fetter och använt många olika kryddor som förgyller din matlagning. 

Din nya livsstil skapar nya vanor, tankar och beteende samt att du lär dig hur din kropp känns när den är i balans. Nu är det dags att reflektera över de förändringar du känner och ser, och jag rekommenderar att du går igenom "Måldokumentet - Styrelsemöte" för att påminna dig om hur du upplevde din hälsa när du startade för 3 veckor sedan och vilka skillnader du känner i din kropp. 

En bra hjälp är "Motivation och reflektionsdokumentet" för att synliggöra förbättringar och öka din motivation att fortsätta med din hälsoinvestering.`,
    5: `Tycker du att det är bra att allt är planerat för dig, eller önskar du mer flexibilitet? Vill du byta ut några recept eller skapa egna, använd dokumentet "Topplistan Functional Foods" för att välja råvaror du har hemma eller vill börja använda mer av. 

Ju mer du lär dig desto mer självständig blir du i att skapa hälsosamma vanor för din framtida hälsa. Vill du boosta kroppen ytterligare kan du börja använda superpulver som spirulina, chlorella eller vetegräs i shots på morgonen, eller göra egen benbuljong för att få i dig mer kollagen. 

Det finns många sätt att utvecklas inom Functional Foods och du kan läsa mer i dokumenten "Drycker", "Benbuljong" och "Superpulver".`,
    6: `Nu är det sista veckan i baskursen och du har lärt dig grunderna för hur råvaror och tillagning påverkar din hälsa. Under dessa veckor har du fått prova många maträtter och lärt dig recept som du kan anpassa efter egna smakpreferenser. 

Förhoppningsvis har du också blivit inspirerad att använda näringsrika grönsaker som kål, rotfrukter och bladgrönsaker, som är rika på antioxidanter och fibrer. Du har ätit en naturligt glutenfri kost och ersatt mindre hälsosamma alternativ som pasta, vete och socker med bättre val. 

Du får i dig mer protein, grönsaker, frukt, baljväxter och omega-3, samt både prebiotika och probiotika. Nu är det dags att anamma detta som livsstil och det kan du läsa mer om i dokumentet "Functional Foods som livsstil".`
  },
  flow: {
    1: `Nu har du en spännande resa framför dig under 6 veckor med näringsrika recept och grunderna i Functional Foods. Du får praktiska kostscheman, recept för alla måltider och inköpslistor varje vecka.

Efter dessa veckor kommer du ha lärt dig om matlagning och de fördelar som kommer med en näringsrik kost: bättre matsmältning, hjärthälsa, ökad energi, minskad inflammation och ett starkare immunförsvar.

Mitt bästa tips är planering – laga flera maträtter samtidigt för att vara väl förberedd.

Varmt välkommen till framtidens kost för bättre hälsa och ett friskare liv!

/Ulrika`,
    2: `Nu när du kommit igång med kursen kanske du redan märker att din mage känns mindre uppsvälld och fungerar bättre. Matlagningen börjar kännas mer naturlig och det blir lättare att följa kostschemat.

Fortsätt planera väl inför veckan och se till att förbereda måltider i förväg. 

Läs gärna dokumenten "Vanliga mag- och tarmproblem" och "Kosten - en guide till bättre mage och tarm" för mer kunskap om hur kosten påverkar din mag- och tarmhälsa.`,
    3: `Vi hoppas att din mage och tarm redan känns bättre och att du märker positiva förändringar. Ibland kan det vara bra att komplettera kosten med kosttillskott för att ge extra stöd till din mag- och tarmhälsa, särskilt om du vill ge tarmfloran ett extra lyft. 

Denna vecka vill vi även lyfta fördelarna med fermenterad mat, som inte bara är näringsrik utan också främjar en sund tarmflora. Genom att inkludera probiotiska och prebiotiska livsmedel i kosten kan du få en ännu starkare grund för din maghälsa.

Läs gärna dokumenten "Tillskott som kan stödja mag- och tarmhälsa" och "Fermenterade livsmedel, probiotika och prebiotika" för att få mer kunskap om hur du kan stärka tarmen med kosttillskott och naturliga livsmedel.`,
    4: `Nu har du genomfört halva kursen, och det är dags att göra en ordentlig reflektion över hur din mage känns. Jämför med hur det kändes i vecka 1 och fundera på vilka förändringar kosten har gjort hittills. Kanske har du märkt att magbesvär som uppsvälldhet eller obehag har minskat?

Den här veckan vill vi också lyfta andra livsstilsfaktorer som påverkar din mag- och tarmhälsa, såsom stress, sömn och fysisk aktivitet. 

Läs gärna dokumentet "Livsstilsfaktorer: stress, sömn och fysisk aktivitet" för att få en bättre förståelse för hur dessa faktorer samverkar med kosten och kan bidra till en ännu mer balanserad mage.`,
    5: `Nu har du fått mycket kunskap och en bättre förståelse för kosten som fungerar för din mage. Du har lärt dig vad som får din mage att må bra och vad som kan orsaka obehag. Det är nu dags att börja använda denna kunskap för att skapa måltider som verkligen stödjer din maghälsa.

Den här veckan vill vi att du fördjupar dig i hur du väljer rätt proteiner och kolhydrater för att bygga balanserade måltider. 

Läs dokumenten "Att välja rätt proteiner" och "Att välja rätt kolhydrater" för att lära dig mer om hur du kan skapa hälsosamma, magevänliga måltider som du kan anpassa efter dina egna behov.`,
    6: `Nu har du nått sista veckan av kursen, och du har lärt dig att laga mat som verkligen gör gott för din mage och dina tarmar. Du har fått massor av nya recept att ta med dig och fortsätta använda i framtiden. 

Förhoppningsvis märker du att magen mår bättre – jämför gärna med hur du upplevde den när du startade kursen och se de förändringar du har åstadkommit.

Nu är det dags att fortsätta ditt intresse för en bra kost och göra det till en hållbar livsstil. När du gör kostval som stödjer din maghälsa kommer din mage att tacka dig – för både nu och i framtiden!`
  },
  energy: {
    1: `För att få bästa resultat i kursen är förberedelse viktigt. Handla det du behöver för veckan och förbered gärna några måltider i förväg. 
Under kursens gång, reflektera regelbundet över hur din kropp och ditt blodsocker känns, och skriv ned dina tankar. Drick mycket vatten och fokusera på vila och återhämtning för att ge din kropp bästa möjliga förutsättningar. 
Läs gärna dokumenten "Dags att komma igång!" och "Frågor och svar" för att förbereda dig och få en bra start. Nu kör vi igång!`,
    2: `Nu när du kommit igång med kursen kanske du redan märker att ditt blodsocker känns stabilare och att du mår bättre. Matlagningen börjar kännas mer naturlig och det blir lättare att följa kostschemat. 
Fortsätt planera väl inför veckan och se till att förbereda måltider i förväg. Läs gärna dokumentet "Functional foods för diabetiker" för mer kunskap om hur rätt livsmedel kan hjälpa dig att hålla blodsockret stabilt och förbättra din hälsa.`,
    3: `Vi hoppas att du redan märker positiva förändringar och att du känner dig bättre. Denna vecka vill vi fokusera på hur rätt kost kan hjälpa till att reglera ditt blodsocker och stödja en balanserad livsstil. Att välja rätt livsmedel är en kraftfull metod för att hålla blodsockret stabilt, vilket kan ha långsiktiga fördelar för din hälsa och välbefinnande. 
Läs gärna dokumentet "Lågkolhydratkost och functional foods för blodsockerkontroll" för att få mer kunskap om hur du kan använda mat för att optimera din hälsa och blodsockernivåer.`,
    4: `Nu har du genomfört halva kursen, och det är dags att reflektera över hur din mage känns. Jämför med vecka 1 och fundera på vilka förändringar kosten har gjort hittills. Kanske har magbesvär som uppsvälldhet och obehag minskat? 
Den här veckan vill vi rekommendera att du läser dokumentet "Förstå insulinresistens och betacellsfunktion". Genom att förstå hur insulin fungerar, vad som händer när man utvecklar insulinresistens, och hur betacellerna spelar en viktig roll i att reglera blodsockernivåerna, får du en djupare förståelse för hur dessa faktorer påverkar din hälsa och din blodsockerkontroll.`,
    5: `Nu har du fått mycket kunskap och en bättre förståelse för kosten som fungerar för din hälsa och blodsockerkontroll. Du har lärt dig vad som får din kropp och mage att må bra, och vad som kan orsaka obehag. Det är nu dags att börja använda denna kunskap för att skapa måltider som stödjer både din maghälsa och ditt blodsocker. 
Den här veckan vill vi att du fördjupar dig i fler faktorer som påverkar ditt blodsocker, förutom kosten. Läs gärna dokumentet "En hälsosam livsstil för stabilt blodsocker" för att få en bättre förståelse för hur även andra livsstilsfaktorer som motion, sömn och stress påverkar din blodsockernivå och kan hjälpa dig att skapa en hållbar och balanserad livsstil.`,
    6: `Nu har du nått sista veckan av kursen, och du har lärt dig att laga mat som stödjer både din maghälsa och blodsockerkontroll. Du har fått massor av nya recept och kunskap som du kan använda för att fortsätta ta hand om din hälsa i framtiden. Förhoppningsvis märker du positiva förändringar – jämför gärna hur du upplevde din kropp och blodsockernivå när du startade kursen och reflektera över de framsteg du har gjort. 
Nu är det dags att fortsätta ditt intresse för en hälsosam kost och göra det till en långsiktig livsstil. Genom att göra kostval som stödjer stabilt blodsocker och en balanserad kropp kommer du att må bra både nu och i framtiden.`
  }
};

// Document mapping for each week - now using actual document order numbers
const weekDocuments: Record<string, Record<number, number[]>> = {
  basics: {
    1: [0, 1], // Order 0 and 1 documents for week 1
    2: [2], // Order 2 document for week 2
    3: [9], // Order 9 (periodisk fasta) for week 3
    4: [], // Motivation documents (order -1, handled separately)
    5: [6, 7, 8], // Drycker, superpulver, benbuljong
    6: [13, 14] // Topplista, livsstil
  },
  flow: {
    1: [0], // vad är functional foods
    2: [1, 2], // vanliga mag- och tarmproblem, kosten guide
    3: [3, 4], // tillskott, fermenterade livsmedel
    4: [5], // livsstilsfaktorer
    5: [6, 7], // att välja rätt proteiner, kolhydrater
    6: [8] // topplista
  },
  energy: {
    1: [0, 1, 2], // Vad är functional foods, Dags att komma igång, Frågor och svar
    2: [3], // Functional foods för diabetiker
    3: [4], // Lågkolhydratskost och functional foods
    4: [5], // Insulinresistens och betacellsfunktion
    5: [6], // En hälsosam livsstil för stabilt blodsocker
    6: []
  }
};

// Map Flow knowledge documents explicitly by slug per week for accurate "Veckans läsning"
const flowWeekSlugs: Record<number, string[]> = {
  1: ['vad-a-r-functional-foods'],
  2: ['vanliga-mag-och-tarmproblem', 'kosten-en-guide-till-en-battre-mage-och-tarm'],
  3: ['tillskott-som-kan-stodja-mag-och-tarmhalsa', 'fermenterade-livsmedel-probiotika-och-prebiotika'],
  4: ['livsstilsfaktorer'],
  5: ['att-valja-ratt-proteiner', 'att-valja-ratt-kolhydrater'],
  6: ['topplista-med-functional-foods']
};

// Map Energy knowledge documents explicitly by slug per week for accurate "Veckans läsning"
const energyWeekSlugs: Record<number, string[]> = {
  1: ['vad-ar-functional-foods', 'dags-att-komma-igang', 'fragor-och-svar'],
  2: ['functional-foods-for-diabetiker'],
  3: ['lagkolhydratskost-functional-foods'],
  4: ['insulinresistens-betacellsfunktion'],
  5: ['halsosam-livsstil-blodsocker'],
  6: []
};

// Weekly pep-talk videos - same for all courses
const weeklyVideos: Record<number, string> = {
  1: '', // No video for week 1
  2: 'https://player.vimeo.com/video/1119774775',
  3: 'https://player.vimeo.com/video/1119775282',
  4: 'https://player.vimeo.com/video/1119775485',
  5: 'https://player.vimeo.com/video/1119775737',
  6: 'https://player.vimeo.com/video/1119775996'
};

export default function WeekTemplate({
  courseType,
  weekNumber,
  weekTitle,
  weekSubtitle,
  heroImage = '/Ulrika_portratt/udavidssondesktop.png',
  videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  mealPlans,
  courseStartDate,
  customContent
}: WeekTemplateProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayThumbnails, setDayThumbnails] = useState<Record<number, string>>({});
  const [mealImages, setMealImages] = useState<Record<string, string>>({});
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);

  useEffect(() => {
    const handler = () => {
      setShowHelpGuide(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  // Load course week meta (title/subtitle/hero/video) and override props if present
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const course = courseType === 'basics' ? 'basic' : courseType === 'flow' ? 'flow' : 'energy';
        const res = await fetch(`/api/course-weeks?course=${course}&week=${weekNumber}`);
        const meta = await res.json();
        if (meta) {
          if (meta.weekTitle) weekTitle = meta.weekTitle;
          if (meta.weekSubtitle) weekSubtitle = meta.weekSubtitle;
          if (meta.heroImage) heroImage = meta.heroImage;
          if (meta.videoUrl) videoUrl = meta.videoUrl;
        }
      } catch (e) {
        // ignore, fallback to passed props
      }
    };
    loadMeta();
  }, [courseType, weekNumber]);

  // Load knowledge documents for this course
  useEffect(() => {
    const loadKnowledgeDocuments = async () => {
      try {
        const course = courseType === 'basics' ? 'basic' : courseType === 'flow' ? 'flow' : 'energy';
        const response = await fetch(`/data/knowledge-documents-${course}.json`);
        const documents: KnowledgeDocument[] = await response.json();
        setKnowledgeDocuments(documents);
      } catch (error) {
        console.error('Error loading knowledge documents:', error);
      }
    };
    loadKnowledgeDocuments();
  }, [courseType]);

  // Get current week's meal plan
  const weekKey = `week${weekNumber}`;
  const mealPlan = mealPlans[weekKey];
  
  // Validate meal plan data
  if (!mealPlan && process.env.NODE_ENV === 'development') {
    console.warn(`No meal plan found for ${weekKey}. Available keys:`, Object.keys(mealPlans));
  }

  // Generate days for current week
  const getDaysForWeek = (weekNum: number): WeekDay[] => {
    const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    
    return days.map((name, index) => {
      const dayNumber = index + 1;
      
      // Calculate if this day is current based on actual dates
      let isCurrent = false;
      if (courseStartDate) {
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - courseStartDate.getTime()) / (1000 * 3600 * 24));
        const currentWeekFromDate = Math.ceil((daysSinceStart + 1) / 7);
        const currentDayFromDate = ((daysSinceStart % 7) + 1);
        
        isCurrent = (currentWeekFromDate === weekNum && currentDayFromDate === dayNumber);
      }
      
      return {
        day: dayNumber,
        name,
        completed: false, // This could be calculated based on user progress
        current: isCurrent,
        locked: false // All days are unlocked for modal access
      };
    });
  };

  const weekDays = getDaysForWeek(weekNumber);

  // Load meal images for all meals in the week
  useEffect(() => {
    const loadMealImages = async () => {
      try {
        if (!mealPlan || !mealPlan.days) return;
        const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
        const allMeals: { name: string; slug: string | null; key: string }[] = [];

        for (let i = 0; i < 7; i++) {
          const dayNum = i + 1;
          const swedishDayKey = dayNames[i];
          const numberDayKey = `day${dayNum}`;
          const dayData = mealPlan.days[swedishDayKey] || mealPlan.days[numberDayKey];
          if (!dayData) continue;

          // Collect all meals for this day
          ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
            const meal = dayData[mealType];
            if (meal && meal.name) {
              let slug: string | null = null;
              if (meal.recipeLink) {
                try {
                  const url = new URL(meal.recipeLink, window.location.origin);
                  const parts = url.pathname.split('/');
                  slug = parts[parts.length - 1] || null;
                } catch {}
              }
              allMeals.push({ 
                name: meal.name, 
                slug: slug,
                key: `${dayNum}-${mealType}`
              });
            }
          });
        }

        if (allMeals.length === 0) return;

        console.log('🖼️ WeekTemplate fetching images for all meals:', allMeals.length);

        const resp = await fetch(`/api/recipes/batch-images?v=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          cache: 'no-store',
          body: JSON.stringify({ 
            recipeNames: allMeals.map(m => m.name), 
            recipeSlugs: allMeals.map(m => m.slug), 
            size: 'small',
            usage: 'card'
          })
        });
        
        if (!resp.ok) {
          console.error('❌ WeekTemplate batch-images failed:', resp.status);
          return;
        }
        
        const data = await resp.json();
        const images: Record<string, string> = data.images || {};
        
        // Map images by meal key
        const imageMap: Record<string, string> = {};
        allMeals.forEach((meal, idx) => {
          const url = images[meal.name];
          if (url) {
            imageMap[meal.key] = url;
          }
        });
        
        setMealImages(imageMap);
        console.log('✅ WeekTemplate loaded', Object.keys(imageMap).length, 'meal images');
      } catch (e) {
        console.error('❌ WeekTemplate image loading error:', e);
      }
    };
    loadMealImages();
  }, [mealPlan, weekNumber]);

  // Format date for display
  const formatDate = (week: number, day: number) => {
    if (!courseStartDate) return `Dag ${day}`;
    
    const startDate = new Date(courseStartDate);
    const dayOffset = (week - 1) * 7 + (day - 1);
    const targetDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    
    return `${dayNames[targetDate.getDay()]} ${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}`;
  };

  // Get the appropriate welcome message
  const welcomeMessage = weekMessages[courseType]?.[weekNumber] || '';

  // Get documents for current week based on order numbers
  // (Flow uses explicit slug mapping for precision)
  let weekSpecificDocuments: KnowledgeDocument[] = [];
  if (courseType === 'flow') {
    const slugs = flowWeekSlugs[weekNumber] || [];
    weekSpecificDocuments = knowledgeDocuments.filter(doc => slugs.includes(doc.slug));
  } else if (courseType === 'energy') {
    const slugs = energyWeekSlugs[weekNumber] || [];
    weekSpecificDocuments = knowledgeDocuments.filter(doc => slugs.includes(doc.slug));
  } else {
    const weekDocumentOrders = weekDocuments[courseType]?.[weekNumber] || [];
    weekSpecificDocuments = knowledgeDocuments.filter(doc => 
      weekDocumentOrders.includes(doc.order) || 
      (weekNumber === 4 && doc.order === -1 && (doc.title.toLowerCase().includes('måldokument') || doc.title.toLowerCase().includes('motivation')))
    );
  }

  return (
    <>
      {/* Top spacer to avoid header overlap */}
      <div className="h-16 md:h-0" />
      
      {/* Course Navigation - At the very top like overview page */}
      <CourseNavigation courseType={courseType} currentWeek={weekNumber} />

      {/* Welcome Message Box with Week Documents Combined */}
      <div className="bg-gradient-to-b from-[#F3EFE3] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-[#014421]/10 relative overflow-hidden"
          >
            {/* Subtle pulsing glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#014421]/5 via-[#014421]/10 to-[#014421]/5"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative z-10">
              <div className="text-center mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-2">
                  Välkommen till vecka {weekNumber}!
                </h1>
                <p className="text-lg text-gray-600">
                  {weekTitle}
                </p>
              </div>
              
              {/* Video section - only show if video exists for this week */}
              {weeklyVideos[weekNumber] && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[#014421] mb-4 text-center">Veckans pep-talk</h3>
                  <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={weeklyVideos[weekNumber]}
                        title={`Vecka ${weekNumber} pep-talk`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text content */}
              <div className="prose prose-lg max-w-none text-gray-700">
                {welcomeMessage.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>

              {/* Week Documents - Integrated in same box without border */}
              {weekSpecificDocuments.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl md:text-2xl font-bold text-[#014421] mb-4">
                    Veckans läsning
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Klicka på dokumenten nedan för att fördjupa din kunskap denna vecka
                  </p>
                  <InfoPopupGrid 
                    courseType={courseType} 
                    courseId={`functional-${courseType}`}
                    currentWeek={weekNumber}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Content - If provided */}
      {customContent && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {customContent}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Week Meals */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4 max-w-4xl mx-auto">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-[#014421] mb-4">Veckans måltider</h2>
                <p className="text-gray-600">
                  Klicka på en måltid för att se receptet
                </p>
              </div>
              <div className="flex-shrink-0">
                <PrintableMealPlan 
                  mealPlan={Object.fromEntries(
                    ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'].map((day, index) => {
                      const dayData = mealPlan?.days?.[day] || mealPlan?.days?.[`day${index + 1}`];
                      return [day, dayData || { breakfast: { name: '' }, lunch: { name: '' }, dinner: { name: '' } }];
                    })
                  )}
                  weekNumber={weekNumber}
                  courseName={courseType === 'basics' ? 'Functional Basics' : courseType === 'flow' ? 'Functional Gut Health/Flow' : 'Functional Insulin balance/Energy'}
                />
              </div>
            </div>
          </div>

          {/* Days with Meals */}
          <div className="space-y-8">
            {weekDays.map((day) => {
              const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
              const swedishDayKey = dayNames[day.day - 1];
              const numberDayKey = `day${day.day}`;
              const dayData = mealPlan?.days?.[swedishDayKey] || mealPlan?.days?.[numberDayKey];
              
              if (!dayData) return null;

              const meals = [
                { type: 'breakfast', label: 'Frukost', data: dayData.breakfast },
                { type: 'lunch', label: 'Lunch', data: dayData.lunch },
                { type: 'dinner', label: 'Middag', data: dayData.dinner }
              ];

              return (
                <div key={day.day} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#014421]">{day.name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(weekNumber, day.day)}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {meals.map((meal) => {
                      if (!meal.data) return null;
                      
                      const mealName = meal.data.name.replace(/\s*\(\d+\s*kcal\)/, '');
                      const calorieMatch = meal.data.name.match(/\((\d+\s*kcal)\)/);
                      const calories = calorieMatch ? calorieMatch[1] : '';
                      const imageUrl = mealImages[`${day.day}-${meal.type}`];

                      return (
                        <motion.div
                          key={meal.type}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className="group cursor-pointer"
                          onClick={() => {
                            if (meal.data.recipeLink) {
                              // Add query parameters to track where user came from
                              const url = new URL(meal.data.recipeLink, window.location.origin);
                              url.searchParams.set('from', courseType);
                              url.searchParams.set('week', weekNumber.toString());
                              window.location.href = url.toString();
                            }
                          }}
                        >
                          <div className="relative overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                            <div className="aspect-[4/3] relative bg-gray-100">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={mealName}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-16 h-16 bg-[#014421]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                      <span className="text-2xl">🍽️</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-4 bg-white">
                              <h4 className="font-semibold text-[#014421] mb-1">{meal.label}</h4>
                              <p className="text-sm text-gray-700 line-clamp-2">{formatMealName(mealName)}</p>
                              {calories && (
                                <p className="text-xs text-gray-500 mt-1">{calories}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Week Materials */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#014421] mb-4 sm:mb-6">Veckans material</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#014421] rounded-full p-2.5 sm:p-3 mr-3 sm:mr-4">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#014421]">Inköpslista</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Skapa inköpslista för veckans måltider</p>
              <Link href={`/dashboard/courses/functional-${courseType}/inkopslista?week=${weekNumber}`}>
                <button className="w-full bg-[#014421] text-white rounded-lg py-2.5 sm:py-3 hover:bg-[#112A12] transition-colors text-sm sm:text-base">
                  Visa inköpslista
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#014421] rounded-full p-2.5 sm:p-3 mr-3 sm:mr-4">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#014421]">Community</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Diskutera och dela erfarenheter</p>
              <Link href="/dashboard/community">
                <button className="w-full bg-[#014421] text-white rounded-lg py-2.5 sm:py-3 hover:bg-[#112A12] transition-colors text-sm sm:text-base">
                  Gå till community
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpGuide} 
        onClose={() => setShowHelpGuide(false)} 
      />

      {/* Day Modal */}
      {selectedDay && mealPlan && weekDays && (
        <DayModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          weekNumber={weekNumber}
          dayNumber={selectedDay}
          dayName={weekDays.find(d => d.day === selectedDay)?.name || ''}
          meals={(() => {
            // Try both Swedish day names and day1, day2 format
            const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
            const swedishDayKey = dayNames[selectedDay - 1];
            const numberDayKey = `day${selectedDay}`;
            
            // Check which format exists in the data
            let dayData = mealPlan.days[swedishDayKey] || mealPlan.days[numberDayKey];
            const usedKey = mealPlan.days[swedishDayKey] ? swedishDayKey : numberDayKey;
            
            console.log('DayModal Debug (WeekTemplate):', {
              selectedDay,
              swedishDayKey,
              numberDayKey,
              usedKey,
              dayData: !!dayData,
              mealPlanDays: Object.keys(mealPlan.days)
            });
            
            if (!dayData) return [];
            
            const meals: any[] = [];
            
            // Extract meals with calorie parsing
            if (dayData.breakfast) {
              const match = dayData.breakfast.name.match(/\((\d+\s*kcal)\)/);
              const calories = match ? match[1] : '';
              const mealName = dayData.breakfast.name.replace(/\s*\(\d+\s*kcal\)/, '');
              
              meals.push({
                mealType: 'Frukost',
                time: '07:00',
                meal: mealName,
                calories: calories,
                recipeLink: dayData.breakfast.recipeLink
              });
            }
            
            if (dayData.lunch) {
              const match = dayData.lunch.name.match(/\((\d+\s*kcal)\)/);
              const calories = match ? match[1] : '';
              const mealName = dayData.lunch.name.replace(/\s*\(\d+\s*kcal\)/, '');
              
              meals.push({
                mealType: 'Lunch',
                time: '12:00',
                meal: mealName,
                calories: calories,
                recipeLink: dayData.lunch.recipeLink
              });
            }
            
            if (dayData.dinner) {
              const match = dayData.dinner.name.match(/\((\d+\s*kcal)\)/);
              const calories = match ? match[1] : '';
              const mealName = dayData.dinner.name.replace(/\s*\(\d+\s*kcal\)/, '');
              
              meals.push({
                mealType: 'Middag',
                time: '18:00',
                meal: mealName,
                calories: calories,
                recipeLink: dayData.dinner.recipeLink
              });
            }
            
            return meals;
          })()}
          courseType={courseType}
        />
      )}
    </>
  );
} 