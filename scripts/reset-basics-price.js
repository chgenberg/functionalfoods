/*
  Reset Functional Basics price to normal: 2295 SEK (incl. VAT)
  Sets basePrice, clears salePrice/saleStartsAt/saleEndsAt
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const VAT = 0.25;
  const normalIncl = 2295; // SEK incl. VAT
  const normalExcl = Math.round((normalIncl / (1 + VAT)) * 100) / 100; // ex VAT

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
      price: normalExcl,
      basePrice: normalExcl,
      salePrice: null,
      saleStartsAt: null,
      saleEndsAt: null,
    },
  });

  const updated = await prisma.courseProduct.findUnique({ where: { id: course.id } });
  const toIncl = (v) => Math.round(v * (1 + VAT));

  console.log('✅ Reset Functional Basics pricing to normal:');
  console.log({
    name: updated.name,
    priceExcl: updated.price,
    priceIncl: toIncl(updated.price || 0),
    basePriceExcl: updated.basePrice,
    basePriceIncl: toIncl(updated.basePrice || 0),
    salePriceExcl: updated.salePrice,
    salePriceIncl: updated.salePrice ? toIncl(updated.salePrice) : null,
    saleStartsAt: updated.saleStartsAt,
    saleEndsAt: updated.saleEndsAt,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
