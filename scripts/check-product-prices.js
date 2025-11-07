const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductPrices() {
  try {
    const products = await prisma.courseProduct.findMany({
      select: {
        name: true,
        price: true,
        basePrice: true,
        salePrice: true
      }
    });

    console.log('📊 Course Product Prices:\n');
    products.forEach(p => {
      console.log(`${p.name}:`);
      console.log(`  price: ${p.price} kr`);
      console.log(`  basePrice: ${p.basePrice} kr`);
      console.log(`  salePrice: ${p.salePrice} kr`);
      console.log(`  With 25% VAT: ${p.price * 1.25} kr\n`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductPrices();

