import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Ensuring Eva Gråby has both Flow and Basics...');

  // Try direct known email first
  let user = await prisma.user.findUnique({
    where: { email: 'eva.graby@gmail.com' },
    include: { purchases: { include: { course: true } } }
  });

  if (!user) {
    // Fallback: search by name/email contains eva / graby
    const candidates = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'eva', mode: 'insensitive' } },
          { name: { contains: 'eva', mode: 'insensitive' } },
          { email: { contains: 'graby', mode: 'insensitive' } },
          { name: { contains: 'gråby', mode: 'insensitive' } },
          { name: { contains: 'graby', mode: 'insensitive' } },
        ]
      },
      include: { purchases: { include: { course: true } } }
    });

    // Prefer one that clearly matches Gråby
    const prioritized = candidates.find(c =>
      (c.email?.toLowerCase().includes('graby')) || (c.name?.toLowerCase().includes('gråby')) || (c.name?.toLowerCase().includes('graby'))
    ) || candidates[0];

    user = prioritized || null as any;

    if (!user) {
      console.log('❌ Hittade ingen användare som matchar Eva');
      console.log('Tips: sätt miljövariabel EVA_EMAIL och kör igen.');
      return;
    }
  }

  console.log(`✅ Användare: ${user.name || ''} <${user.email}>`);
  const currentCourses = user.purchases.map(p => p.course?.name).filter(Boolean) as string[];
  console.log('Nuvarande kurser:', currentCourses.join(', ') || '(inga)');

  // Fetch course products
  const basics = await prisma.courseProduct.findFirst({ where: { name: { contains: 'Functional Basics', mode: 'insensitive' } } });
  const flow = await prisma.courseProduct.findFirst({ 
    where: { OR: [
      { name: { contains: 'Functional Gut Health/Flow', mode: 'insensitive' } },
      { name: { contains: 'Functional Flow', mode: 'insensitive' } },
    ] } 
  });

  if (!basics && !flow) {
    console.log('❌ Kunde inte hitta kurserna Functional Basics eller Functional Flow i databasen');
    return;
  }

  const ops: Promise<any>[] = [];

  const hasBasics = !!user.purchases.find(p => p.course?.name?.toLowerCase().includes('basics'));
  const hasFlow = !!user.purchases.find(p => p.course?.name?.toLowerCase().includes('flow'));

  const accessExpiresAt = new Date();
  accessExpiresAt.setFullYear(accessExpiresAt.getFullYear() + 1);

  if (basics && !hasBasics) {
    console.log('➕ Lägger till Functional Basics...');
    ops.push(prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: basics.id,
        amount: 0,
        status: 'completed',
        accessExpiresAt
      }
    }));
  } else if (hasBasics) {
    console.log('✅ Har redan Functional Basics');
  }

  if (flow && !hasFlow) {
    console.log('➕ Lägger till Functional Flow...');
    ops.push(prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: flow.id,
        amount: 0,
        status: 'completed',
        accessExpiresAt
      }
    }));
  } else if (hasFlow) {
    console.log('✅ Har redan Functional Flow');
  }

  if (ops.length === 0) {
    console.log('\n✅ Inget att uppdatera. Eva har redan båda kurserna.');
  } else {
    await prisma.$transaction(ops as any);
    console.log('\n🎉 Klart! Kurserna har lagts till.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


