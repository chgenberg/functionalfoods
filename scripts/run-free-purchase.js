/*
  Create a 100% discount coupon and run an end-to-end free purchase via production API.
  Usage: node scripts/run-free-purchase.js [email]
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = process.env.TEST_BASE_URL || 'https://ulrika-functional-foods-production.up.railway.app';

async function ensureCoupon() {
  const code = 'FREE100';
  const now = new Date();
  const ends = new Date(now.getTime() + 60 * 60 * 1000);
  let coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) {
    coupon = await prisma.coupon.create({
      data: {
        code,
        type: 'percent',
        amount: 100,
        active: true,
        startsAt: new Date(now.getTime() - 60 * 1000),
        expiresAt: ends,
        usageLimit: null,
        timesUsed: 0,
      }
    });
  } else {
    coupon = await prisma.coupon.update({
      where: { code },
      data: { active: true, amount: 100, type: 'percent', startsAt: new Date(now.getTime() - 60 * 1000), expiresAt: ends }
    });
  }
  return coupon;
}

function extractSessionIdFromUrl(url) {
  // Stripe URL like: https://checkout.stripe.com/c/pay/cs_test_...#fidkdWx...
  const m = url.match(/\/c\/pay\/(cs_[^/?#]+)/);
  return m ? m[1] : null;
}

async function run(emailArg) {
  const email = emailArg || `test.kund+free${Date.now()}@functionalfoods.se`;
  const name = 'Test Kund Gratis';
  try {
    await ensureCoupon();

    // Build checkout payload (one Basics course)
    const payload = {
      items: [
        { id: 'functional-basics', name: 'Functional Basics', price: 0, quantity: 1, type: 'course' }
      ],
      customer: { email, name },
      couponCode: 'FREE100'
    };

    const res = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Checkout API error:', data);
      process.exit(1);
    }
    const url = data.url;
    console.log('Stripe session URL:', url);
    const sessionId = extractSessionIdFromUrl(url);
    if (!sessionId) {
      console.error('Failed to parse session id from URL');
      process.exit(1);
    }
    console.log('Parsed session_id:', sessionId);

    // Directly call verify (fallback will finalize and send email)
    const verifyRes = await fetch(`${BASE_URL}/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
    const verifyData = await verifyRes.json();
    console.log('Verify response:', verifyData);

    console.log('\n✅ Free purchase flow attempted for', email);
    console.log('If webhook was missed, fallback should have created user/order/purchases and sent email.');
  } catch (e) {
    console.error('Run failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run(process.argv[2]);


