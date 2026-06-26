import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, checkoutRateLimit } from "@/app/lib/rate-limit";
import { prisma } from "@/app/lib/database";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return withRateLimit(req, checkoutRateLimit, async () => {
    try {
      const body = await req.json();
      const { items, customer, couponCode, attribution } = body as {
        items: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
          type: "course" | "book";
        }>;
        customer?: { email?: string; name?: string; id?: string };
        couponCode?: string;
        attribution?: {
          gclid?: string;
          gbraid?: string;
          wbraid?: string;
          fbclid?: string;
          mc_cid?: string;
          mc_eid?: string; // Mailchimp campaign tracking
          utm_source?: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_term?: string;
          utm_content?: string;
          ref?: string;
          ts?: number;
        };
      };

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: "Inga varor i varukorgen" },
          { status: 400 },
        );
      }

      // Require customer name (and email for receipts) for all purchases
      const customerName = (customer?.name || "").trim();
      const customerEmail = (customer?.email || "").trim();
      if (!customerName) {
        return NextResponse.json(
          { error: "Namn är obligatoriskt" },
          { status: 400 },
        );
      }
      if (!customerEmail) {
        return NextResponse.json(
          { error: "E-postadress är obligatorisk" },
          { status: 400 },
        );
      }

      // --- SECURITY FIX: Fetch product data from database ---
      const courseProducts = await prisma.courseProduct.findMany();
      const slugify = (s: string) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]+/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      const productMap = new Map<string, any>();

      // Add course products to map
      for (const p of courseProducts) {
        const key1 = p.name.toLowerCase().replace(/\s+/g, "-");
        const key2 = slugify(p.name);
        productMap.set(key1, { ...p, type: "course", vatRate: 0.25 });
        productMap.set(key2, { ...p, type: "course", vatRate: 0.25 });
        productMap.set(p.id, { ...p, type: "course", vatRate: 0.25 });
        productMap.set(p.name.toLowerCase(), {
          ...p,
          type: "course",
          vatRate: 0.25,
        });
        productMap.set(p.name, { ...p, type: "course", vatRate: 0.25 });
      }

      // Add hardcoded book products (not in CourseProduct table)
      const bookProducts = [
        {
          id: "brodboken-2026",
          name: "Baka Glutenfritt – E-bok",
          price: 65.09, // 69 kr inkl 6% moms => 65.09 kr exkl moms
          basePrice: 65.09,
          type: "book" as const,
          vatRate: 0.06,
        },
        {
          id: "paskbuffe",
          name: "Påskbuffé – E-bok av Ulrika Davidsson",
          price: 93.4,
          basePrice: 93.4,
          type: "book" as const,
          vatRate: 0.06,
        },
        {
          id: "sota-godsaker",
          name: "Söta Godsaker – E-bok av Ulrika Davidsson",
          price: 102.83, // 109 kr inkl 6% moms => 102.83 kr exkl moms
          basePrice: 102.83,
          type: "book" as const,
          vatRate: 0.06,
        },
        {
          id: "grill-sommarmat",
          name: "Grill- & Sommarmat – E-bok av Ulrika Davidsson",
          price: 140.57,
          basePrice: 140.57,
          type: "book" as const,
          vatRate: 0.06,
        },
      ];

      // Add book products to map
      for (const p of bookProducts) {
        productMap.set(p.id, p);
        productMap.set(p.name.toLowerCase(), p);
        productMap.set(p.name, p);
        productMap.set(slugify(p.name), p);
      }

      // Validate and enrich items with server-side data
      const now = new Date();
      const validatedItems = items.map((item) => {
        let product = productMap.get(item.id);
        // Fallback: try to match by name if ID didn't match
        if (!product && item.name) {
          product =
            productMap.get(item.name.toLowerCase()) ||
            productMap.get(item.name) ||
            courseProducts.find(
              (p) => p.name.toLowerCase() === item.name.toLowerCase(),
            );
          if (product && !product.vatRate) {
            product = { ...product, type: "course", vatRate: 0.25 };
          }
        }
        if (!product) {
          throw new Error(
            `Produkten med id "${item.id}" och namn "${item.name}" hittades inte.`,
          );
        }
        const basePrice =
          typeof product.basePrice === "number"
            ? product.basePrice
            : product.price;
        const saleActive =
          product.salePrice &&
          (!product.saleStartsAt || new Date(product.saleStartsAt) <= now) &&
          (!product.saleEndsAt || new Date(product.saleEndsAt) >= now);
        const effectivePrice = saleActive
          ? (product.salePrice as number)
          : basePrice;
        return {
          ...item,
          price: effectivePrice,
          name: product.name,
          type: product.type || "course",
          vatRate: product.vatRate || 0.25,
        };
      });
              
      // --- END SECURITY FIX ---

      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json(
          { error: "Stripe är inte konfigurerat" },
          { status: 500 },
        );
      }

      const stripe = require("stripe")(secretKey);

      // Calculate subtotal using price INCLUDING VAT (dynamic per item: 6% for books, 25% for courses)
      const subtotal = validatedItems.reduce((sum: number, i) => {
        const itemVatRate = i.vatRate || 0.25;
        const grossInOre = Math.round(i.price * (1 + itemVatRate) * 100);
        return sum + grossInOre * i.quantity;
      }, 0);

      // Optional: validate coupon and compute discount amount in öre (gross incl. VAT, since Stripe charges gross)
      let discountAmount = 0;
      let stripeDiscount: any | null = null;
      if (couponCode) {
        const code = couponCode.toUpperCase().trim();
        const coupon = await prisma.coupon.findUnique({ where: { code } });
        const now = new Date();
        if (
          coupon &&
          coupon.active &&
          (!coupon.startsAt || now >= coupon.startsAt) &&
          (!coupon.expiresAt || now <= coupon.expiresAt) &&
          (coupon.usageLimit == null || coupon.timesUsed < coupon.usageLimit)
        ) {
          const applicableIds =
            coupon.applicableCourseIds &&
            Array.isArray(coupon.applicableCourseIds)
              ? (coupon.applicableCourseIds as string[])
              : null;
          const applicableItems =
            applicableIds && applicableIds.length > 0
              ? validatedItems.filter((i) => applicableIds.includes(i.id))
              : validatedItems;
          const applicableSubtotalExVat = applicableItems.reduce(
            (sum, i) => sum + Math.round(i.price * 100) * i.quantity,
            0,
          );
          const applicableSubtotalGross = applicableItems.reduce((sum, i) => {
            const itemVatRate = i.vatRate || 0.25;
            const grossInOre = Math.round(i.price * (1 + itemVatRate) * 100);
            return sum + grossInOre * i.quantity;
          }, 0);

          if (applicableSubtotalGross > 0) {
            if (coupon.type === "percent") {
              // Stripe applies percent_off to gross line items, so compute gross discount for logging/consistency.
              discountAmount = Math.floor(
                applicableSubtotalGross * (coupon.amount / 100),
              );
            } else {
              // Fixed coupon amounts are stored ex VAT; convert to gross using the effective VAT mix of the applicable items.
              const vatMultiplier =
                applicableSubtotalExVat > 0
                  ? applicableSubtotalGross / applicableSubtotalExVat
                  : 1;
              discountAmount = Math.floor(coupon.amount * 100 * vatMultiplier);
            }
            if (discountAmount > applicableSubtotalGross)
              discountAmount = applicableSubtotalGross;

            // Create a one-time Stripe coupon for the exact amount off if fixed, or percent_off if percent
            if (discountAmount > 0) {
              if (coupon.type === "percent") {
                const createdCoupon = await stripe.coupons.create({
                  percent_off: coupon.amount,
                  duration: "once",
                });
                stripeDiscount = { coupon: createdCoupon.id };
              } else {
                const createdCoupon = await stripe.coupons.create({
                  amount_off: discountAmount,
                  currency: "sek",
                  duration: "once",
                });
                stripeDiscount = { coupon: createdCoupon.id };
              }
            }
          }
        }
      }

      const line_items = validatedItems.map((item) => {
        const itemVatRate = item.vatRate || 0.25;
        const grossUnitAmount = Math.round(
          item.price * (1 + itemVatRate) * 100,
        );
        return {
          price_data: {
            currency: "sek",
            product_data: { name: item.name },
            // Charge price including VAT (dynamic per item type)
            unit_amount: grossUnitAmount,
          },
          quantity: item.quantity,
        };
      });

      // Log checkout details for verification
      console.log("🔍 Stripe Checkout Debug (gross incl. VAT):", {
        items: validatedItems.map((i) => ({
          name: i.name,
          type: i.type,
          vatRate: i.vatRate,
          priceExVatSEK: i.price,
          priceInclVatSEK: Math.round(i.price * (1 + (i.vatRate || 0.25))),
          quantity: i.quantity,
          stripeUnitAmount: Math.round(
            i.price * (1 + (i.vatRate || 0.25)) * 100,
          ),
          totalInOre:
            Math.round(i.price * (1 + (i.vatRate || 0.25)) * 100) * i.quantity,
          totalInSEK:
            Math.round(i.price * (1 + (i.vatRate || 0.25))) * i.quantity,
        })),
        subtotalInOre: subtotal,
        subtotalInSEK: subtotal / 100,
        discountInOre: discountAmount,
        discountInSEK: discountAmount / 100,
        finalInOre: subtotal - discountAmount,
        finalInSEK: (subtotal - discountAmount) / 100,
        couponCode: couponCode || "none",
      });

      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3000";

      // Configure allowed payment methods explicitly (Stripe Checkout does not support automatic_payment_methods)
      const paymentMethodTypes: string[] = ["card"];

      const baseSessionParams: any = {
        mode: "payment",
        line_items,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
        customer_email: customer?.email,
        metadata: {
          items: JSON.stringify(validatedItems), // Use validated items in metadata
          website: "ulrika-functional-foods",
          orderType: "course_purchase",
          couponCode: couponCode || "",
          courseNames: validatedItems.map((item) => item.name).join(", "),
          totalItems: validatedItems.length.toString(),
          customerEmail: customerEmail,
          customerName: customerName,
          // Attribution (flattened for Stripe metadata limits)
          gclid: attribution?.gclid || "",
          gbraid: attribution?.gbraid || "",
          wbraid: attribution?.wbraid || "",
          fbclid: attribution?.fbclid || "",
          mc_cid: attribution?.mc_cid || "",
          mc_eid: attribution?.mc_eid || "",
          utm_source: attribution?.utm_source || "",
          utm_medium: attribution?.utm_medium || "",
          utm_campaign: attribution?.utm_campaign || "",
          utm_term: attribution?.utm_term || "",
          utm_content: attribution?.utm_content || "",
        },
      };

      if (stripeDiscount) {
        baseSessionParams.discounts = [stripeDiscount];
      }

      // Create checkout session with card payment only
      const session = await stripe.checkout.sessions.create({
        ...baseSessionParams,
        payment_method_types: paymentMethodTypes,
      });

      try {
        const { getMailchimpEcommerce } = await import("@/app/lib/mailchimp-ecommerce");
        const mailchimpEcommerce = getMailchimpEcommerce();
        await mailchimpEcommerce.upsertCart({
          cartId: `stripe-${session.id}`,
          customerEmail,
          customerName,
          checkoutUrl: session.url || `${origin}/checkout`,
          items: validatedItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type,
          })),
          totalAmount: (subtotal - discountAmount) / 100,
          currency: "SEK",
          campaignId: attribution?.mc_cid || undefined,
        });
      } catch (mailchimpCartError) {
        console.warn("⚠️ Mailchimp abandoned cart sync failed (stripe, non-critical):", mailchimpCartError);
      }
      
      return NextResponse.json({ url: session.url });
    } catch (err: any) {
      console.error("Create Checkout Session error:", err);
      return NextResponse.json(
        { error: err?.message || "Kunde inte skapa betalning" },
        { status: 500 },
      );
    }
  });
}
