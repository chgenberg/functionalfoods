const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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

  // Skapa test-kund
  const customerPassword = await bcrypt.hash('test123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: customerPassword,
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

  // Skapa ett köp för test-användaren
  const purchase = await prisma.purchase.create({
    data: {
      userId: customer.id,
      courseId: functionalFlow.id,
      amount: functionalFlow.price,
      status: 'completed'
    }
  });

  console.log({ admin, customer, functionalFlow, functionalBasics, purchase });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 