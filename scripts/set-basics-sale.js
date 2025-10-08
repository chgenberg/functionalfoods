/*
  Set Functional Basics sale price to 1147 SEK (incl. VAT), starting now.
  Keeps basePrice as-is; only updates salePrice/saleStartsAt/saleEndsAt.
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const VAT = 0.25;
  const saleIncl = 1147; // SEK incl. VAT
  const saleExcl = Math.round((saleIncl / (1 + VAT)) * 100) / 100; // ex VAT

  const course = await prisma.courseProduct.findFirst({
    where: { name: { contains: 'Functional Basic', mode: 'insensitive' } },
  });

  if (!course) {
    console.log('❌ Course "Functional Basics" not found');
    return;
  }

  await prisma.courseProduct.update({
    where: { id: course.id },
    data: {
      salePrice: saleExcl,
      saleStartsAt: new Date(),
      saleEndsAt: null,
    },
  });

  const updated = await prisma.courseProduct.findUnique({ where: { id: course.id } });
  const toIncl = (v) => Math.round(v * (1 + VAT));

  console.log('✅ Updated Functional Basics pricing:');
  console.log({
    name: updated.name,
    basePriceExcl: updated.basePrice,
    basePriceIncl: toIncl(updated.basePrice || 0),
    salePriceExcl: updated.salePrice,
    salePriceIncl: toIncl(updated.salePrice || 0),
    saleStartsAt: updated.saleStartsAt,
    saleEndsAt: updated.saleEndsAt,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


