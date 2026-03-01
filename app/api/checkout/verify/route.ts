import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { emailService } from '@/app/lib/email';
import { getMailchimpMarketing } from '@/app/lib/mailchimp-marketing';

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
    const customerEmail = (session.customer_details?.email || session.customer_email || '').trim();

    // Fallback finalization if webhook didn't run
    try {
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

          let attribution: any = null;
          try {
            const rawAttr = (session.metadata as any)?.attribution || '';
            if (rawAttr) attribution = JSON.parse(rawAttr);
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
                  metadata:  {
                    items,
                    attribution
                  },  
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
              
              // Course name mapping for exact matching
              const courseNameMap: Record<string, string> = {
                'hormonell balans': 'Hormonell Balans',
                'functional flow': 'Functional Flow',
                'functional gut health/flow': 'Functional Flow',
                'functional basics': 'Functional Basics',
                'functional energy': 'Functional Energy',
                'functional insulin balance/energy': 'Functional Energy',
                'prova på vecka med functional foods!': 'Prova på vecka med Functional Foods!',
                'prova på vecka': 'Prova på vecka med Functional Foods!'
              };
              
              for (const it of items.filter(i => i.type === 'course')) {
                const normalizedName = it.name.toLowerCase().trim();
                const mappedName = courseNameMap[normalizedName] || it.name;
                
                // Try exact match first (case-insensitive)
                let course = await tx.courseProduct.findFirst({
                  where: {
                    name: { equals: mappedName, mode: 'insensitive' }
                  }
                });
                
                // If no exact match, try original name
                if (!course) {
                  course = await tx.courseProduct.findFirst({
                    where: {
                      name: { equals: it.name, mode: 'insensitive' }
                    }
                  });
                }
                
                // Only use contains as last resort, and be more specific
                if (!course && it.name.toLowerCase().includes('functional')) {
                  const functionalPart = it.name.split('Functional ')[1]?.trim();
                  if (functionalPart) {
                    course = await tx.courseProduct.findFirst({
                      where: {
                        AND: [
                          { name: { contains: 'Functional', mode: 'insensitive' } },
                          { name: { contains: functionalPart, mode: 'insensitive' } }
                        ]
                      }
                    });
                  }
                }
                
                if (!course) {
                  console.error(`❌ Course not found for: "${it.name}" (normalized: "${normalizedName}", mapped: "${mappedName}")`);
                  continue;
                }
                
                console.log(`✅ Matched course: "${it.name}" → "${course.name}"`);
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
                await tx.orderItem.updateMany({
                  where: {
                    orderId: order.id,
                    type: 'course',
                    courseId: null,
                    name: it.name
                  },
                  data: { courseId: course.id }
                });
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
                  } : undefined,
                  isExistingUser: !isNewUser
                });
              } catch (e) {
                console.error('Email send failed in verify fallback:', e);
              }
            });
            
            // ✅ Post-completion Mailchimp tracking (idempotent)
            try {
              const orderNumber = session.amount_total === 0 ? `STRIPE-FREE-${session.id}` : `STRIPE-${session.id}`;

              const updatedOrder = await prisma.order.findUnique({
                where: { orderNumber },
                include: { items: true, user: true }
              });

              if (updatedOrder) {
                const metadata = (updatedOrder.metadata as any) || {};
                const emailForTracking = updatedOrder.user?.email || customerEmail;

                // 1) Mailchimp Marketing tags
                if (!metadata.mailchimpMarketingTaggedAt) {
                  const mailchimpMarketing = getMailchimpMarketing();
                  if (mailchimpMarketing.isConfigured() && emailForTracking && !emailForTracking.startsWith('guest-')) {
                    const productNames = updatedOrder.items.map(i => i.name); // courses + books

                    const nameParts = (updatedOrder.customerName || updatedOrder.user?.name || '')
                      .trim()
                      .split(' ')
                      .filter(Boolean);

                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    await mailchimpMarketing.addCustomerWithCourseTags(emailForTracking, productNames, firstName, lastName);

                    await prisma.order.update({
                      where: { id: updatedOrder.id },
                      data: { metadata: { ...metadata, mailchimpMarketingTaggedAt: new Date().toISOString() } }
                    });

                    console.log(`✅ Mailchimp Marketing tagged (stripe verify fallback): ${emailForTracking}`);
                  }
                }

                // 2) Mailchimp E-commerce tracking
                const metadata2 = ((await prisma.order.findUnique({
                  where: { id: updatedOrder.id },
                  select: { metadata: true }
                }))?.metadata as any) || {};

                if (!metadata2.mailchimpEcommerceTrackedAt) {
                  const { getMailchimpEcommerce } = await import('@/app/lib/mailchimp-ecommerce');
                  const mc = getMailchimpEcommerce();

                  if (mc.isConfigured() && emailForTracking && !emailForTracking.startsWith('guest-')) {
                    const attr = metadata2.attribution || null;
                    const campaignId = attr?.mc_cid || undefined;
                    const trackingCode = attr?.utm_campaign || campaignId || undefined;

                    await mc.trackPurchase({
                      orderId: updatedOrder.orderNumber,
                      customerEmail: emailForTracking,
                      customerName: updatedOrder.user?.name || updatedOrder.customerName || undefined,
                      items: updatedOrder.items.map((it) => ({
                        id: it.courseId || `ebook:${it.name}` // now course items should have courseId
                        name: it.name,
                        price: it.price,
                        quantity: it.quantity,
                        type: (it.type as any) || 'course'
                      })),
                      totalAmount: updatedOrder.totalAmount || 0,
                      currency: updatedOrder.currency || 'SEK',
                      orderDate: updatedOrder.createdAt,
                      discountTotal: 0,
                      shippingTotal: 0,
                      taxTotal: 0,
                      campaignId,
                      landingSite: undefined,
                      trackingCode
                    });

                    await prisma.order.update({
                      where: { id: updatedOrder.id },
                      data: { metadata: { ...metadata2, mailchimpEcommerceTrackedAt: new Date().toISOString() } }
                    });

                    console.log('✅ Mailchimp E-commerce tracked (stripe verify fallback):', {
                      orderId: updatedOrder.orderNumber,
                      email: emailForTracking,
                      itemsCount: updatedOrder.items.length
                    });
                  }
                }
              }
            } catch (e) {
              console.warn('⚠️ Stripe verify fallback: Mailchimp tracking failed (non-critical):', e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Checkout verify fallback failed:', e);
    }

    try {
      const orderNumber = session.amount_total === 0 ? `STRIPE-FREE-${session.id}` : `STRIPE-${session.id}`;
      
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, user: true }
      });

      if (order) {
        const emailToUse = order.user?.email || order.customerEmail || customerEmail;
        const nameToUse = order.customerName || order.user?.name || emailToUse?.split('@')[0] || 'Kund';
        
        const bookItems = order.items.filter(i => i.type === 'book');

        if (bookItems.length > 0 && emailToUse && !emailToUse.startsWith('guest-')) {
          const crypto = await import('crypto');
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';

          for (const book of bookItems) {
            const ebookId = 'brodboken-2026'; // eller härled via book.name

            const existing = await prisma.ebookDownload.findFirst({
              where: { orderNumber: order.orderNumber, ebookId }
            });
            if (existing) continue;

            const token = crypto.randomBytes(16).toString('hex').toUpperCase();

            await prisma.ebookDownload.create({
              data: {
                token,
                orderNumber: order.orderNumber,
                customerEmail: emailToUse,
                ebookId,
                ebookName: book.name,
                maxDownloads: 5,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              }
            });

            const downloadUrl = `${baseUrl}/brodboken/ladda-ner?token=${token}`;

            await emailService.sendEbookDownloadEmail({
              email: emailToUse,
              name: nameToUse,
              ebookName: book.name,
              downloadUrl,
              downloadPassword: token,
              orderNumber: order.orderNumber
            });

            console.log(`✅ E-book download email sent (stripe verify fallback): ${emailToUse}`);
          }
        }
      }
    } catch (e) {
    console.warn('⚠️ Stripe verify fallback: ebook delivery failed (non-critical):', e);
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
