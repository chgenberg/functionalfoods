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
    1: "Välkommen till Functional Energy! Under dessa 6 veckor kommer du att lära dig att stabilisera din energi och blodsocker genom smart mat.",
    2: "Vecka 2 fokuserar på blodsocker och energi. Du får djupare förståelse för hur olika livsmedel påverkar dina energinivåer.",
    3: "Denna vecka handlar om måltidsplanering för stabil energi. Lär dig att strukturera dina måltider för jämn energi hela dagen.",
    4: "Vecka 4 introducerar smarta kolhydrater. Upptäck vilka kolhydrater som ger långvarig energi utan blodsockertoppar.",
    5: "Nu fokuserar vi på energistabila vanor. Du får praktiska strategier för att skapa rutiner som stödjer din energi.",
    6: "Sista veckan handlar om långsiktig hållbarhet. Du får verktyg att bibehålla dina nya vanor och fortsätta må bra."
  }
};

// Document mapping for each week
const weekDocuments: Record<string, Record<number, string[]>> = {
  basics: {
    1: [], // No documents mentioned for week 1
    2: ["Functional foods - 3 steg till ett friskare liv"],
    3: ["Periodisk fasta", "Reflektion vecka 3"],
    4: ["Måldokumentet - Styrelsemöte", "Motivation och reflektionsdokumentet"],
    5: ["Topplistan Functional Foods", "Drycker", "Benbuljong", "Superpulver"],
    6: ["Functional Foods som livsstil"]
  },
  flow: {
    1: [],
    2: ["Vanliga mag- och tarmproblem", "Kosten - en guide till bättre mage och tarm"],
    3: ["Tillskott som kan stödja mag- och tarmhälsa", "Fermenterade livsmedel, probiotika och prebiotika"],
    4: ["Livsstilsfaktorer: stress, sömn och fysisk aktivitet"],
    5: ["Att välja rätt proteiner", "Att välja rätt kolhydrater"],
    6: []
  },
  energy: {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
  }
};

// All available documents from InfoPopupGrid
const allDocuments = [
  { title: "Frågor och svar", filename: "fragor-och-svars.txt", icon: "❓", description: "Vanliga frågor om kursen och kosten" },
  { title: "Dags att komma igång!", filename: "dags-att-komma-igang.txt", icon: "🚀", description: "Kom igång med din hälsoresa" },
  { title: "Måldokument - styrelsemöte 1", filename: "maldokument-styrelsemote-1.txt", icon: "📋", description: "Sätt upp dina hälsomål" },
  { title: "Functional foods topplista", filename: "functional-foods-topplista.txt", icon: "🏆", description: "De bästa functional foods" },
  { title: "Reflektion vecka 3", filename: "reflektion-vecka-3.txt", icon: "💭", description: "Reflektera över din framsteg" },
  { title: "Fördelarna med functional foods", filename: "fordelarna-med-functional-foods.txt", icon: "✨", description: "Varför functional foods fungerar" },
  { title: "Att äta ute med functional foods", filename: "att-ata-ute-med-functional-foods.txt", icon: "🍽️", description: "Tips för restaurangbesök" },
  { title: "Benbuljong", filename: "benbuljong.txt", icon: "🍲", description: "Hälsosam benbuljong och dess fördelar" },
  { title: "Att välja rätt proteiner", filename: "att-valja-ratt-proteiner.txt", icon: "💪", description: "Guide till bästa proteinval" },
  { title: "Ersättningsguide för kolhydrater", filename: "ersattningsguide-for-kolhydrater.txt", icon: "🌾", description: "Smarta kolhydratsalternativ" },
  { title: "Vad är functional foods?", filename: "vad-ar-functional-foods-2.txt", icon: "🤔", description: "Grundläggande om functional foods" },
  { title: "3 steg till ett friskare liv", filename: "functional-foods-3-steg-till-ett-friskare-liv.txt", icon: "🎯", description: "Enkla steg mot bättre hälsa" },
  { title: "Måldokument - styrelsemöte 2", filename: "maldokument-styrelsemote-2.txt", icon: "📊", description: "Utveckla dina hälsomål vidare" },
  { title: "Motivation & reflektion", filename: "motivation-och-reflektion.txt", icon: "🌟", description: "Håll motivationen uppe" },
  { title: "Ät mer functional foods enkelt", filename: "at-mer-functional-foods-pa-ett-enkelt-satt.txt", icon: "🥗", description: "Praktiska tips för vardagen" },
  { title: "Functional foods som livsstil", filename: "functional-foods-som-livsstil.txt", icon: "🌱", description: "Gör det till en livsstil" },
  { title: "Naturens egna hälsobomber", filename: "naturens-egna-halsobomber.txt", icon: "💥", description: "Kraftfulla superfoods från naturen" },
  { title: "Drycker", filename: "drycker.txt", icon: "🥤", description: "Hälsosamma dryckesval" },
  { title: "Att välja rätt kolhydrater", filename: "att-valja-ratt-kolhydrater.txt", icon: "🍞", description: "Smarta kolhydratsval" },
  { title: "Periodisk fasta ger klarhet och energi", filename: "periodisk-fasta-ger-klarhet-och-energi.txt", icon: "⏰", description: "Fördelarna med periodisk fasta" },
  // Additional potential documents for Flow course (these might not exist but are referenced)
  { title: "Vanliga mag- och tarmproblem", filename: "vanliga-mag-och-tarmproblem.txt", icon: "🤧", description: "Vanliga problem och lösningar" },
  { title: "Kosten - en guide till bättre mage och tarm", filename: "kosten-guide-mage-tarm.txt", icon: "📖", description: "Kostguide för maghälsa" },
  { title: "Tillskott som kan stödja mag- och tarmhälsa", filename: "tillskott-mag-tarm.txt", icon: "💊", description: "Tillskott för maghälsa" },
  { title: "Fermenterade livsmedel, probiotika och prebiotika", filename: "fermenterade-livsmedel.txt", icon: "🥒", description: "Fermenterad mat för tarmhälsa" },
  { title: "Livsstilsfaktorer: stress, sömn och fysisk aktivitet", filename: "livsstilsfaktorer.txt", icon: "🧘", description: "Livsstil för bättre hälsa" },
  { title: "Superpulver", filename: "superpulver.txt", icon: "✨", description: "Kraftfulla superpulver" }
];

