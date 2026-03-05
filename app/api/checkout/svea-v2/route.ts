import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';
import { emailService } from '@/app/lib/email';
import { getMailchimpMarketing } from '@/app/lib/mailchimp-marketing';
import bcrypt from 'bcryptjs';
import type { SveaCartItem, CreateCheckoutOrderRequest } from '@/app/lib/svea-checkout-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'course' | 'book';
}

interface Attribution {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  mc_cid?: string;  // Mailchimp campaign ID
  mc_eid?: string;  // Mailchimp subscriber ID
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
  ts?: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customer?: {
    email?: string;
    name?: string;
    id?: string;
  };
  couponCode?: string;
  attribution?: Attribution;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🛒 Svea checkout request received');
    
    let body: CheckoutRequest;
    try {
      body = await req.json() as CheckoutRequest;
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Ogiltig begäran. Kontrollera att data är korrekt formaterad.' },
        { status: 400 }
      );
    }
    
    const { items, customer, couponCode, attribution } = body;

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ No items in request');
      return NextResponse.json(
        { error: 'Inga produkter i varukorgen' },
        { status: 400 }
      );
    }

    // Require customer name/email for all purchases (course or ebook)
    const customerName = (customer?.name || '').trim();
    const customerEmail = (customer?.email || '').trim();
    if (!customerName) {
      return NextResponse.json({ error: 'Namn är obligatoriskt' }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json({ error: 'E-postadress är obligatorisk' }, { status: 400 });
    }

    console.log('📦 Processing checkout:', {
      itemCount: items.length,
      itemIds: items.map(i => i.id),
      hasCustomer: !!customer,
      customerEmail: customer?.email,
      hasCoupon: !!couponCode
    });

    // --- SECURITY FIX: Fetch product data from database ---
    let courseProducts;
    try {
      courseProducts = await prisma.courseProduct.findMany();
      console.log(`✅ Found ${courseProducts.length} course products in database`);
    } catch (dbError) {
      console.error('❌ Failed to fetch course products:', dbError);
      return NextResponse.json(
        { error: 'Kunde inte ladda produktdata. Försök igen.' },
        { status: 500 }
      );
    }
    
    // Create comprehensive product map with multiple key variations
    const slugify = (s: string) => s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const productMap = new Map<string, any>();
    for (const p of courseProducts) {
      const key1 = p.name.toLowerCase().replace(/\s+/g, '-');
      const key2 = slugify(p.name);
      productMap.set(key1, p);
      productMap.set(key2, p);
      productMap.set(p.id, p); // allow using DB id directly
      productMap.set(p.name.toLowerCase(), p); // exact name match (case-insensitive)
      productMap.set(p.name, p); // exact name match (case-sensitive)
    }
    
    // Add specific ID mappings for common variations
    const idMappings: Record<string, string> = {
      'functional-hormone': 'hormonell-balans',
      'hormonell-balans': 'hormonell-balans',
      'hormonell-balans-kurs': 'hormonell-balans',
      'functional-energy': 'functional-energy',
      'functional-insulin': 'functional-energy',
      'functional-insulin-balance': 'functional-energy',
      'functional-basics': 'functional-basics',
      'functional-flow': 'functional-flow',
      'functional-gut': 'functional-flow',
      'functional-gut-health': 'functional-flow',
    };
    
    // Add mapped IDs to productMap
    for (const [mappedId, targetId] of Object.entries(idMappings)) {
      const product = courseProducts.find(p => {
        const key = p.name.toLowerCase().replace(/\s+/g, '-');
        return key === targetId || slugify(p.name) === targetId;
      });
      if (product) {
        productMap.set(mappedId, product);
      }
    }

    // (Optional) Add book products not in CourseProduct table
    const bookProducts: Record<
      string,
      { id: string; name: string; price: number; type: 'book'; vatRate: number }
    > = {
      'brodboken-2026': {
        id: 'brodboken-2026',
        name: 'Baka Glutenfritt – E-bok',
        price: 65.09, // 69 kr inkl 6% moms => exkl moms
        type: 'book',
        vatRate: 0.06,
      },
    };

    // Add book products to productMap
    for (const [bookId, bookProduct] of Object.entries(bookProducts)) {
      productMap.set(bookId, bookProduct);
    }
    
    // Helper function to resolve courseId from cart item (used for both simulated and real orders)
    async function resolveCourseIdFromCartItem(
      db: typeof prisma,
      itemId: string, 
      itemName?: string
    ): Promise<string | null> {
      const id = itemId.toLowerCase();
      const name = (itemName || '').toLowerCase();
      let keyword = '';
      
      // Match by ID pattern
      if (id.includes('prova-pa') || id.includes('prova på')) keyword = 'Prova';
      else if (id.includes('energy') || id.includes('insulin')) keyword = 'Energy';
      else if (id.includes('basic')) keyword = 'Basics';
      else if (id.includes('flow') || id.includes('gut')) keyword = 'Flow';
      else if (id.includes('hormone') || id.includes('hormon')) keyword = 'Hormonell';
      
      // Fallback: match by name
      if (!keyword) {
        if (name.includes('prova på') || name.includes('prova-pa')) keyword = 'Prova';
        else if (name.includes('energy') || name.includes('insulin')) keyword = 'Energy';
        else if (name.includes('basic')) keyword = 'Basics';
        else if (name.includes('flow') || name.includes('gut')) keyword = 'Flow';
        else if (name.includes('hormon')) keyword = 'Hormonell';
      }
      
      if (!keyword) return null;
      const cp = await db.courseProduct.findFirst({ 
        where: { name: { contains: keyword, mode: 'insensitive' } }, 
        select: { id: true } 
      });
      return cp?.id || null;
    }

    // Validate and enrich items with server-side data
    const validatedItems = [];
    for (const item of items) {
      try {
        let product = productMap.get(item.id);
        
        // Fallback: try to match by name if ID didn't match
        if (!product && item.name) {
          product = productMap.get(item.name.toLowerCase()) || 
                    productMap.get(item.name) ||
                    courseProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());
        }
        
        if (!product) {
          console.error(`❌ Product not found: "${item.id}"`);
          console.error('Available products:', Array.from(productMap.keys()).slice(0, 20)); // Limit output
          return NextResponse.json(
            { error: `Produkten med id "${item.id}" hittades inte.` },
            { status: 400 }
          );
        }
        validatedItems.push({
          ...item,
          price: product.price, // Use price from database
          name: product.name,   // Use name from database
          vatRate: product.vatRate || 0.25, // Use product VAT rate or default 25%
          courseId: item.type === 'course' ? product.id : null,
        });
      } catch (itemError) {
        console.error(`❌ Error validating item "${item.id}":`, itemError);
        return NextResponse.json(
          { error: `Fel vid validering av produkt "${item.id}".` },
          { status: 400 }
        );
      }
    }
    console.log(`✅ Validated ${validatedItems.length} items`);
    console.log('🔍 VALIDATED ITEMS DEBUG:', JSON.stringify(validatedItems, null, 2));
    // --- END SECURITY FIX ---

    // If payments are simulated/disabled, short-circuit and create a completed order locally
    if (process.env.PAYMENTS_SIMULATE === 'true') {
      // Resolve or create user if email provided
      let customerId: string | null = customer?.id || null;
      let needsLoginCredentials = false;
      let temporaryPassword = '';

      if (!customerId && customer?.email) {
        const normalizedEmail = customer.email.toLowerCase().trim();
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          customerId = existing.id;
        } else {
          temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
          const hashed = await bcrypt.hash(temporaryPassword, 12);
          const created = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: customer.name || null,
              password: hashed,
              role: 'customer',
              isActive: true,
              mustChangePassword: true
            }
          });
          customerId = created.id;
          needsLoginCredentials = true;
        }
      }

      // If still no user (no email provided), create a temporary guest user
      if (!customerId) {
        const tempEmail = `guest-${Date.now()}-${Math.random().toString(36).slice(2,8)}@example.com`;
        const hashed = await bcrypt.hash(Math.random().toString(36), 10);
        const created = await prisma.user.create({
          data: {
            email: tempEmail,
            name: customer?.name || null,
            password: hashed,
            role: 'customer',
            isActive: true,
            mustChangePassword: false
          }
        });
        customerId = created.id;
      }

      // Calculate order totals (öre) from validated items
      // VIKTIGT: Svea förväntar sig pris INKLUSIVE moms (samma som riktiga betalningar)
      const VAT_RATE = 0.25;
      let subtotal = 0;
      for (const item of validatedItems) {
        const priceInclVAT = item.price * (1 + VAT_RATE);
        subtotal += SveaCheckoutService.formatPriceToMinorUnits(priceInclVAT) * item.quantity;
      }

      // Handle coupon (optional)
      let discountAmount = 0;
      let appliedCoupon = null as any;
      if (couponCode) {
        try {
          const coupon = await prisma.coupon.findFirst({
            where: {
              code: couponCode.toUpperCase().trim(),
              active: true,
              OR: [ { expiresAt: null }, { expiresAt: { gt: new Date() } } ]
            }
          });
          if (coupon) {
            if (!coupon.usageLimit || coupon.timesUsed < coupon.usageLimit) {
              const couponType = String(coupon.type || '').toUpperCase();
              const isPercentage = couponType === 'PERCENTAGE' || couponType === 'PERCENT';
              const isFixed = couponType === 'FIXED' || couponType === 'AMOUNT';

              if (isPercentage) {
                discountAmount = Math.round(subtotal * (coupon.amount / 100));
              } else if (isFixed) {
                discountAmount = SveaCheckoutService.formatPriceToMinorUnits(coupon.amount);
              }
              appliedCoupon = coupon;
            }
          }
        } catch {}
      }

      const totalAmountKr = SveaCheckoutService.formatPriceFromMinorUnits(subtotal - discountAmount);

      // Generate order ID
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 9);
      const orderId = `FF-${timestamp}-${randomPart}`;

      // Create order + payment + purchases in one transaction
      let createdOrderId = '';
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            id: orderId,
            orderNumber: orderId,
            status: 'COMPLETED',
            totalAmount: totalAmountKr,
            currency: 'SEK',
            user: { connect: { id: customerId as string } },
            items: {
              create: await Promise.all(validatedItems.map(async (item) => ({
                name: item.name,
                type: item.type,
                quantity: item.quantity,
                price: item.price,
                courseId: item.type === 'course' ? item.courseId : null
              })))
            }
          }
        });
        createdOrderId = order.id;

        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentMethod: 'SIMULATED',
            status: 'COMPLETED',
            amount: order.totalAmount,
            currency: 'SEK',
            externalId: `SIM-${orderId}`,
            processedAt: new Date(),
          }
        });

        if (customerId) {
          const orderWithItems = await tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
          for (const it of orderWithItems?.items || []) {
            if (it.type === 'course' && it.courseId) {
              const exists = await tx.purchase.findUnique({
                where: { userId_courseId: { userId: customerId!, courseId: it.courseId } }
              });
              if (!exists) {
                await tx.purchase.create({
                  data: {
                    userId: customerId!,
                    courseId: it.courseId,
                    amount: it.price * it.quantity,
                    status: 'completed',
                    orderId: order.id,
                    accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                  }
                });
              }
            }
          }
        }
      });

      // Send order confirmation email - ALWAYS send for both new and existing users
      try {
        const order = await prisma.order.findUnique({ where: { id: createdOrderId }, include: { items: true } });
        if (order && customer?.email) {
          const purchasedCourses = order.items.filter(it => it.type === 'course');
          console.log('📧 Sending order confirmation email to:', customer.email, 'needsLoginCredentials:', needsLoginCredentials);
          
          await emailService.sendOrderConfirmation({
            customerEmail: customer.email,
            customerName: customer.name || customer.email,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            courses: purchasedCourses.map(it => ({ name: it.name, price: it.price })),
            ...(needsLoginCredentials && {
              loginCredentials: {
                email: customer.email,
                password: temporaryPassword,
                loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://ulrika-functional-foods-production.up.railway.app'}/login`
              }
            })
          });
          
          console.log('✅ Order confirmation email sent successfully');
        } else {
          console.warn('⚠️ No order or customer email found for confirmation');
        }
      } catch (e) {
        console.error('❌ Failed to send simulated order email:', e);
      }

      // Simple embedded GUI snippet with a continue button
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://ulrika-functional-foods-production.up.railway.app';
      const snippet = `
        <div style="padding:24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
          <h2 style="margin:0 0 8px 0;color:#014421">Simulerad betalning är PÅ</h2>
          <p style="margin:0 0 16px 0;color:#334155">Inga pengar dras. Klicka för att slutföra köpet.</p>
          <a href="${origin}/checkout/success/svea-v2?checkoutOrderId=SIMULATED&orderId=${orderId}"
             style="display:inline-block;background:#014421;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Slutför köp</a>
        </div>`;

      return NextResponse.json({
        success: true,
        checkoutOrderId: 'SIMULATED',
        orderId,
        gui: { snippet }
      });
    }

    // Initialize Svea service
    let sveaCheckout: SveaCheckoutService;
    try {
      sveaCheckout = getSveaCheckout();
    } catch (error) {
      console.error('❌ Failed to initialize Svea:', error);
      return NextResponse.json(
        { error: 'Betalningssystemet är inte konfigurerat. Kontakta support.' },
        { status: 500 }
      );
    }

    // Helper: map our course ids/names to Svea article numbers
    const getArticleNumber = (item: CheckoutItem): string => {
      const key = `${item.id} ${item.name}`.toLowerCase();
      if (key.includes('functional basics') || key.includes('functional-basics') || key.includes('basics')) return '21122';
      if (key.includes('functional flow') || key.includes('functional-flow') || key.includes('gut')) return '21127';
      if (key.includes('functional energy') || key.includes('insulin') || key.includes('functional-energy')) return '21128';
      if (key.includes('glutenfritt') || key.includes('brodboken')) return 'EBOOK-BRODBOKEN-2026';
      return item.id; // fallback
    };

    // Calculate order totals from validated items
    console.log('💰 Calculating order totals...');
    let subtotal = 0;
    const sveaItems: SveaCartItem[] = [];
    const DEFAULT_VAT_RATE = 0.25; // 25% moms for courses
    const BOOK_VAT_RATE = 0.06; // 6% moms for books

    try {
      
      for (const item of validatedItems) {
        // VIKTIGT: Svea förväntar sig pris INKLUSIVE moms i öre
        // vatPercent anger hur mycket av priset som är moms (för momsrapportering)
        // item.price från DB är exkl. moms -> vi behöver lägga till moms
        const itemVatRate = item.vatRate || (item.type === 'book' ? BOOK_VAT_RATE : DEFAULT_VAT_RATE);
        // Lägg till moms för att få inkl-pris (runda INTE före moms läggs till!)
        const priceInclVAT = item.price * (1 + itemVatRate);
        // Runda till närmsta krona för slutpris, sedan konvertera till öre
        const priceInclVATRounded = Math.round(priceInclVAT);
        const priceInOre = priceInclVATRounded * 100;
        // För subtotal-tracking
        subtotal += priceInOre * item.quantity;
        
        // Convert VAT rate to Svea format (6% = 600, 25% = 2500)
        const sveaVatPercent = Math.round(itemVatRate * 10000);
        
        console.log(`🔍 ITEM PRICE DEBUG: ${item.name} - DB price: ${item.price} kr (exkl VAT), VAT rate: ${itemVatRate * 100}%, With VAT: ${priceInclVAT} kr, Rounded: ${priceInclVATRounded} kr, In öre: ${priceInOre}, Sending to Svea: ${priceInOre} öre`);

        sveaItems.push({
          articleNumber: getArticleNumber(item),
          name: item.name,
          quantity: item.quantity, // Not minor units, e.g 1 course = 1 unit
          unitPrice: priceInOre, // Pris INKLUSIVE moms i ÖRE (vatPercent används bara för momsrapportering)
          vatPercent: sveaVatPercent, // VAT in Svea format (600 = 6%, 2500 = 25%)
          unit: 'st',
          discountPercent: 0
        });
      }
      console.log(`✅ Calculated totals: ${sveaItems.length} items, subtotal INKL. moms: ${subtotal} öre (${subtotal/100} kr)`);
    } catch (calcError) {
      console.error('❌ Error calculating order totals:', calcError);
      throw new Error(`Fel vid beräkning av orderbelopp: ${calcError instanceof Error ? calcError.message : 'Okänt fel'}`);
    }

    // Handle coupon if provided
    // Rabatt appliceras direkt på subtotal (som nu är inkl. moms)
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      try {
        const coupon = await prisma.coupon.findFirst({
          where: {
            code: couponCode.toUpperCase().trim(),
            active: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        });

        if (coupon) {
          // Check usage limit
          if (!coupon.usageLimit || coupon.timesUsed < coupon.usageLimit) {
            // subtotal är nu redan inkl. moms, så vi applicerar rabatt direkt
            const couponType = String(coupon.type || '').toUpperCase();
            const isPercentage = couponType === 'PERCENTAGE' || couponType === 'PERCENT';
            const isFixed = couponType === 'FIXED' || couponType === 'AMOUNT';

            if (isPercentage) {
              // subtotal är inkl moms i öre, räkna rabatt på det
              discountAmount = Math.round(subtotal * (coupon.amount / 100));
              // Runda NER rabatten till närmsta krona (så kunden betalar ett jämnt belopp)
              const discountInKr = Math.floor(discountAmount / 100);
              discountAmount = discountInKr * 100;
            } else if (isFixed) {
              // Fixed rabatt är i kr exkl moms, konvertera till inkl moms
              const fixedDiscountInKr = coupon.amount * 1.25;
              const roundedDiscountInKr = Math.ceil(fixedDiscountInKr);
              discountAmount = Math.round(roundedDiscountInKr * 100);
            }
            appliedCoupon = coupon;
            
            console.log(`💰 Coupon applied: ${coupon.code}, Type: ${coupon.type}, Amount: ${coupon.amount}${isPercentage ? '%' : ' kr'}, Discount: ${discountAmount} öre (${discountAmount/100} kr)`);
            
            // CRITICAL: Debug the actual calculation
            console.log('🚨 DISCOUNT CALCULATION:', {
              subtotalInOre: subtotal,
              subtotalInKr: subtotal/100,
              couponAmount: coupon.amount,
              discountInOre: discountAmount,
              discountInKr: discountAmount/100,
              finalTotalInOre: subtotal - discountAmount,
              finalTotalInKr: (subtotal - discountAmount)/100
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Coupon lookup failed:', error);
        // Continue without discount
      }
    }

    // If total becomes free (0 kr) after discounts, bypass Svea entirely.
    // Svea may reject 0-amount checkouts or negative line items.
    const totalAfterDiscountInOre = subtotal - discountAmount;
    if (totalAfterDiscountInOre <= 0) {
      console.log('💚 Free order detected after discount - bypassing Svea checkout', {
        subtotal,
        discountAmount,
        totalAfterDiscountInOre,
        couponCode: appliedCoupon?.code || null,
      });

      // Generate order ID
      const ts = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 9);
      const orderId = `FF-FREE-${ts}-${randomPart}`;

      // Resolve user
      let userId: string | null = customer?.id || null;
      let needsLoginCredentials = false;
      let temporaryPassword = '';
      if (!userId && customerEmail) {
        const normalizedEmail = customerEmail.toLowerCase().trim();
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          userId = existing.id;
        } else {
          temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
          const hashed = await bcrypt.hash(temporaryPassword, 12);
          const created = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: customerName || normalizedEmail.split('@')[0],
              password: hashed,
              role: 'customer',
              isActive: true,
              mustChangePassword: true
            }
          });
          userId = created.id;
          needsLoginCredentials = true;
        }
      }

      if (!userId) {
        const tempEmail = `guest-${Date.now()}-${Math.random().toString(36).slice(2,8)}@functionalfoods.se`;
        const hashed = await bcrypt.hash(Math.random().toString(36), 10);
        const created = await prisma.user.create({
          data: {
            email: tempEmail,
            name: customerName || 'Gäst',
            password: hashed,
            role: 'customer',
            isActive: true,
            mustChangePassword: false
          }
        });
        userId = created.id;
      }

      const ops: Prisma.PrismaPromise<any>[] = [];

      // 1) FREE Order + order items (BATCH-style)
      ops.push(
        prisma.order.create({
          data: {
            id: orderId,
            orderNumber: orderId,
            status: 'COMPLETED',
            totalAmount: 0,
            currency: 'SEK',
            userId: userId as string,
            customerEmail,
            customerName,
            metadata: {
              items: validatedItems,
              couponCode: appliedCoupon?.code || null,
              discountAmount:
                discountAmount > 0
                ? SveaCheckoutService.formatPriceFromMinorUnits(discountAmount)
                : null,
              freeOrder: true,
              attribution: attribution || null,
            },
            items: {
              create: validatedItems.map((item: any) => ({
                courseId: item.type === 'course' ? item.courseId : null,
                name: item.name,
                quantity: item.quantity,
                price: 0,
                type: item.type,
              })),
            },
          },
        })
      );

      // 2) Coupon usage 
      if (appliedCoupon) {
        ops.push(
          prisma.coupon.update({
            where: { id: appliedCoupon.id },
            data: { timesUsed: { increment: 1 } },
          })
        );
      }

      // 3) Purchases (idempotent)
      for (const item of validatedItems) {
        if (item.type !== 'course' || !item.courseId) continue;

        ops.push(
          prisma.purchase.upsert({
            where: {
              userId_courseId: {
                userId: userId as string,
                courseId: item.courseId,
              },
            },
            update: {},
            create: {
              userId: userId as string,
              courseId: item.courseId,
              amount: 0,
              status: 'completed',
              orderId,
              accessExpiresAt: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ),
            },
          })
        );
      }

      await prisma.$transaction(ops);

      // E-book delivery for free orders (idempotent-ish: check existing token per order+ebook)
      try {
        const bookItems = validatedItems.filter(i => i.type === 'book');
        if (bookItems.length > 0 && customerEmail && !customerEmail.startsWith('guest-')) {
          const crypto = await import('crypto');
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';

          for (const book of bookItems) {
            const ebookId = (book.id && typeof book.id === 'string') ? book.id : 'brodboken-2026';

            // Optional: avoid duplicates if route is retried
            const existing = await prisma.ebookDownload.findFirst({
              where: { orderNumber: orderId, ebookId }
            });

            if (existing) {
              console.log('ℹ️ Ebook token already exists (skipping create+email):', { orderId, ebookId });
              continue;
            }
            // If you have a unique constraint on (orderNumber, ebookId), you can upsert.
            const downloadToken = crypto.randomBytes(16).toString('hex').toUpperCase();

            await prisma.ebookDownload.create({
              data: {
                token: downloadToken,
                orderNumber: orderId,
                customerEmail,
                ebookId,
                ebookName: book.name,
                maxDownloads: 5,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              }
            });

            const downloadUrl = `${baseUrl}/brodboken/ladda-ner?token=${downloadToken}`;

            await emailService.sendEbookDownloadEmail({
              email: customerEmail,
              name: customerName || customerEmail.split('@')[0],
              ebookName: book.name,
              downloadUrl,
              downloadPassword: downloadToken,
              orderNumber: orderId
            });
          }

          console.log(`✅ E-book delivery email sent (free order): ${customerEmail}`);
        }
        console.log(`✅ E-book delivery flow done (free order): ${customerEmail}`);
      } catch (e) {
      console.warn('⚠️ Failed to send ebook email (free order, non-critical):', e);
      }
      
      // Send confirmation email
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
        const courseItems = validatedItems.filter(i => i.type === 'course');
        const bookItems = validatedItems.filter(i => i.type === 'book');
        
        await emailService.sendOrderConfirmation({
          customerEmail,
          customerName,
          orderNumber: orderId,
          totalAmount: 0,
          courses: validatedItems.filter(i => i.type === 'course').map(i => ({ name: i.name, price: 0 })),
          loginCredentials: (needsLoginCredentials && temporaryPassword) ? {
            email: customerEmail,
            password: temporaryPassword,
            loginUrl: `${baseUrl}/login`
          } : undefined,
          isExistingUser: !needsLoginCredentials
        });
      } catch (e) {
        console.warn('⚠️ Failed to send free-order email (non-critical):', e);
      }

      // Add to Mailchimp with course tags (for free orders like prova-på-vecka)
      try {
        const mailchimpMarketing = getMailchimpMarketing();
        if (mailchimpMarketing.isConfigured()) {
          const productNames = validatedItems
            .filter(item => item.type === 'course' || item.type === 'book')
            .map(item => item.name);
          const nameParts = (customerName || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          await mailchimpMarketing.addCustomerWithCourseTags(customerEmail, productNames, firstName, lastName);
          console.log(`✅ Customer added to Mailchimp with product tags (free order): ${customerEmail}`);
        }
      } catch (mailchimpError) {
        console.warn('⚠️ Failed to add to Mailchimp (non-critical):', mailchimpError);
      }

      // Return a lightweight GUI snippet similar to simulated payments
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
      const snippet = `
        <div style="padding:24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
          <h2 style="margin:0 0 8px 0;color:#014421">Gratis beställning</h2>
          <p style="margin:0 0 16px 0;color:#334155">Din rabatt gör att totalsumman blir 0 kr. Klicka för att slutföra.</p>
          <a href="${baseUrl}/checkout/success/svea-v2?checkoutOrderId=SIMULATED&orderId=${orderId}"
             style="display:inline-block;background:#014421;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Slutför</a>
        </div>`;

      return NextResponse.json({
        success: true,
        checkoutOrderId: 'SIMULATED',
        orderId,
        gui: { snippet }
      });
    }

    function splitDiscountByVat(
      validatedItems: any[],
      totalDiscountOre: number
    ): { discount6: number; discount25: number } {
      // Beräkna subtotal (inkl moms) per momssats
      let subtotal6 = 0;
      let subtotal25 = 0;

      for (const it of validatedItems) {
        const vat = it.vatRate ?? (it.type === 'book' ? 0.06 : 0.25);
        const priceInclVat = it.price * (1 + vat); // it.price exkl moms
        // OBS: här behöver vi vara konsekventa med din avrundningslogik (du rundar till kronor innan öre)
        const priceInclVatRoundedKr = Math.round(priceInclVat);
        const ore = priceInclVatRoundedKr * 100 * it.quantity;

        if (Math.abs(vat - 0.06) < 0.001) subtotal6 += ore;
        else subtotal25 += ore;
      }

      const total = subtotal6 + subtotal25;
      if (total <= 0) return { discount6: 0, discount25: totalDiscountOre };

      // Proportionell fördelning
      let discount6 = Math.round(totalDiscountOre * (subtotal6 / total));
      let discount25 = totalDiscountOre - discount6;

      // Säkerställ inga negativa
      if (discount6 < 0) discount6 = 0;
      if (discount25 < 0) discount25 = 0;

      return { discount6, discount25 };
    }

    // Add discount as negative item(s) if applicable (split by VAT when mixed)
    if (discountAmount > 0 && appliedCoupon) {
      const { discount6, discount25 } = splitDiscountByVat(validatedItems, discountAmount);
      
      if (discount6 > 0) {
         sveaItems.push({
           articleNumber: 'DISCOUNT-6',
           name: `Rabatt 6% (${appliedCoupon.code})`,
           quantity: 1,
           unitPrice: -discount6,   // öre, inkl moms
           vatPercent: 600,
           unit: 'st',
         });
      }

      if (discount25 > 0) {
         sveaItems.push({
           articleNumber: 'DISCOUNT-25',
           name: `Rabatt 25% (${appliedCoupon.code})`,
           quantity: 1,
           unitPrice: -discount25,  // öre, inkl moms
           vatPercent: 2500,
           unit: 'st',
         });
      }
    }

    // Generate order ID
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 9);
    const orderId = `FF-${timestamp}-${randomPart}`;

    // Get site base URL for Svea callback URLs.
    // IMPORTANT: Prefer configured canonical URL over request Origin.
    // When testing on a Railway subdomain, Origin may be a *.up.railway.app host which Svea may reject.
    const configuredBaseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      '';
    const requestOrigin = req.headers.get('origin') || '';
    const originRaw = (configuredBaseUrl || requestOrigin || 'https://www.functionalfoods.se').trim();
    const origin = originRaw.replace(/\/+$/, '');

    // Create Svea checkout order
    const checkoutRequest: CreateCheckoutOrderRequest = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: orderId,
      merchantSettings: {
        termsUri: `${origin}/anvandarvillkor`,
        checkoutUri: `${origin}/checkout/svea`,
        confirmationUri: `${origin}/checkout/success/svea-v2?orderId=${encodeURIComponent(orderId)}`,
        pushUri: `${origin}/api/webhooks/svea-v2`
      },
      cart: {
        items: [...sveaItems] // Explicit copy to ensure it's set
      },
      merchantData: orderId
    };
    
    // CRITICAL: Double-check that items are set
    if (!checkoutRequest.cart.items || checkoutRequest.cart.items.length === 0) {
      console.error('❌❌❌ CRITICAL ERROR: cart.items is empty!');
      console.error('sveaItems:', sveaItems);
      console.error('checkoutRequest.cart:', checkoutRequest.cart);
      throw new Error('Cart items are empty - cannot create Svea order');
    }
    
    // CRITICAL: Verify cart.items is set correctly
    console.log('🚨🚨🚨 CRITICAL CART VERIFICATION:');
    console.log('sveaItems length:', sveaItems.length);
    console.log('checkoutRequest.cart.items length:', checkoutRequest.cart.items.length);
    console.log('checkoutRequest.cart.items:', JSON.stringify(checkoutRequest.cart.items, null, 2));
    
    // CRITICAL DEBUG LOGGING
    console.log('🚨 SVEA CHECKOUT REQUEST DEBUG:');
    console.log('Items being sent to Svea:', JSON.stringify(sveaItems, null, 2));
    const totalInOre = sveaItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    console.log(`Total to charge: ${totalInOre} öre (${totalInOre / 100} kr)`);

    // Add customer email if available
    if (customer?.email) {
      checkoutRequest.presetValues = [{
        typeName: 'emailAddress',
        value: customer.email,
        isReadonly: false
      }];
    }

    console.log('📤 Creating Svea checkout order:', {
      orderId,
      itemCount: sveaItems.length,
      totalAmount: SveaCheckoutService.formatPriceFromMinorUnits(subtotal - discountAmount),
      hasCustomer: !!customer?.email
    });

    // Create order in Svea
    console.log('📤 Sending request to Svea with items:', JSON.stringify(sveaItems, null, 2));
    
    // CRITICAL: Ensure cart.items is set before sending
    checkoutRequest.cart.items = [...sveaItems]; // Force set again just before sending
    
    console.log('📤 FULL Svea checkout request:', JSON.stringify(checkoutRequest, null, 2));
    console.log('📤 VERIFICATION - cart.items.length:', checkoutRequest.cart.items.length);

    // 🔥 HOTFIX: Ensure Svea unitPrice is ALWAYS in minor units (öre) right before createOrder
    checkoutRequest.cart.items = checkoutRequest.cart.items.map((i: any) => {
      let unitPrice = i.unitPrice;

      // Convert SEK -> öre if it looks like SEK (e.g. 995 instead of 99500)
      // Heuristic: for your products, any non-zero abs(unitPrice) < 1000 is almost certainly SEK.
      if (Number.isFinite(unitPrice) && Math.abs(unitPrice) > 0 && Math.abs(unitPrice) < 1000) {
        unitPrice = Math.round(unitPrice * 100);
      }

      // Ensure integer
      unitPrice = Math.trunc(unitPrice);

      return { ...i, unitPrice };
    });

    // Log to verify
    console.log('🧾 FINAL SVEA ITEMS (post-normalize):', JSON.stringify(checkoutRequest.cart.items, null, 2));
    
    // Calculate expected total
    const expectedTotal = checkoutRequest.cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    console.log(`💰 Expected total to charge: ${expectedTotal} öre (${expectedTotal / 100} kr, rundat upp till närmsta krona)`);
    
    let sveaResponse;
    try {
      sveaResponse = await sveaCheckout.createOrder(checkoutRequest);
      console.log('✅ Svea order created successfully:', {
        checkoutOrderId: sveaResponse.orderId,
        status: sveaResponse.status,
        hasGui: !!sveaResponse.gui
      });
    } catch (sveaError: any) {
      console.error('❌ Svea createOrder failed:', {
        error: sveaError,
        message: sveaError?.message,
        stack: sveaError?.stack,
        name: sveaError?.name,
        response: sveaError?.response,
        checkoutRequest: {
          orderId: checkoutRequest.clientOrderNumber,
          itemCount: checkoutRequest.cart.items.length,
          totalAmount: checkoutRequest.cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
        }
      });
      throw sveaError; // Re-throw to be caught by outer catch
    }

    // Store order in database
    // Calculate total amount AFTER discount (in öre, then convert to SEK)
    const totalAmountInOre = subtotal - discountAmount;
    // Runda upp till närmsta krona
    const totalAmount = Math.ceil(SveaCheckoutService.formatPriceFromMinorUnits(totalAmountInOre));
    
    // Calculate discounted price per item (proportionally)
    // If discount is applied, distribute it proportionally across items
    const subtotalBeforeDiscount = subtotal;
    const discountRatio = discountAmount > 0 ? (totalAmountInOre / subtotalBeforeDiscount) : 1;
    
    console.log('💾 Storing order in database:', {
      orderId,
      totalAmount,
      totalAmountInOre,
      subtotalBeforeDiscount,
      discountAmount,
      discountRatio,
      itemCount: validatedItems.length,
      hasCustomer: !!customer,
      customerEmail: customer?.email
    });
    
    // CRITICAL: Let's check if we're somehow converting the items incorrectly
    console.log('🚨🚨🚨 CRITICAL AMOUNT CHECK:');
    console.log('Subtotal in ÖRE:', subtotal);
    console.log('Discount in ÖRE:', discountAmount);
    console.log('Total in ÖRE:', totalAmountInOre);
    console.log('Total in KRONOR (for DB):', totalAmount);
    console.log('If this shows 22.95, but Svea shows 0.25, then we are sending KRONOR to Svea instead of ÖRE!');
    
    try {
      // Get or create user - userId is required in Order model
      let userId: string;
      
      if (customer?.id) {
        // User is logged in, use their ID
        userId = customer.id;
        console.log('✅ Using existing logged-in user:', userId);
      } else if (customer?.email) {
        // User provided email but not logged in - find or create user
        const normalizedEmail = customer.email.toLowerCase().trim();
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });
        
        if (!user) {
          // Create new user with temporary password
          const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
          const hashed = await bcrypt.hash(temporaryPassword, 12);
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: customer.name || customer.email.split('@')[0] || 'Kund',
              password: hashed,
              role: 'customer',
              isActive: true,
              mustChangePassword: true
            }
          });
          console.log(`✅ Created new user for order: ${user.email}`);
        } else {
          console.log(`✅ Found existing user: ${user.email}`);
        }
        userId = user.id;
      } else {
        // No customer info - create a temporary guest user
        const tempEmail = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@functionalfoods.se`;
        const hashed = await bcrypt.hash(Math.random().toString(36), 10);
        const guestUser = await prisma.user.create({
          data: {
            email: tempEmail,
            name: 'Gäst',
            password: hashed,
            role: 'customer',
            isActive: true,
            mustChangePassword: false
          }
        });
        userId = guestUser.id;
        console.log(`✅ Created guest user for order: ${guestUser.id}`);
      }
      
      // Calculate discounted price per item
      // Each item's price should reflect the discount proportionally
      const itemsWithDiscountedPrice = validatedItems.map(item => {
        // Use item's actual VAT rate (6% for books, 25% for courses)
        const itemVatRate = item.vatRate || (item.type === 'book' ? BOOK_VAT_RATE : DEFAULT_VAT_RATE);
        // Item price is exkl. VAT, but we need to calculate the discounted price
        // Original item total in öre (inkl. VAT)
        const itemTotalInOreInclVAT = SveaCheckoutService.formatPriceToMinorUnits(item.price * (1 + itemVatRate)) * item.quantity;
        // Apply discount ratio to get discounted total
        const discountedItemTotalInOre = Math.round(itemTotalInOreInclVAT * discountRatio);
        // Convert back to SEK per unit (exkl. VAT for storage)
        const discountedPricePerUnit = SveaCheckoutService.formatPriceFromMinorUnits(discountedItemTotalInOre / item.quantity) / (1 + itemVatRate);
        
        return {
          ...item,
          discountedPrice: Math.round(discountedPricePerUnit * 100) / 100 // Round to 2 decimals
        };
      });
      
      // Now create the order with a valid userId
      await prisma.order.create({
        data: {
          id: orderId,
          orderNumber: orderId,
          status: 'PENDING',
          totalAmount,
          currency: 'SEK',
          checkoutOrderId: sveaResponse.orderId.toString(),
          userId: userId, // Now guaranteed to be a valid string
          customerEmail: customer?.email || null,
          customerName: customer?.name || null,
          metadata: {
            items: validatedItems, // Use validated items
            couponCode: appliedCoupon?.code || null,
            discountAmount: discountAmount > 0 
              ? SveaCheckoutService.formatPriceFromMinorUnits(discountAmount) 
              : null,
            attribution: attribution || null
          },
          items: {
            create: itemsWithDiscountedPrice.map((item) => ({
              courseId: item.type === 'course' ? item.courseId : null,
              name: item.name,
              quantity: item.quantity,
              price: item.discountedPrice,
              type: item.type
            })),
          },
        },
      });
      
      console.log('✅ Order stored in database successfully');
    } catch (dbError: any) {
      console.error('❌ Failed to store order in database:', {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        orderId,
        code: dbError?.code,
        name: dbError?.name
      });
      throw new Error(`Kunde inte spara order i databasen: ${dbError?.message || 'Okänt fel'}`);
    }

    // Update coupon usage
    if (appliedCoupon) {
      try {
        await prisma.coupon.update({
          where: { id: appliedCoupon.id },
          data: { timesUsed: { increment: 1 } }
        });
        console.log('✅ Coupon usage updated');
      } catch (couponError) {
        console.warn('⚠️ Failed to update coupon usage (non-critical):', couponError);
        // Non-critical error, continue
      }
    }

    return NextResponse.json({
      success: true,
      checkoutOrderId: sveaResponse.orderId,
      orderId: orderId,
      gui: sveaResponse.gui
    });

  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message;
    const errorStack = errorObj.stack;
    
    // Log full error details
    console.error('💥💥💥 CHECKOUT ERROR 💥💥💥');
    console.error('Error object:', errorObj);
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    console.error('Error name:', errorObj.name);
    console.error('Error type:', typeof error);
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Error code:', (error as any).code);
    }
    console.error('💥💥💥 END ERROR 💥💥💥');
    
    // Check for specific error types
    const isConfigError = errorMessage.includes('configuration missing') || 
                         errorMessage.includes('credentials not configured') ||
                         errorMessage.includes('inte konfigurerat');
    const isSveaError = errorMessage.includes('Svea API Error') || 
                       errorMessage.includes('SVEA') ||
                       errorMessage.includes('401') ||
                       errorMessage.includes('Unauthorized');
    const isValidationError = errorMessage.includes('hittades inte') ||
                              errorMessage.includes('Inga produkter') ||
                              errorMessage.includes('validering');
    const isDbError = errorMessage.includes('databasen') ||
                      errorMessage.includes('database') ||
                      errorMessage.includes('Prisma') ||
                      errorMessage.includes('Unique constraint') ||
                      errorMessage.includes('Foreign key');
    
    // Determine status code
    let statusCode = 500;
    if (isConfigError) statusCode = 503;
    else if (isValidationError) statusCode = 400;
    else if (isSveaError) statusCode = 502; // Bad Gateway for external API errors
    else if (isDbError) statusCode = 500;
    
    // Build user-friendly error message
    let userMessage = 'Ett fel uppstod vid skapande av beställning. Försök igen.';
    if (isConfigError) {
      userMessage = 'Betalningssystemet är inte konfigurerat. Kontakta support.';
    } else if (isSveaError) {
      userMessage = `SVEA fel: ${errorMessage}`;
    } else if (isValidationError) {
      userMessage = errorMessage;
    } else if (isDbError) {
      userMessage = 'Ett fel uppstod vid sparande av order. Kontakta support om problemet kvarstår.';
    }
    
    return NextResponse.json({
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        errorType: isConfigError
          ? 'CONFIG_ERROR'
          : isSveaError
            ? 'SVEA_API_ERROR'
            : isValidationError
              ? 'VALIDATION_ERROR'
              : isDbError
                ? 'DATABASE_ERROR'
                : 'UNKNOWN_ERROR',
          fullError: process.env.NODE_ENV === 'development'
            ? { message: errorMessage, stack: errorStack, name: errorObj.name, code: (error as any)?.code }
            : undefined,
      }, 
      { status: statusCode }
    );
  }
}
