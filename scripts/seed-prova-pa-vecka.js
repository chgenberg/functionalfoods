// Script to seed "Prova på vecka med Functional Foods!" course
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Prova på vecka course...\n');

  const courseCode = 'prova-pa-vecka';
  const courseName = 'Prova på vecka med Functional Foods!';

  // 1. Create CourseProduct
  console.log('📦 Creating CourseProduct...');
  
  const existingProduct = await prisma.courseProduct.findFirst({
    where: { name: courseName }
  });

  let product;
  if (existingProduct) {
    console.log('  ✅ CourseProduct already exists, updating...');
    product = await prisma.courseProduct.update({
      where: { id: existingProduct.id },
      data: {
        description: 'En prova-på-kurs med ett urval av functional foods-recept som ger dig en stabil och inspirerande start. Du får grunderna i hur du enkelt kommer igång och lär dig hur mervärdesmat påverkar kroppen – du kommer att märka skillnad!',
        price: 0,
        basePrice: 0,
        welcomeText: `Välkommen till Prova-på-veckan med Functional Foods! 

Den här veckan får du en inspirerande introduktion till Functional Foods – genom ett noga utvalt urval av recept som ger dig en stabil och näringsrik start. Här får du grunderna för hur du enkelt kommer igång med mat som gör verklig skillnad för både kropp och energi. 

I alla Ulrikas kurser ligger fokus på Functional Foods – mat som stöttar både kropp och själ. Vi är övertygade om att du kommer att känna skillnad redan under denna vecka. 

Eftersom planering är en av nycklarna till bättre hälsa och jämn energi har vi gjort det enkelt för dig. Du får ett färdigt kostschema, smakrika och lättlagade recept samt en praktisk inköpslista – allt för att veckan ska bli smidig, njutbar och näringsrik.

Vi hoppas att denna vecka ska inspirera dig till nya vanor och ge dig en känsla för hur functional foods kan bli en naturlig del av din vardag.

/Ulrika`,
        overviewVideoUrl: 'https://vimeo.com/1156756899',
        content: {
          slug: courseCode,
          isDraft: false,
          coverImage: '/kurser/prova-pa/prova-pa.png',
          objectives: [
            'Minskar sötsuget',
            'Ökad energi',
            'Grundläggande kunskap inom functional foods',
            'Förstå hur maten påverkar din kropp',
            'Lära dig laga snabb och näringsrik mat'
          ],
          targetAudience: 'För dig som är nyfiken på och vill lära dig mer om functional foods och som vill förstå hur mervärdesmat kan stötta kroppen, energin och välmåendet i vardagen.',
          level: 'Nybörjare',
          duration: '7 dagar',
          weeksCount: 1,
          enableCommunity: true,
          communityUrl: 'https://www.facebook.com/groups/provapavecka/',
          communityDescription: 'Välkommen till din Prova på-vecka med Functional Foods! 🌿 Denna grupp är skapad för dig som vill testa hur functional foods mat kan göra skillnad för din hälsa, energi och välmående. Här får du daglig kontakt med teamet, kan ställa frågor, dela dina framsteg och hämta inspiration!',
          metaTitle: 'Prova på Functional Foods – Gratis vecka med recept',
          metaDescription: 'Upptäck Functional Foods under en gratis prova-på-vecka. Färdigt kostschema, recept, inköpslista och stöd i Facebookgrupp.',
          weekDocumentMap: {
            '1': ['vad-a-r-functional-foods', 'topplista-med-functional-foods', 'att-a-ta-ute-med-functional-foods']
          },
          builderData: {
            title: courseName,
            description: 'En prova-på-kurs med ett urval av functional foods-recept som ger dig en stabil och inspirerande start.',
            price: 0,
            duration: '7 dagar',
            weeksCount: 1,
            level: 'Nybörjare',
            targetAudience: 'För dig som är nyfiken på och vill lära dig mer om functional foods och som vill förstå hur mervärdesmat kan stötta kroppen, energin och välmåendet i vardagen.',
            objectives: [
              'Minskar sötsuget',
              'Ökad energi',
              'Grundläggande kunskap inom functional foods',
              'Förstå hur maten påverkar din kropp',
              'Lära dig laga snabb och näringsrik mat'
            ],
            features: [
              '7 dagars kostschema med dagliga måltidsplaner',
              'Färdig inköpslista för hela veckan',
              '15 näringsrika recept',
              '3 kunskapsdokument om functional foods',
              'Tillgång till Facebook-community med daglig kontakt'
            ],
            coverImage: '/kurser/prova-pa/prova-pa.png',
            introVideoUrl: 'https://vimeo.com/1156756899',
            welcomeMessage: `Välkommen till Prova-på-veckan med Functional Foods! 

Den här veckan får du en inspirerande introduktion till Functional Foods – genom ett noga utvalt urval av recept som ger dig en stabil och näringsrik start. Här får du grunderna för hur du enkelt kommer igång med mat som gör verklig skillnad för både kropp och energi. 

I alla Ulrikas kurser ligger fokus på Functional Foods – mat som stöttar både kropp och själ. Vi är övertygade om att du kommer att känna skillnad redan under denna vecka. 

Eftersom planering är en av nycklarna till bättre hälsa och jämn energi har vi gjort det enkelt för dig. Du får ett färdigt kostschema, smakrika och lättlagade recept samt en praktisk inköpslista – allt för att veckan ska bli smidig, njutbar och näringsrik.

Vi hoppas att denna vecka ska inspirera dig till nya vanor och ge dig en känsla för hur functional foods kan bli en naturlig del av din vardag.

/Ulrika`,
            enableCommunity: true,
            communityDescription: 'Välkommen till din Prova på-vecka med Functional Foods! 🌿 Denna grupp är skapad för dig som vill testa hur functional foods mat kan göra skillnad för din hälsa, energi och välmående. Här får du daglig kontakt med teamet, kan ställa frågor, dela dina framsteg och hämta inspiration!',
            weeks: [{
              weekNumber: 1,
              title: 'Prova på-veckan',
              description: 'Din introduktion till Functional Foods',
              knowledgeDocuments: [
                { slug: 'vad-a-r-functional-foods', title: 'Vad är functional foods?' },
                { slug: 'topplista-med-functional-foods', title: 'Topplista med functional foods' },
                { slug: 'att-a-ta-ute-med-functional-foods', title: 'Att äta ute med functional foods' }
              ]
            }],
            currentStep: 5
          }
        },
        features: [
          '7 dagars kostschema med dagliga måltidsplaner',
          'Färdig inköpslista för hela veckan',
          '15 näringsrika recept',
          '3 kunskapsdokument om functional foods',
          'Tillgång till Facebook-community med daglig kontakt'
        ]
      }
    });
  } else {
    product = await prisma.courseProduct.create({
      data: {
        name: courseName,
        description: 'En prova-på-kurs med ett urval av functional foods-recept som ger dig en stabil och inspirerande start. Du får grunderna i hur du enkelt kommer igång och lär dig hur mervärdesmat påverkar kroppen – du kommer att märka skillnad!',
        price: 0,
        basePrice: 0,
        welcomeText: `Välkommen till Prova-på-veckan med Functional Foods! 

Den här veckan får du en inspirerande introduktion till Functional Foods – genom ett noga utvalt urval av recept som ger dig en stabil och näringsrik start. Här får du grunderna för hur du enkelt kommer igång med mat som gör verklig skillnad för både kropp och energi. 

I alla Ulrikas kurser ligger fokus på Functional Foods – mat som stöttar både kropp och själ. Vi är övertygade om att du kommer att känna skillnad redan under denna vecka. 

Eftersom planering är en av nycklarna till bättre hälsa och jämn energi har vi gjort det enkelt för dig. Du får ett färdigt kostschema, smakrika och lättlagade recept samt en praktisk inköpslista – allt för att veckan ska bli smidig, njutbar och näringsrik.

Vi hoppas att denna vecka ska inspirera dig till nya vanor och ge dig en känsla för hur functional foods kan bli en naturlig del av din vardag.

/Ulrika`,
        overviewVideoUrl: 'https://vimeo.com/1156756899',
        content: {
          slug: courseCode,
          isDraft: false,
          coverImage: '/kurser/prova-pa/prova-pa.png',
          objectives: [
            'Minskar sötsuget',
            'Ökad energi',
            'Grundläggande kunskap inom functional foods',
            'Förstå hur maten påverkar din kropp',
            'Lära dig laga snabb och näringsrik mat'
          ],
          targetAudience: 'För dig som är nyfiken på och vill lära dig mer om functional foods och som vill förstå hur mervärdesmat kan stötta kroppen, energin och välmåendet i vardagen.',
          level: 'Nybörjare',
          duration: '7 dagar',
          weeksCount: 1,
          enableCommunity: true,
          communityUrl: 'https://www.facebook.com/groups/provapavecka/',
          communityDescription: 'Välkommen till din Prova på-vecka med Functional Foods! 🌿 Denna grupp är skapad för dig som vill testa hur functional foods mat kan göra skillnad för din hälsa, energi och välmående. Här får du daglig kontakt med teamet, kan ställa frågor, dela dina framsteg och hämta inspiration!',
          metaTitle: 'Prova på Functional Foods – Gratis vecka med recept',
          metaDescription: 'Upptäck Functional Foods under en gratis prova-på-vecka. Färdigt kostschema, recept, inköpslista och stöd i Facebookgrupp.',
          weekDocumentMap: {
            '1': ['vad-a-r-functional-foods', 'topplista-med-functional-foods', 'att-a-ta-ute-med-functional-foods']
          },
          builderData: {
            title: courseName,
            description: 'En prova-på-kurs med ett urval av functional foods-recept som ger dig en stabil och inspirerande start.',
            price: 0,
            duration: '7 dagar',
            weeksCount: 1,
            level: 'Nybörjare',
            targetAudience: 'För dig som är nyfiken på och vill lära dig mer om functional foods och som vill förstå hur mervärdesmat kan stötta kroppen, energin och välmåendet i vardagen.',
            objectives: [
              'Minskar sötsuget',
              'Ökad energi',
              'Grundläggande kunskap inom functional foods',
              'Förstå hur maten påverkar din kropp',
              'Lära dig laga snabb och näringsrik mat'
            ],
            features: [
              '7 dagars kostschema med dagliga måltidsplaner',
              'Färdig inköpslista för hela veckan',
              '15 näringsrika recept',
              '3 kunskapsdokument om functional foods',
              'Tillgång till Facebook-community med daglig kontakt'
            ],
            coverImage: '/kurser/prova-pa/prova-pa.png',
            introVideoUrl: 'https://vimeo.com/1156756899',
            welcomeMessage: `Välkommen till Prova-på-veckan med Functional Foods!`,
            enableCommunity: true,
            communityDescription: 'Välkommen till din Prova på-vecka med Functional Foods! 🌿',
            weeks: [{
              weekNumber: 1,
              title: 'Prova på-veckan',
              description: 'Din introduktion till Functional Foods',
              knowledgeDocuments: [
                { slug: 'vad-a-r-functional-foods', title: 'Vad är functional foods?' },
                { slug: 'topplista-med-functional-foods', title: 'Topplista med functional foods' },
                { slug: 'att-a-ta-ute-med-functional-foods', title: 'Att äta ute med functional foods' }
              ]
            }],
            currentStep: 5
          }
        },
        features: [
          '7 dagars kostschema med dagliga måltidsplaner',
          'Färdig inköpslista för hela veckan',
          '15 näringsrika recept',
          '3 kunskapsdokument om functional foods',
          'Tillgång till Facebook-community med daglig kontakt'
        ]
      }
    });
    console.log('  ✅ CourseProduct created:', product.id);
  }

  // 2. Create MealPlanWeek
  console.log('\n📅 Creating MealPlanWeek...');
  
  const mealPlanData = {
    Måndag: {
      breakfast: { name: 'Keso med bovetegranola', recipeLink: '/kunskapsbank/recept/keso-med-bovetegranola' },
      lunch: { name: 'Omelett med paprika och champinjoner', recipeLink: '/kunskapsbank/recept/omelett-med-paprika-och-champinjoner' },
      dinner: { name: 'Grönsakswok med kycklingfärs', recipeLink: '/kunskapsbank/recept/gronsakswok-med-kycklingfars' },
      snack: { name: 'Bovetegranola', recipeLink: '/kunskapsbank/recept/bovetegranola' }
    },
    Tisdag: {
      breakfast: { name: 'Omelettrulle', recipeLink: '/kunskapsbank/recept/omelettrulle' },
      lunch: { name: 'Grönsakswok med kycklingfärs (rester)', recipeLink: '/kunskapsbank/recept/gronsakswok-med-kycklingfars' },
      dinner: { name: 'Torsk med guacamole och sötpotatis', recipeLink: '/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis' }
    },
    Onsdag: {
      breakfast: { name: 'Omelettrulle (rester)', recipeLink: '/kunskapsbank/recept/omelettrulle' },
      lunch: { name: 'Torsk med guacamole och sötpotatis (rester)', recipeLink: '/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis' },
      dinner: { name: 'Varm tacosallad', recipeLink: '/kunskapsbank/recept/varm-tacosallad' }
    },
    Torsdag: {
      breakfast: { name: 'Choklad- och kokoschiapudding', recipeLink: '/kunskapsbank/recept/choklad-och-kokoschiapudding' },
      lunch: { name: 'Varm tacosallad (rester)', recipeLink: '/kunskapsbank/recept/varm-tacosallad' },
      dinner: { name: 'Ugnsbakad blomkål med ratatouille', recipeLink: '/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille' }
    },
    Fredag: {
      breakfast: { name: 'Bananpannkaka med keso, blåbär och mango', recipeLink: '/kunskapsbank/recept/bananpannkaka-med-keso-blabar-och-mango' },
      lunch: { name: 'Ugnsbakad blomkål med ratatouille (rester)', recipeLink: '/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille' },
      dinner: { name: 'Nötgryta med rotfrukter', recipeLink: '/kunskapsbank/recept/notgryta-med-rotfrukter' }
    },
    Lördag: {
      breakfast: { name: 'Grön juice', recipeLink: '/kunskapsbank/recept/gron-juice' },
      lunch: { name: 'Nötgryta med rotfrukter (rester)', recipeLink: '/kunskapsbank/recept/notgryta-med-rotfrukter' },
      dinner: { name: 'Fisktaco med mangosalsa och sesamsås', recipeLink: '/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas' },
      dessert: { name: 'Blodapelsin med vit chokladkräm', recipeLink: '/kunskapsbank/recept/blodapelsin-med-vit-chokladkram' }
    },
    Söndag: {
      breakfast: { name: 'Grön juice (rester)', recipeLink: '/kunskapsbank/recept/gron-juice' },
      lunch: { name: 'Fisktaco med mangosalsa och sesamsås (rester)', recipeLink: '/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas' },
      dinner: { name: 'Kalkonbolognese med morotspasta', recipeLink: '/kunskapsbank/recept/kalkonbolognese-med-morotspasta' }
    }
  };

  const existingMealPlan = await prisma.mealPlanWeek.findUnique({
    where: { course_weekNumber: { course: courseCode, weekNumber: 1 } }
  });

  if (existingMealPlan) {
    await prisma.mealPlanWeek.update({
      where: { id: existingMealPlan.id },
      data: {
        title: 'Prova på-veckan',
        days: mealPlanData
      }
    });
    console.log('  ✅ MealPlanWeek updated');
  } else {
    await prisma.mealPlanWeek.create({
      data: {
        course: courseCode,
        weekNumber: 1,
        title: 'Prova på-veckan',
        days: mealPlanData
      }
    });
    console.log('  ✅ MealPlanWeek created');
  }

  // 3. Create CourseWeekMeta
  console.log('\n📝 Creating CourseWeekMeta...');
  
  const existingWeekMeta = await prisma.courseWeekMeta.findUnique({
    where: { course_weekNumber: { course: courseCode, weekNumber: 1 } }
  });

  if (existingWeekMeta) {
    await prisma.courseWeekMeta.update({
      where: { id: existingWeekMeta.id },
      data: {
        weekTitle: 'Prova på-veckan',
        weekSubtitle: 'Din introduktion till Functional Foods',
        heroImage: '/kurser/prova-pa/prova-pa.png',
        videoUrl: 'https://vimeo.com/1156756899',
        welcomeMessage: `Välkommen till Prova-på-veckan med Functional Foods! 

Den här veckan får du en inspirerande introduktion till Functional Foods – genom ett noga utvalt urval av recept som ger dig en stabil och näringsrik start.`,
        mainContent: `Under den här veckan kommer du att:
- Lära dig grunderna i functional foods
- Följa ett komplett kostschema med näringsrika recept
- Känna skillnad i energi och välmående`,
        keyTakeaways: [
          'Förstå vad functional foods är och hur det påverkar kroppen',
          'Prova näringsrika recept som stabiliserar blodsockret',
          'Upplev fördelarna med antiinflammatorisk kost'
        ],
        weeklyChallenge: 'Följ kostschemat så noga som möjligt och notera hur du mår varje dag.',
        reflectionQuestions: [
          'Hur har din energinivå förändrats under veckan?',
          'Vilka recept var dina favoriter?',
          'Har du märkt någon skillnad i ditt sötsug?'
        ]
      }
    });
    console.log('  ✅ CourseWeekMeta updated');
  } else {
    await prisma.courseWeekMeta.create({
      data: {
        course: courseCode,
        weekNumber: 1,
        weekTitle: 'Prova på-veckan',
        weekSubtitle: 'Din introduktion till Functional Foods',
        heroImage: '/kurser/prova-pa/prova-pa.png',
        videoUrl: 'https://vimeo.com/1156756899',
        welcomeMessage: `Välkommen till Prova-på-veckan med Functional Foods! 

Den här veckan får du en inspirerande introduktion till Functional Foods – genom ett noga utvalt urval av recept som ger dig en stabil och näringsrik start.`,
        mainContent: `Under den här veckan kommer du att:
- Lära dig grunderna i functional foods
- Följa ett komplett kostschema med näringsrika recept
- Känna skillnad i energi och välmående`,
        keyTakeaways: [
          'Förstå vad functional foods är och hur det påverkar kroppen',
          'Prova näringsrika recept som stabiliserar blodsockret',
          'Upplev fördelarna med antiinflammatorisk kost'
        ],
        weeklyChallenge: 'Följ kostschemat så noga som möjligt och notera hur du mår varje dag.',
        reflectionQuestions: [
          'Hur har din energinivå förändrats under veckan?',
          'Vilka recept var dina favoriter?',
          'Har du märkt någon skillnad i ditt sötsug?'
        ]
      }
    });
    console.log('  ✅ CourseWeekMeta created');
  }

  console.log('\n✨ Prova på vecka course seeded successfully!');
  console.log(`\n📊 Summary:
  - CourseProduct ID: ${product.id}
  - Course code: ${courseCode}
  - Price: 0 SEK (Gratis)
  - Duration: 7 dagar (1 vecka)
  - Recipes: 15
  - Knowledge documents: 3
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding course:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