// Function to match document references with actual documents using fuzzy matching
const findMatchingDocuments = (references: string[]) => {
  const matches: typeof allDocuments = [];
  
  references.forEach(ref => {
    const refLower = ref.toLowerCase();
    const refWords = refLower.split(/\s+/);
    
    const match = allDocuments.find(doc => {
      const titleLower = doc.title.toLowerCase();
      const filenameLower = doc.filename.toLowerCase();
      
      // Direct title match
      if (titleLower.includes(refLower) || refLower.includes(titleLower)) {
        return true;
      }
      
      // Check if all reference words are in title
      if (refWords.every(word => titleLower.includes(word))) {
        return true;
      }
      
      // Special cases
      if (ref.includes("3 steg") && titleLower.includes("3 steg")) return true;
      if (ref.includes("Måldokument") && titleLower.includes("måldokument")) return true;
      if (ref.includes("Motivation och reflektion") && titleLower.includes("motivation")) return true;
      if (ref.includes("Topplistan") && titleLower.includes("topplista")) return true;
      if (ref.includes("Periodisk fasta") && titleLower.includes("periodisk fasta")) return true;
      if (ref.includes("mag- och tarm") && filenameLower.includes("mag")) return true;
      if (ref.includes("Fermenterade") && filenameLower.includes("ferment")) return true;
      if (ref.includes("Livsstilsfaktorer") && filenameLower.includes("livsstil")) return true;
      if (ref.includes("Superpulver") && filenameLower.includes("super")) return true;
      
      return false;
    });
    
    if (match && !matches.includes(match)) {
      matches.push(match);
    }
  });
  
  return matches;
};

