import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const coupons = await prisma.coupon.findMany();
  const couponMap = new Map<string, typeof coupons[number]>();
  coupons.forEach((coupon) => couponMap.set(coupon.code.toUpperCase(), coupon));

  const sveaOrders = await prisma.order.findMany({
    where: {
      checkoutOrderId: { not: null },
      items: { some: {} },
    },
    include: { items: true },
  });

  const VAT_RATE = 0.25;
  let updated = 0;

  for (const order of sveaOrders) {
    const metadata = (order.metadata as any) || {};
    const totalExclVat = order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const totalInclVat = Math.round(totalExclVat * (1 + VAT_RATE) * 100) / 100;

    let discountAmount = 0;

    if (typeof metadata.discountAmount === 'number' && metadata.discountAmount > 0) {
      discountAmount = metadata.discountAmount;
    } else if (metadata.couponCode) {
      const coupon = couponMap.get(String(metadata.couponCode).toUpperCase());
      if (coupon) {
        const type = String(coupon.type).toLowerCase();
        if (type === 'percent' || type === 'percentage') {
          discountAmount = Math.round(totalInclVat * (coupon.amount / 100) * 100) / 100;
        } else if (type === 'fixed') {
          discountAmount = Math.round((coupon.amount * (1 + VAT_RATE)) * 100) / 100;
        }
      }
    }

    const actualPaid = Math.max(0, Math.round((totalInclVat - discountAmount) * 100) / 100);

    const shouldUpdate =
      Math.abs(order.totalAmount - actualPaid) > 0.01 ||
      typeof metadata.actualPaidAmount !== 'number' ||
      Math.abs((metadata.actualPaidAmount || 0) - actualPaid) > 0.01;

    if (!shouldUpdate) {
      continue;
    }

    const newMetadata = {
      ...metadata,
      actualPaidAmount: actualPaid,
      displayTotalAmount: actualPaid,
      totalExclVat,
      totalInclVat,
      discountAmount: discountAmount || null,
      fixedAt: new Date().toISOString(),
      fixedBy: 'fix-svea-order-amounts-script'
    };

    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: actualPaid,
        metadata: newMetadata
      }
    });

    console.log(`✅ Updated order ${order.id}: ${order.totalAmount} -> ${actualPaid}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} orders.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
