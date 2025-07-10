const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Kursdata för Functional Basics
const FUNCTIONAL_BASICS_COURSE = {
  title: "Functional Basics",
  description: "6 veckors hälsoprogram med Ulrika Davidsson. Lär dig grunderna i functional foods och hur du kan förbättra din hälsa genom rätt kostval.",
  level: "Beginner",
  duration: "6 veckor",
  price: 1497,
  objectives: [
    "Förstå grunderna i functional foods",
    "Lära sig välja rätt proteiner och kolhydrater",
    "Implementera functional foods i vardagen",
    "Skapa hållbara matvanor",
    "Förbättra din allmänna hälsa och välmående"
  ],
  targetAudience: "Alla som vill förbättra sin hälsa genom bättre kostval och lära sig om functional foods",
  coverImage: "/ulrika3.png",
  welcomeMessage: "Välkommen till Functional Basics! Jag heter Ulrika Davidsson och jag kommer att guida dig genom 6 veckor av hälsooptimering med functional foods. Tillsammans ska vi skapa hållbara vanor som förbättrar din hälsa på lång sikt.",
  introVideoUrl: "https://example.com/functional-basics-intro.mp4",
  enableCommunity: true,
  communityDescription: "Anslut dig till vår community för att dela erfarenheter, ställa frågor och få stöd från andra deltagare på din hälsoresa.",
  weeks: [
    {
      weekNumber: 1,
      title: "Introduktion till Functional Foods",
      description: "Lär dig grunderna och vad som gör ett livsmedel till ett functional food",
      goals: [
        "Läs grundmaterialet om Functional Foods",
        "Identifiera 3 functional foods i ditt kök",
        "Skriv ner dina nuvarande matvanor",
        "Sätt dina personliga hälsomål"
      ],
      mealPlan: {
        1: { 
          breakfast: { name: "Overnight oats med bär och nötter" },
          lunch: { name: "Quinoasallad med gröna bladgrönsaker" },
          dinner: { name: "Lax med sötsötpotatis och broccoli" }
        },
        2: { 
          breakfast: { name: "Smoothie bowl med spenat och frukt" },
          lunch: { name: "Linssoppa med grönsaker" },
          dinner: { name: "Kycklinggryta med rotfrukter" }
        },
        3: { 
          breakfast: { name: "Äggröra med avokado" },
          lunch: { name: "Sallad med valnötter och fetaost" },
          dinner: { name: "Torsk med quinoa och grönsaker" }
        },
        4: { 
          breakfast: { name: "Chia pudding med mango" },
          lunch: { name: "Wraps med hummus och grönsaker" },
          dinner: { name: "Böngryta med fullkornsbröd" }
        },
        5: { 
          breakfast: { name: "Grekisk yoghurt med granola" },
          lunch: { name: "Sushi bowl med lax" },
          dinner: { name: "Vegetarisk curry med ris" }
        },
        6: { 
          breakfast: { name: "Pannkakor av havremjöl" },
          lunch: { name: "Gazpacho med krutonger" },
          dinner: { name: "Grillad kyckling med sallad" }
        },
        7: { 
          breakfast: { name: "Müsli med färsk frukt" },
          lunch: { name: "Falafel med tzatziki" },
          dinner: { name: "Pasta med pesto och grönsaker" }
        }
      }
    },
    {
      weekNumber: 2,
      title: "Att välja rätt proteiner",
      description: "Förstå vikten av kvalitetsprotein och hur du integrerar det i din kost",
      goals: [
        "Välj rätt proteinkällor",
        "Ät fisk minst 2 gånger",
        "Testa nya vegetabiliska proteiner",
        "Kombinera protein med träning"
      ],
      mealPlan: {
        1: { 
          breakfast: { name: "Proteinrik smoothie med äggvita" },
          lunch: { name: "Laxsallad med quinoa" },
          dinner: { name: "Kött och böngryta" }
        },
        2: { 
          breakfast: { name: "Äggröra med cottage cheese" },
          lunch: { name: "Kycklingwrap med hummus" },
          dinner: { name: "Tonfisk med sötpotatis" }
        },
        3: { 
          breakfast: { name: "Kvarg med nötter och bär" },
          lunch: { name: "Bönbiffar med sallad" },
          dinner: { name: "Lammkött med rotfrukter" }
        },
        4: { 
          breakfast: { name: "Proteinpannkakor" },
          lunch: { name: "Räksallad med avokado" },
          dinner: { name: "Kycklinggryta med linser" }
        },
        5: { 
          breakfast: { name: "Grekisk yoghurt med proteinpulver" },
          lunch: { name: "Tofu-stir fry" },
          dinner: { name: "Fisk med quinoa" }
        },
        6: { 
          breakfast: { name: "Ägg benedict på fullkornsbröd" },
          lunch: { name: "Kycklingsallad med kikärter" },
          dinner: { name: "Vegetariska bönbiffar" }
        },
        7: { 
          breakfast: { name: "Proteinrik müsli" },
          lunch: { name: "Sushi med extra protein" },
          dinner: { name: "Grillad fisk med grönsaker" }
        }
      }
    },
    {
      weekNumber: 3,
      title: "Att välja rätt kolhydrater",
      description: "Lär dig skillnaden mellan komplexa och enkla kolhydrater",
      goals: [
        "Välj komplexa kolhydrater",
        "Inkludera rotfrukter",
        "Tajma kolhydratintag",
        "Undvik processade kolhydrater"
      ],
      mealPlan: {
        1: { 
          breakfast: { name: "Havregröt med frukt" },
          lunch: { name: "Fullkornspasta med grönsaker" },
          dinner: { name: "Quinoa med kyckling" }
        },
        2: { 
          breakfast: { name: "Fullkornsbröd med avokado" },
          lunch: { name: "Sötpotatissoppa" },
          dinner: { name: "Brun ris med fisk" }
        },
        3: { 
          breakfast: { name: "Müsli med havre" },
          lunch: { name: "Bulgursallad" },
          dinner: { name: "Bakad potatis med kött" }
        },
        4: { 
          breakfast: { name: "Smoothie bowl med havre" },
          lunch: { name: "Fullkornsris med tofu" },
          dinner: { name: "Sötpotatis med lax" }
        },
        5: { 
          breakfast: { name: "Overnight oats" },
          lunch: { name: "Quinoasallad" },
          dinner: { name: "Pasta med kött" }
        },
        6: { 
          breakfast: { name: "Äggröra med fullkornsbröd" },
          lunch: { name: "Bönor med ris" },
          dinner: { name: "Bakad sötpotatis" }
        },
        7: { 
          breakfast: { name: "Havrepannkakor" },
          lunch: { name: "Fullkornspizza" },
          dinner: { name: "Quinoa med grönsaker" }
        }
      }
    },
    {
      weekNumber: 4,
      title: "Functional Foods Topplista",
      description: "Upptäck de mest näringsrika functional foods och hur du använder dem",
      goals: [
        "Implementera topplistan",
        "Ät bär dagligen",
        "Konsumera avokado",
        "Testa svamp som superfood"
      ],
      mealPlan: {
        1: { 
          breakfast: { name: "Blåbärssmoothie med spenat" },
          lunch: { name: "Avokadotoast med ägg" },
          dinner: { name: "Shiitakesvamp med kyckling" }
        },
        2: { 
          breakfast: { name: "Açai bowl med bär" },
          lunch: { name: "Sallad med valnötter" },
          dinner: { name: "Lax med broccoli och quinoa" }
        },
        3: { 
          breakfast: { name: "Chia pudding med hallon" },
          lunch: { name: "Avokadosallad" },
          dinner: { name: "Svamprisotto" }
        },
        4: { 
          breakfast: { name: "Bärsmoothie med protein" },
          lunch: { name: "Quinoa bowl med avokado" },
          dinner: { name: "Grillad fisk med svamp" }
        },
        5: { 
          breakfast: { name: "Overnight oats med blåbär" },
          lunch: { name: "Guacamole med grönsaker" },
          dinner: { name: "Svamp- och böngryta" }
        },
        6: { 
          breakfast: { name: "Bärpannkakor" },
          lunch: { name: "Avokado- och räksallad" },
          dinner: { name: "Svampomelett" }
        },
        7: { 
          breakfast: { name: "Müsli med färska bär" },
          lunch: { name: "Avokado wrap" },
          dinner: { name: "Svamp stir-fry" }
        }
      }
    },
    {
      weekNumber: 5,
      title: "Fördelarna med Functional Foods",
      description: "Djupdyk i vetenskapen bakom functional foods och deras hälsoeffekter",
      goals: [
        "Förstå fördelarna djupare",
        "Lär dig om probiotika",
        "Inkludera fermenterade produkter",
        "Fokusera på hjärthälsa"
      ],
      mealPlan: {
        1: { 
          breakfast: { name: "Kefir smoothie" },
          lunch: { name: "Kimchi med ris" },
          dinner: { name: "Grillad lax med omega-3" }
        },
        2: { 
          breakfast: { name: "Yoghurt med probiotika" },
          lunch: { name: "Surkålssallad" },
          dinner: { name: "Hjärtfrisk fiskgryta" }
        },
        3: { 
          breakfast: { name: "Kombucha smoothie" },
          lunch: { name: "Fermenterad bönsallad" },
          dinner: { name: "Valnötter och fisk" }
        },
        4: { 
          breakfast: { name: "Probiotisk yoghurt" },
          lunch: { name: "Kimchi bowl" },
          dinner: { name: "Omega-3 rik middag" }
        },
        5: { 
          breakfast: { name: "Kefir med bär" },
          lunch: { name: "Fermenterade grönsaker" },
          dinner: { name: "Hjärtvänlig fisk" }
        },
        6: { 
          breakfast: { name: "Miso smoothie" },
          lunch: { name: "Surkål med protein" },
          dinner: { name: "Anti-inflammatorisk middag" }
        },
        7: { 
          breakfast: { name: "Probiotisk bowl" },
          lunch: { name: "Fermenterad lunch" },
          dinner: { name: "Hjärtfrisk avslutning" }
        }
      }
    },
    {
      weekNumber: 6,
      title: "Att komma igång",
      description: "Skapa hållbara rutiner och planera för framtiden",
      goals: [
        "Skapa din långsiktiga plan",
        "Optimera inköpslistan",
        "Utveckla matlagningsrutiner",
        "Sätt nya mål"
      ],
      mealPlan: {
        1: { 
          breakfast: { name: "Din perfekta frukost" },
          lunch: { name: "Hållbar lunch" },
          dinner: { name: "Framtidens middag" }
        },
        2: { 
          breakfast: { name: "Rutinfrukost" },
          lunch: { name: "Planerad lunch" },
          dinner: { name: "Hållbar middag" }
        },
        3: { 
          breakfast: { name: "Optimal start" },
          lunch: { name: "Balanserad lunch" },
          dinner: { name: "Näringsrik middag" }
        },
        4: { 
          breakfast: { name: "Energifrukost" },
          lunch: { name: "Kraftlunch" },
          dinner: { name: "Återhämtningsmiddag" }
        },
        5: { 
          breakfast: { name: "Välmående-frukost" },
          lunch: { name: "Hälsolunch" },
          dinner: { name: "Livskraftsmiddag" }
        },
        6: { 
          breakfast: { name: "Framgångsfrukost" },
          lunch: { name: "Vitalitetslunch" },
          dinner: { name: "Celebrationsmiddag" }
        },
        7: { 
          breakfast: { name: "Nya början-frukost" },
          lunch: { name: "Fortsättningslunch" },
          dinner: { name: "Framtidsmiddag" }
        }
      }
    }
  ],
  materials: [
    {
      title: "Vad är Functional Foods?",
      description: "Grundläggande introduktion till functional foods och deras roll i hälsa",
      category: "Grundläggande",
      readTime: "10 min",
      content: "Functional foods är livsmedel som, utöver sin grundläggande näringsinnehåll, innehåller bioaktiva föreningar som kan ha positiva effekter på hälsan..."
    },
    {
      title: "Att välja rätt proteiner",
      description: "Guide till proteinval och kvalitet",
      category: "Näringslära",
      readTime: "15 min",
      content: "Protein är en av de viktigaste makronutrienterna för vår hälsa. I denna guide lär du dig hur du väljer de bästa proteinkällorna..."
    },
    {
      title: "Att välja rätt kolhydrater",
      description: "Förstå skillnaden mellan enkla och komplexa kolhydrater",
      category: "Näringslära",
      readTime: "12 min",
      content: "Alla kolhydrater är inte skapade lika. Lär dig skillnaden mellan komplexa och enkla kolhydrater och hur de påverkar din hälsa..."
    },
    {
      title: "Functional Foods Topplista",
      description: "De 20 bästa functional foods för optimal hälsa",
      category: "Praktisk guide",
      readTime: "20 min",
      content: "Här är de 20 bästa functional foods som bör ingå i din kost för optimal hälsa och välmående..."
    },
    {
      title: "Fördelarna med Functional Foods",
      description: "Vetenskapliga bevis för functional foods hälsoeffekter",
      category: "Forskning",
      readTime: "18 min",
      content: "Forskning visar att functional foods kan ha betydande positiva effekter på hälsan. Här går vi igenom de viktigaste fördelarna..."
    },
    {
      title: "Att komma igång",
      description: "Praktisk guide för att implementera functional foods i vardagen",
      category: "Praktisk guide",
      readTime: "15 min",
      content: "Så här kommer du igång med functional foods på ett hållbart sätt som passar din livsstil..."
    }
  ],
  downloads: [
    {
      title: "Functional Foods Handbok",
      description: "Komplett guide med alla viktiga functional foods",
      category: "guide",
      fileUrl: "/downloads/functional-foods-handbook.pdf",
      fileSize: "2.3 MB"
    },
    {
      title: "Veckoplanering Mall",
      description: "Mall för att planera dina måltider med functional foods",
      category: "document",
      fileUrl: "/downloads/meal-planning-template.pdf",
      fileSize: "1.1 MB"
    },
    {
      title: "Inköpslista Functional Foods",
      description: "Färdig inköpslista med de viktigaste functional foods",
      category: "resource",
      fileUrl: "/downloads/shopping-list.pdf",
      fileSize: "0.8 MB"
    },
    {
      title: "Receptsamling",
      description: "30 enkla recept med functional foods",
      category: "guide",
      fileUrl: "/downloads/recipe-collection.pdf",
      fileSize: "4.2 MB"
    },
    {
      title: "Målsättningsguide",
      description: "Guide för att sätta och följa upp hälsomål",
      category: "document",
      fileUrl: "/downloads/goal-setting-guide.pdf",
      fileSize: "1.5 MB"
    }
  ]
};