export default function WeekTemplate({
  courseType,
  weekNumber,
  weekTitle,
  weekSubtitle,
  heroImage = '/Ulrika_portratt/udavidssondesktop.png',
  videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  mealPlans,
  courseStartDate
}: WeekTemplateProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayThumbnails, setDayThumbnails] = useState<Record<number, string>>({});
  const [mealImages, setMealImages] = useState<Record<string, string>>({});
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [documentLoading, setDocumentLoading] = useState(false);

  useEffect(() => {
    const handler = () => {
      setShowHelpGuide(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

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

  // Get documents for current week
  const weekDocumentRefs = weekDocuments[courseType]?.[weekNumber] || [];
  const weekSpecificDocuments = findMatchingDocuments(weekDocumentRefs);

  // Function to open document popup
  const openDocument = async (doc: any) => {
    setSelectedDocument(doc);
    setDocumentLoading(true);
    
    try {
      const response = await fetch(`/api/scraped-content/${doc.filename}`);
      if (response.ok) {
        const text = await response.text();
        
        // The files are already cleaned, just extract content after separator
        let cleanContent = text;
        
        if (text.includes('--------------------------------------------------------------------------------')) {
          const parts = text.split('--------------------------------------------------------------------------------');
          if (parts.length > 1) {
            cleanContent = parts[1].trim();
          }
        }
        
        setDocumentContent(cleanContent);
      } else {
        // Provide helpful fallback content for missing documents
        const fallbackContent = getFallbackContent(doc.title);
        setDocumentContent(fallbackContent);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      const fallbackContent = getFallbackContent(doc.title);
      setDocumentContent(fallbackContent);
    }
    
    setDocumentLoading(false);
  };

  // Function to provide fallback content for missing documents
  const getFallbackContent = (title: string) => {
    const fallbacks: Record<string, string> = {
      "3 steg till ett friskare liv": `
Här är tre enkla steg för att komma igång med Functional Foods:

1. **Börja med grunderna**
   Fokusera på näringsrika, naturliga livsmedel som ger kroppen de byggstenar den behöver.

2. **Planera dina måltider**
   Förbered dig för veckan genom att planera måltider och handla smart.

3. **Var konsekvent**
   Små förändringar över tid ger stora resultat. Håll dig till dina nya vanor.

Genom att följa dessa steg kommer du att märka positiva förändringar i din energi, hälsa och välmående.`,
      
      "Functional foods topplista": `
Här är några av de bästa functional foods att inkludera i din kost:

**Grönsaker:**
- Grönkål och spenat (rika på järn och folsyra)
- Broccoli och blomkål (antioxidanter)
- Rödbetor (nitrater för blodcirkulation)

**Proteiner:**
- Lax och fet fisk (omega-3)
- Ägg (komplett protein)
- Baljväxter (fiber och protein)

**Fetter:**
- Avokado (enkelomättade fetter)
- Nötter och frön (E-vitamin och magnesium)
- Olivolja (antiinflammatoriska egenskaper)

Dessa livsmedel ger inte bara näring utan har också specifika hälsofördelar.`,
      
      "Periodisk fasta ger klarhet och energi": `
Periodisk fasta, särskilt 16:8-metoden, kan ge flera hälsofördelar:

**Fördelar:**
- Förbättrad insulinkänslighet
- Ökad mental klarhet
- Bättre energinivåer
- Förenklad måltidsplanering

**Så här gör du:**
- Ät inom en 8-timmarsperiod (t.ex. 12:00-20:00)
- Fasta i 16 timmar (inklusive sömn)
- Drick vatten, te eller kaffe under fasteperioden

**Tips:**
- Börja gradvis
- Lyssna på din kropp
- Anpassa efter dina behov

Kom ihåg att periodisk fasta inte passar alla, så konsultera gärna en vårdgivare först.`
    };

    return fallbacks[title] || `
Detta dokument är för närvarande inte tillgängligt, men här är några allmänna råd:

**${title}**

Vi arbetar på att göra detta innehåll tillgängligt. Under tiden kan du:

- Fortsätta följa ditt kostschema
- Fokusera på näringsrika, naturliga livsmedel
- Planera dina måltider i förväg
- Lyssna på din kropp och dess behov

För mer information, besök vår kunskapsbank eller kontakta oss via info@functionalfoods.se.`;
  };

  return (
    <>
      {/* Welcome Message Box */}
      <div className="bg-gradient-to-b from-[#F3EFE3] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-6">
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
              <div className="prose prose-lg max-w-none text-gray-700">
                {welcomeMessage.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Week Documents - Show only if there are documents for this week */}
      {weekSpecificDocuments.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-[#014421]/10"
          >
            <h3 className="text-xl md:text-2xl font-bold text-[#014421] mb-4">
              Veckans läsning
            </h3>
            <p className="text-gray-600 mb-6">
              Klicka på dokumenten nedan för att fördjupa din kunskap denna vecka
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weekSpecificDocuments.map((doc, index) => (
                <motion.button
                  key={doc.filename}
                  onClick={() => openDocument(doc)}
                  className="bg-gradient-to-br from-[#F3EFE3] to-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-left group hover:scale-105 border border-[#014421]/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#014421] mb-1 group-hover:text-[#116530] transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {doc.description}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-[#014421] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Course Navigation */}
      <div className="bg-white shadow-lg -mt-2">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType={courseType} currentWeek={weekNumber} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Week Meals */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#014421] mb-4">Veckans måltider</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Klicka på en måltid för att se receptet
            </p>
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
                              <p className="text-sm text-gray-700 line-clamp-2">{mealName}</p>
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

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg sm:col-span-2 md:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#014421] rounded-full p-2.5 sm:p-3 mr-3 sm:mr-4">
                  <Book className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#014421]">Bonusmaterial</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Extra recept och tips för veckan</p>
              <button className="w-full bg-[#014421] text-white rounded-lg py-2.5 sm:py-3 hover:bg-[#112A12] transition-colors text-sm sm:text-base">
                Öppna material
              </button>
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

      {/* Document Popup Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{selectedDocument.icon}</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedDocument.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {documentLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014421]"></div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none">
                    {documentContent.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return null;
                      
                      // Handle headings
                      if (paragraph.match(/^[A-ZÅÄÖ\s]+$/)) {
                        return <h3 key={index} className="text-xl font-bold text-[#014421] mt-6 mb-3">{paragraph}</h3>;
                      }
                      
                      // Handle list items
                      if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                        return <li key={index} className="ml-4 mb-2">{paragraph.replace(/^[•-]\s*/, '')}</li>;
                      }
                      
                      // Regular paragraphs
                      return <p key={index} className="mb-4">{paragraph}</p>;
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#014421] text-white rounded-full font-bold hover:bg-[#116530] transition-colors"
                >
                  Stäng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 