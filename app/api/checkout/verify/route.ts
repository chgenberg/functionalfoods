import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { emailService } from '@/app/lib/email';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const session_id = req.nextUrl.searchParams.get('session_id');
    if (!session_id) return NextResponse.json({ error: 'session_id saknas' }, { status: 400 });

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe är inte konfigurerat' }, { status: 500 });
    }

    const stripe = require('stripe')(secretKey);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Fallback finalization if webhook didn't run
    try {
      const customerEmail = (session.customer_details?.email || session.customer_email || '').trim();
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

      // Only proceed if we have an email and either paid or free order
      if (customerEmail && (session.amount_total === 0 || session.payment_status === 'paid')) {
        // Idempotency: if payment OR order with this session ID exists, assume webhook handled it
        let existingPayment = null as any;
        if (paymentIntentId) {
          existingPayment = await prisma.payment.findFirst({ where: { externalId: String(paymentIntentId) } });
        }
        
        // Also check if order with this session ID exists
        const existingOrder = await prisma.order.findFirst({
          where: {
            orderNumber: { contains: session.id }
          }
        });

        if (!existingPayment && !existingOrder) {
          // Parse items from metadata
          let items: Array<{ id: string; name: string; price: number; quantity: number; type: string }> = [];
          try {
            const raw = (session.metadata as any)?.items || '';
            if (raw) items = JSON.parse(raw);
          } catch {}

          if (items.length > 0) {
            await prisma.$transaction(async (tx) => {
              // Get or create user
              let user = await tx.user.findUnique({ where: { email: customerEmail } });
              const isNewUser = !user;
              let tempPassword = '';
              if (!user) {
                const bcrypt = require('bcryptjs');
                tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
                const hashed = await bcrypt.hash(tempPassword, 12);
                user = await tx.user.create({
                  data: {
                    email: customerEmail,
                    name: (session.customer_details?.name || customerEmail.split('@')[0] || 'Kund'),
                    password: hashed,
                    role: 'customer',
                    mustChangePassword: true
                  }
                });
              }

              // Create order if missing (use session.id for idempotency)
              const totalIncl = (session.amount_total || 0) / 100;
              const order = await tx.order.create({
                data: {
                  orderNumber: session.amount_total === 0 ? `STRIPE-FREE-${session.id}` : `STRIPE-${session.id}`,
                  userId: user.id,
                  status: 'COMPLETED',
                  totalAmount: totalIncl,
                  currency: String(session.currency || 'SEK').toUpperCase(),
                  items: {
                    create: items.map((it) => ({
                      courseId: null,
                      name: it.name,
                      price: it.price,
                      quantity: it.quantity || 1,
                      type: it.type || 'course'
                    }))
                  }
                },
                include: { items: true }
              });

              // Create payment if PI exists
              if (paymentIntentId) {
                await tx.payment.create({
                  data: {
                    orderId: order.id,
                    paymentMethod: 'stripe',
                    status: 'COMPLETED',
                    amount: totalIncl,
                    currency: String(session.currency || 'SEK').toUpperCase(),
                    externalId: String(paymentIntentId),
                    processedAt: new Date(),
                  }
                });
              }

              // Link order items to actual course ids and create purchases
              const purchasedCourses: any[] = [];
              for (const it of items.filter(i => i.type === 'course')) {
                const course = await tx.courseProduct.findFirst({
                  where: {
                    OR: [
                      { name: it.name },
                      { name: { contains: it.name.split('Functional ')[1] || '', mode: 'insensitive' } }
                    ]
                  }
                });
                if (!course) continue;
                const already = await tx.purchase.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
                if (!already) {
                  const purchase = await tx.purchase.create({
                    data: {
                      userId: user.id,
                      courseId: course.id,
                      amount: it.price * (it.quantity || 1),
                      status: 'completed',
                      orderId: order.id,
                      accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    },
                    include: { course: true }
                  });
                  purchasedCourses.push(purchase.course);
                }
              }

              // Send email (course lines incl VAT)
              try {
                const VAT_RATE = 0.25;
                const emailCourses = items.filter(i => i.type === 'course').map(it => ({
                  name: it.name,
                  price: Math.round(it.price * (1 + VAT_RATE)) * (it.quantity || 1)
                }));
                await emailService.sendOrderConfirmation({
                  customerEmail: user.email,
                  customerName: user.name || user.email,
                  orderNumber: order.orderNumber,
                  totalAmount: totalIncl,
                  courses: emailCourses,
                  loginCredentials: isNewUser && tempPassword ? {
                    email: user.email,
                    password: tempPassword,
                    loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://functionalfoods.se'}/login`
                  } : undefined
                });
              } catch (e) {
                console.error('Email send failed in verify fallback:', e);
              }
            });
          }
        }
      }
    } catch (e) {
      console.error('Checkout verify fallback failed:', e);
    }

    // NOTE: Coupon usage is incremented in webhook, not here
    // to avoid double-counting if this endpoint is called multiple times

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      customer_email: session.customer_details?.email || session.customer_email || null,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata
    });
  } catch (err: any) {
    console.error('Verify Checkout Session error:', err);
    return NextResponse.json({ error: err?.message || 'Kunde inte verifiera session' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 