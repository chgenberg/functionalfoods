const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create forum categories
  const categories = [
    {
      name: 'Recept & Kost',
      description: 'Dela dina favoritrecept och diskutera functional foods',
      color: 'green',
      icon: 'utensils',
      order: 1
    },
    {
      name: 'Kurser & Utbildning',
      description: 'Diskussioner om kurserna och dina lärdomar',
      color: 'blue',
      icon: 'book',
      order: 2
    },
    {
      name: 'Hälsa & Välmående',
      description: 'Allmän hälsodiskussion och tips',
      color: 'purple',
      icon: 'heart',
      order: 3
    },
    {
      name: 'Kosttillskott',
      description: 'Rekommendationer och erfarenheter av kosttillskott',
      color: 'orange',
      icon: 'pill',
      order: 4
    },
    {
      name: 'Träning & Motion',
      description: 'Träningsrutiner och fysisk aktivitet',
      color: 'red',
      icon: 'activity',
      order: 5
    },
    {
      name: 'Allmänt',
      description: 'Övriga diskussioner och community-chat',
      color: 'gray',
      icon: 'message-circle',
      order: 6
    }
  ];

  for (const category of categories) {
    await prisma.forumCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('Forum categories seeded!');

  // Skapa admin-användare
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@functionalfoods.se' },
    update: {},
    create: {
      email: 'admin@functionalfoods.se',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Skapa testkonton med olika behörighetsnivåer
  
  // 1. Gratis användare (ingen kurs köpt)
  const freeUserPassword = await bcrypt.hash('gratis123', 10);
  const freeUser = await prisma.user.upsert({
    where: { email: 'gratis@test.se' },
    update: {},
    create: {
      email: 'gratis@test.se',
      name: 'Gratis Användare',
      password: freeUserPassword,
      role: 'customer',
    },
  });

  // 2. Functional Flow användare
  const flowUserPassword = await bcrypt.hash('flow123', 10);
  const flowUser = await prisma.user.upsert({
    where: { email: 'flow@test.se' },
    update: {},
    create: {
      email: 'flow@test.se',
      name: 'Flow Användare',
      password: flowUserPassword,
      role: 'customer',
    },
  });

  // 3. Functional Basics användare
  const basicsUserPassword = await bcrypt.hash('basics123', 10);
  const basicsUser = await prisma.user.upsert({
    where: { email: 'basics@test.se' },
    update: {},
    create: {
      email: 'basics@test.se',
      name: 'Basics Användare',
      password: basicsUserPassword,
      role: 'customer',
    },
  });

  // Skapa kurser
  const functionalFlow = await prisma.courseProduct.upsert({
    where: { name: 'Functional Flow' },
    update: {},
    create: {
      name: 'Functional Flow',
      description: 'Avancerad kurs i functional foods och optimal hälsa',
      price: 2995,
      features: [
        'Tillgång till alla kursvideor',
        'Nedladdningsbara PDF-material',
        'Veckovisa live Q&A sessioner',
        'Certifikat vid slutförande',
        'Livstidsåtkomst'
      ],
      content: {
        videos: [
          {
            id: 'video1',
            title: 'Introduktion till Functional Flow',
            url: 'https://example.com/videos/intro.mp4',
            duration: '45 min',
            description: 'Välkommen till kursen! Lär dig grunderna.'
          },
          {
            id: 'video2',
            title: 'Näringsoptimering för energi',
            url: 'https://example.com/videos/nutrition.mp4',
            duration: '60 min',
            description: 'Djupdykning i hur du optimerar din kost.'
          },
          {
            id: 'video3',
            title: 'Functional Foods i praktiken',
            url: 'https://example.com/videos/practice.mp4',
            duration: '55 min',
            description: 'Praktiska tips och recept.'
          }
        ],
        pdfs: [
          {
            id: 'pdf1',
            title: 'Functional Flow Kurshandbok',
            url: '/pdfs/functional-flow-handbook.pdf',
            pages: 120
          },
          {
            id: 'pdf2',
            title: 'Receptsamling',
            url: '/pdfs/recipes.pdf',
            pages: 45
          },
          {
            id: 'pdf3',
            title: 'Veckoplanering',
            url: '/pdfs/weekly-planning.pdf',
            pages: 20
          }
        ]
      }
    }
  });

  const functionalBasics = await prisma.courseProduct.upsert({
    where: { name: 'Functional Basics' },
    update: {},
    create: {
      name: 'Functional Basics',
      description: 'Grundkurs i functional foods för nybörjare',
      price: 1495,
      features: [
        'Grundläggande kursvideor',
        'PDF-startkit',
        'Månadsvis Q&A',
        'Certifikat vid slutförande'
      ],
      content: {
        videos: [
          {
            id: 'video1',
            title: 'Vad är Functional Foods?',
            url: 'https://example.com/videos/basics-intro.mp4',
            duration: '30 min',
            description: 'En introduktion till functional foods.'
          },
          {
            id: 'video2',
            title: 'Kom igång med functional foods',
            url: 'https://example.com/videos/getting-started.mp4',
            duration: '40 min',
            description: 'Dina första steg mot bättre hälsa.'
          }
        ],
        pdfs: [
          {
            id: 'pdf1',
            title: 'Functional Basics Guide',
            url: '/pdfs/basics-guide.pdf',
            pages: 50
          }
        ]
      }
    }
  });

  // Skapa köp för användarna
  
  // Flow-användaren köper Functional Flow
  const flowPurchase = await prisma.purchase.upsert({
    where: {
      userId_courseId: {
        userId: flowUser.id,
        courseId: functionalFlow.id
      }
    },
    update: {},
    create: {
      userId: flowUser.id,
      courseId: functionalFlow.id,
      amount: functionalFlow.price,
      status: 'completed'
    }
  });

  // Basics-användaren köper Functional Basics
  const basicsPurchase = await prisma.purchase.upsert({
    where: {
      userId_courseId: {
        userId: basicsUser.id,
        courseId: functionalBasics.id
      }
    },
    update: {},
    create: {
      userId: basicsUser.id,
      courseId: functionalBasics.id,
      amount: functionalBasics.price,
      status: 'completed'
    }
  });

  // Gratis användaren har inga köp

  console.log('=== TESTKONTON SKAPADE ===');
  console.log('1. Gratis användare:');
  console.log('   Email: gratis@test.se');
  console.log('   Lösenord: gratis123');
  console.log('   Tillgång: Endast gratis innehåll');
  console.log('');
  console.log('2. Functional Flow användare:');
  console.log('   Email: flow@test.se');
  console.log('   Lösenord: flow123');
  console.log('   Tillgång: Functional Flow kurs + alla premium recept');
  console.log('');
  console.log('3. Functional Basics användare:');
  console.log('   Email: basics@test.se');
  console.log('   Lösenord: basics123');
  console.log('   Tillgång: Functional Basics kurs + alla premium recept');
  console.log('');
  // Dummy recensioner
  await prisma.courseReview.createMany({ skipDuplicates: true, data: [
    { userId: flowUser.id, courseId: 'functional-flow', rating: 5, consent: true, status: 'APPROVED', answers: [
      { q: 'Levde kursen upp till dina förväntningar?', a: 'Absolut, överträffade dem. Jag känner mig piggare och mer fokuserad.' },
      { q: 'Mest värdefulla lärdom?', a: 'Att planera mina måltider med funktionella råvaror – enorm skillnad.' },
      { q: 'Påverkan på matvanor/energi/hälsa?', a: 'Mer stabil energi hela dagen och jämnare blodsocker.' },
      { q: 'Upplägg/innehåll/pedagogik? Rekommenderar du?', a: 'Tydligt, inspirerande och konkret. Rekommenderar varmt till alla.' }
    ] },
    { userId: basicsUser.id, courseId: 'functional-basics', rating: 5, consent: true, status: 'APPROVED', answers: [
      { q: 'Levde kursen upp till dina förväntningar?', a: 'Ja, jag fick äntligen en enkel struktur som fungerar i vardagen.' },
      { q: 'Mest värdefulla lärdom?', a: 'Små dagliga val gör stor skillnad – och hur jag sätter ihop måltider.' },
      { q: 'Påverkan på matvanor/energi/hälsa?', a: 'Mindre sötsug och bättre sömn redan efter två veckor.' },
      { q: 'Upplägg/innehåll/pedagogik? Rekommenderar du?', a: 'Väldigt lätt att följa. Fem stjärnor!' }
    ] },
    { userId: admin.id, courseId: 'functional-basics', rating: 5, consent: true, status: 'APPROVED', answers: [
      { q: 'Levde kursen upp till dina förväntningar?', a: 'Ja – tydligt, forskningsbaserat och praktiskt.' },
      { q: 'Mest värdefulla lärdom?', a: 'Hur jag kan optimera min kost utan att komplicera livet.' },
      { q: 'Påverkan på matvanor/energi/hälsa?', a: 'Mer jämn energi och bättre fokus under arbetsdagen.' },
      { q: 'Upplägg/innehåll/pedagogik? Rekommenderar du?', a: 'Strålande upplägg. Rekommenderas starkt.' }
    ] },
  ]});
  console.log('Dummy-recensioner skapade');
  console.log('Admin:');
  console.log('   Email: admin@functionalfoods.se');
  console.log('   Lösenord: admin123');
  console.log('   Tillgång: Administratörsrättigheter');

  console.log({ admin, freeUser, flowUser, basicsUser, functionalFlow, functionalBasics, flowPurchase, basicsPurchase });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 