async function importFunctionalBasics() {
  try {
    console.log('🚀 Importerar Functional Basics till databasen...');

    // Hitta eller skapa admin-användare
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.log('📝 Skapar admin-användare...');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@functional-foods.se',
          name: 'Ulrika Davidsson',
          role: 'admin'
        }
      });
    }

    // Kolla om kursen redan finns
    const existingCourse = await prisma.course.findFirst({
      where: { title: 'Functional Basics' }
    });

    if (existingCourse) {
      console.log('⚠️  Functional Basics finns redan i databasen');
      console.log(`📍 Kurs ID: ${existingCourse.id}`);
      return;
    }

    // Skapa kursen
    console.log('📚 Skapar Functional Basics-kursen...');
    const course = await prisma.course.create({
      data: {
        title: FUNCTIONAL_BASICS_COURSE.title,
        description: FUNCTIONAL_BASICS_COURSE.description,
        level: FUNCTIONAL_BASICS_COURSE.level,
        duration: FUNCTIONAL_BASICS_COURSE.duration,
        progress: 0,
        userId: adminUser.id,
        // Nya utökade fält
        price: FUNCTIONAL_BASICS_COURSE.price,
        objectives: FUNCTIONAL_BASICS_COURSE.objectives,
        targetAudience: FUNCTIONAL_BASICS_COURSE.targetAudience,
        coverImage: FUNCTIONAL_BASICS_COURSE.coverImage,
        welcomeMessage: FUNCTIONAL_BASICS_COURSE.welcomeMessage,
        introVideoUrl: FUNCTIONAL_BASICS_COURSE.introVideoUrl,
        enableCommunity: FUNCTIONAL_BASICS_COURSE.enableCommunity,
        communityDescription: FUNCTIONAL_BASICS_COURSE.communityDescription,
        weeks: FUNCTIONAL_BASICS_COURSE.weeks,
        materials: FUNCTIONAL_BASICS_COURSE.materials,
        downloads: FUNCTIONAL_BASICS_COURSE.downloads
      }
    });

    console.log('✅ Functional Basics har importerats!');
    console.log(`📍 Kurs ID: ${course.id}`);
    console.log(`📅 Skapad: ${course.createdAt}`);
    console.log(`👤 Skapad av: ${adminUser.name} (${adminUser.email})`);

    // Visa sammanfattning
    console.log('\n📊 SAMMANFATTNING:');
    console.log(`📚 Titel: ${course.title}`);
    console.log(`⏱️  Längd: ${course.duration}`);
    console.log(`📈 Nivå: ${course.level}`);
    console.log(`💰 Pris: ${FUNCTIONAL_BASICS_COURSE.price} SEK`);
    console.log(`📖 Veckor: ${FUNCTIONAL_BASICS_COURSE.weeks.length}`);
    console.log(`📄 Material: ${FUNCTIONAL_BASICS_COURSE.materials.length}`);
    console.log(`📥 Nedladdningar: ${FUNCTIONAL_BASICS_COURSE.downloads.length}`);

  } catch (error) {
    console.error('❌ Fel vid import av Functional Basics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Kör import
if (require.main === module) {
  importFunctionalBasics()
    .then(() => {
      console.log('\n🎉 Import slutförd!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import misslyckades:', error);
      process.exit(1);
    });
}

module.exports = { importFunctionalBasics, FUNCTIONAL_BASICS_COURSE }; 