import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PaymentService } from "../../../lib/payment";
import { emailService } from "../../../lib/email";
import { getMailchimpMarketing } from "../../../lib/mailchimp-marketing";
import { trackPurchaseServer } from "@/app/lib/server-analytics";
import {
  SUMMER_EBOOK_CAMPAIGN_ID,
  SUMMER_EBOOK_CAMPAIGN_TAG,
  hasSummerEbookBundleByIdentity,
} from "@/app/lib/campaigns/summer-ebooks";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const paymentService = new PaymentService();

const EBOOK_DOWNLOAD_ROUTES: Record<string, string> = {
  "brodboken-2026": "/brodboken/ladda-ner",
  paskbuffe: "/e-bocker/paskbuffe/ladda-ner",
  "sota-godsaker": "/e-bocker/sota-godsaker/ladda-ner",
  "grill-sommarmat": "/e-bocker/grill-sommarmat/ladda-ner",
  "halsosamma-frukostar": "/e-bocker/halsosamma-frukostar/ladda-ner",
};

const EBOOK_DISPLAY_NAMES: Record<string, string> = {
  "brodboken-2026": "Baka Glutenfritt – E-bok",
  paskbuffe: "Påskbuffé – E-bok av Ulrika Davidsson",
  "sota-godsaker": "Söta Godsaker – E-bok av Ulrika Davidsson",
  "grill-sommarmat": "Grill- & Sommarmat – E-bok av Ulrika Davidsson",
  "halsosamma-frukostar": "Hälsosamma Frukostar – E-bok av Ulrika Davidsson",
};

const EBOOK_PRICES_EX_VAT: Record<string, number> = {
  "brodboken-2026": 65.09,
  paskbuffe: 93.4,
  "sota-godsaker": 102.83,
  "grill-sommarmat": 140.57,
  "halsosamma-frukostar": 93.4,
};

function resolveEbookId(item: any): string | null {
  const value = String(
    [
      item?.id,
      item?.courseId,
      item?.name,
      item?.description,
      item?.price?.product?.name,
      item?.price?.product,
    ]
      .filter(Boolean)
      .join(" "),
  ).toLowerCase();

  if (!value) return null;

  if (
    value.includes("söta godsaker") ||
    value.includes("sota godsaker") ||
    value.includes("sota-godsaker")
  ) {
    return "sota-godsaker";
  }
  
  if (
    value.includes("grill- & sommarmat") ||
    value.includes("grill sommarmat") ||
    value.includes("grill och sommarmat") ||
    value.includes("grill-sommarmat")
  ) {
    return "grill-sommarmat";
  }

  if (value.includes("påskbuffé") || value.includes("paskbuffe")) {
    return "paskbuffe";
  }

  if (
    value.includes("hälsosamma frukostar") ||
    value.includes("halsosamma frukostar") ||
    value.includes("halsosamma-frukostar")
  ) {
    return "halsosamma-frukostar";
  }

  if (
    value.includes("brodboken") ||
    value.includes("brodbok") ||
    value.includes("baka glutenfritt") ||
    value.includes("glutenfritt") ||
    value.includes("brodboken-2026")
  ) {
    return "brodboken-2026";
  }

  return null;
}

function buildEbookDownloadUrl(baseUrl: string, ebookId: string, token: string) {
  const route =
    EBOOK_DOWNLOAD_ROUTES[ebookId] || EBOOK_DOWNLOAD_ROUTES["brodboken-2026"];
  return `${baseUrl}${route}?token=${token}`;
}

function normalizeStripeItem(item: any) {
  const ebookId = resolveEbookId(item);
  const type = item?.type || item?.t || (ebookId ? "book" : "course");
  const id = item?.id || ebookId || "course";
  const quantity = item?.quantity || item?.q || 1;
  const name =
    item?.name || (ebookId ? EBOOK_DISPLAY_NAMES[ebookId] : undefined);
  const price =
    item?.price ??
    (ebookId ? EBOOK_PRICES_EX_VAT[ebookId] : undefined) ??
    0;

  return {
    ...item,
    id,
    name,
    price,
    quantity,
    type,
  };
}

async function ensureEbookDownloadsForOrder(
  order: any,
  email: string,
  name: string,
) {
  const bookItems = (order?.items || []).filter(
    (item: any) => item.type === "book" || resolveEbookId(item),
  );

  if (bookItems.length === 0 || !email || email.startsWith("guest-")) {
    return;
  }

  const crypto = await import("crypto");
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://www.functionalfoods.se";

  for (const book of bookItems) {
    const ebookId = resolveEbookId(book) || "brodboken-2026";
    const existingDownload = await prisma.ebookDownload.findFirst({
      where: {
        orderNumber: order.orderNumber,
        ebookId,
      },
    });

    if (existingDownload) continue;

    const downloadToken = crypto.randomBytes(16).toString("hex").toUpperCase();

    await prisma.ebookDownload.create({
      data: {
        token: downloadToken,
        orderNumber: order.orderNumber,
        customerEmail: email,
        ebookId,
        ebookName: book.name || EBOOK_DISPLAY_NAMES[ebookId],
        maxDownloads: 5,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await emailService.sendEbookDownloadEmail({
      email,
      name,
      ebookName: book.name || EBOOK_DISPLAY_NAMES[ebookId],
      downloadUrl: buildEbookDownloadUrl(baseUrl, ebookId, downloadToken),
      downloadPassword: downloadToken,
      orderNumber: order.orderNumber,
    });

    console.log(
      `✅ Ensured Stripe e-book delivery: ${order.orderNumber} (${ebookId})`,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const providerHeader = request.headers.get("x-payment-provider") || "";
    const stripeSig = request.headers.get("stripe-signature");

    // If this is a Stripe webhook, handle it directly using Stripe's signature
    if (stripeSig) {
      return await handleStripeWebhook(body, stripeSig);
    }

    const provider = providerHeader.toLowerCase();

    const payload = JSON.parse(body);

    // Process webhook based on provider (non-Stripe)
    switch (provider) {
      case "klarna":
        return await handleKlarnaWebhook(payload);
      case "swish":
        return await handleSwishWebhook(payload);
      default:
        console.warn(
          `Unknown or missing payment provider header: ${providerHeader}`,
        );
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyWebhookSignature(
  body: string,
  signature: string,
  provider: string,
): Promise<boolean> {
  // In development, skip signature verification
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  // TODO: Implement signature verification for each provider
  switch (provider) {
    case "klarna":
      // Implement Klarna signature verification
      // return verifyKlarnaSignature(body, signature);
      break;
    case "stripe":
      // Implement Stripe signature verification
      // return verifyStripeSignature(body, signature);
      break;
    case "swish":
      // Implement Swish signature verification
      // return verifySwishSignature(body, signature);
      break;
  }

  return false;
}

async function handleKlarnaWebhook(payload: any): Promise<NextResponse> {
  try {
    const { order_id, event_type } = payload;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Find payment by external ID
    const payment = await prisma.payment.findFirst({
      where: { externalId: order_id },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      console.warn(`Payment not found for Klarna order: ${order_id}`);
      return NextResponse.json({ received: true });
    }

    switch (event_type) {
      case "checkout.order.completed":
      case "order.captured":
        await completePayment(payment.id, payload);
        break;
      case "order.cancelled":
      case "order.expired":
        await cancelPayment(payment.id, payload);
        break;
      default:
        console.log(`Unhandled Klarna event: ${event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Klarna webhook error:", error);
    return NextResponse.json(
      { error: "Klarna webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleStripeWebhook(
  body: string,
  signature: string,
): Promise<NextResponse> {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    let event;

    try {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Stripe webhook event received:", event.type);

    // Hantera olika typer av Stripe-events
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;
      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object);
        break;
      case "payment_intent.processing":
        await handlePaymentProcessing(event.data.object);
        break;
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Stripe webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  console.log("💰 Payment succeeded:", paymentIntent.id);

  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id },
    include: { order: { include: { items: true } } },
  });

  if (payment) {
    // Verify amount matches
    const expectedAmountInOre = Math.round(payment.order.totalAmount * 100);
    const actualAmountInOre = paymentIntent.amount;

    console.log("🔍 Amount Verification:", {
      orderNumber: payment.order.orderNumber,
      expectedInSEK: payment.order.totalAmount,
      expectedInOre: expectedAmountInOre,
      actualInOre: actualAmountInOre,
      actualInSEK: actualAmountInOre / 100,
      match: Math.abs(expectedAmountInOre - actualAmountInOre) <= 1,
      difference: actualAmountInOre - expectedAmountInOre,
    });

    if (Math.abs(expectedAmountInOre - actualAmountInOre) > 1) {
      console.error("❌ AMOUNT MISMATCH DETECTED!", {
        expected: expectedAmountInOre,
        actual: actualAmountInOre,
        difference: actualAmountInOre - expectedAmountInOre,
        orderNumber: payment.order.orderNumber,
      });
    }

    await completePayment(payment.id, paymentIntent);
  } else {
    console.error("❌ Payment not found for PaymentIntent:", paymentIntent.id);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  console.log("Payment failed:", paymentIntent.id);

  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id },
  });

  if (payment) {
    await failPayment(payment.id, paymentIntent);
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  console.log("Payment canceled:", paymentIntent.id);

  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CANCELLED",
        gatewayResponse: paymentIntent,
        processedAt: new Date(),
      },
    });
  }
}

async function handlePaymentProcessing(paymentIntent: any) {
  console.log("Payment processing:", paymentIntent.id);

  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id },
  });

  if (payment && payment.status !== "PROCESSING") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PROCESSING",
        gatewayResponse: paymentIntent,
      },
    });
  }
}

async function findStripeOrder(session: any, includeRelations = false) {
  const internalOrderId = session.metadata?.orderId || null;
  const legacyOrderNumber =
    session.amount_total === 0
      ? `STRIPE-FREE-${session.id}`
      : `STRIPE-${session.id}`;

  const include = includeRelations ? { items: true, user: true } : undefined;

  if (internalOrderId) {
    const byInternalId = await prisma.order.findUnique({
      where: { id: internalOrderId },
      include,
    });

    if (byInternalId) return byInternalId;
  }

  return prisma.order.findFirst({
    where: {
      OR: [
        { checkoutOrderId: session.id },
        { orderNumber: legacyOrderNumber },
      ],
    },
    include,
  });
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log("🎉 Checkout session completed:", {
      sessionId: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      payment_status: session.payment_status,
      has_payment_intent: !!session.payment_intent,
      internalOrderId: session.metadata?.orderId || null,
    });

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    // Free orders (0 kr) → no PI → process like free
    if (session.amount_total === 0 || !session.payment_intent) {
      console.log(
        "💰 Free order detected (0 kr) - processing without payment_intent",
      );
      await handleFreeOrder(session);
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    const customerEmail = (
      session.customer_details?.email ||
      session.customer_email ||
      ""
    )
      .trim()
      .toLowerCase();
    const customerName =
      session.customer_details?.name || customerEmail.split("@")[0] || "Kund";
    const totalIncl = (session.amount_total || 0) / 100;

    // 1. Idempotency: check if payment already exists
    const alreadyPayment = await prisma.payment.findFirst({
      where: { externalId: String(paymentIntentId) },
      include: { order: { include: { items: true, user: true } } },
    });
    if (alreadyPayment) {
      console.log(
        "ℹ️ Payment already recorded for PI:",
        paymentIntentId,
        "- verifying e-book delivery before skipping duplicate processing.",
      );
      if (alreadyPayment.order) {
        await ensureEbookDownloadsForOrder(
          alreadyPayment.order,
          alreadyPayment.order.customerEmail ||
            alreadyPayment.order.user?.email ||
            customerEmail,
          alreadyPayment.order.customerName ||
            alreadyPayment.order.user?.name ||
            customerName ||
            customerEmail,
        );
      }
      return;
    }

    // 2. Try to find existing internal order first
    let existingOrder: any = await findStripeOrder(session, false);

    // 3. Parse items only as fallback / legacy support
    let items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      type: string;
    }> = [];

    if (!existingOrder) {
      try {
        const raw = (session.metadata as any)?.items || "";
        if (raw) items = JSON.parse(raw).map(normalizeStripeItem);
      } catch (e) {
        console.warn(
          "⚠️ Failed to parse metadata items, will try Stripe line_items",
        );
      }

      if (items.length === 0) {
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
            { limit: 50 },
          );
          items = lineItems.data.map((li: any) => {
            const normalized = normalizeStripeItem(li);
            return {
              id: normalized.id,
              name:
                normalized.name || li.description || li.price?.product || "Kurs",
              price: (li.amount_total || li.amount_subtotal || 0) / 100,
              quantity: li.quantity || 1,
              type: normalized.type,
            };
          });
        } catch {}
      }

      if (items.length === 0) {
        console.error("❌ No items found on completed session");
        return;
      }
    }

    const attribution = {
      gclid: session.metadata?.gclid || "",
      gbraid: session.metadata?.gbraid || "",
      wbraid: session.metadata?.wbraid || "",
      fbclid: session.metadata?.fbclid || "",
      mc_cid: session.metadata?.mc_cid || "",
      mc_eid: session.metadata?.mc_eid || "",
      utm_source: session.metadata?.utm_source || "",
      utm_medium: session.metadata?.utm_medium || "",
      utm_campaign: session.metadata?.utm_campaign || "",
      utm_term: session.metadata?.utm_term || "",
      utm_content: session.metadata?.utm_content || "",
    };

    let finalOrderId: string | null = null;

    let processedOrderId: string | null = null;

    await prisma.$transaction(async (tx) => {
      // Get or create user
      let user = await tx.user.findUnique({ where: { email: customerEmail } });
      const isNewUser = !user;
      let temporaryPassword = "";

      if (!user) {
        const bcrypt = require("bcryptjs");
        temporaryPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8).toUpperCase();

        const hashed = await bcrypt.hash(temporaryPassword, 12);

        user = await tx.user.create({
          data: {
            email: customerEmail,
            name: customerName,
            password: hashed,
            role: "customer",
            mustChangePassword: true,
          },
        });

        console.log(`✅ New user created via webhook: ${user.email}`);
      }

      let order: any = existingOrder
        ? await tx.order.findUnique({
            where: { id: existingOrder.id },
            include: { items: true },
          })
        : null;

      // Preferred path: update existing internal order
      if (order) {
        const currentMetadata = (order.metadata as any) || {};

        order = await tx.order.update({
          where: { id: order.id },
          data: {
            userId: order.userId || user.id,
            customerEmail: order.customerEmail || customerEmail,
            customerName: order.customerName || customerName,
            status: "COMPLETED",
            totalAmount: order.totalAmount || totalIncl,
            currency: String(
              order.currency || session.currency || "SEK",
            ).toUpperCase(),
            checkoutOrderId: session.id,
            metadata: {
              ...currentMetadata,
              attribution: currentMetadata.attribution || attribution,
              campaignId:
                currentMetadata.campaignId ||
                session.metadata?.campaignId ||
                null,
              campaignSource:
                currentMetadata.campaignSource ||
                session.metadata?.campaignSource ||
                null,
              recoveredFromOrderId:
                currentMetadata.recoveredFromOrderId ||
                session.metadata?.recoveredFromOrderId ||
                null,
              stripeSessionId: session.id,
              stripePaymentIntentId: String(paymentIntentId),
            },
          },
          include: { items: true },
        });

        console.log(
          `✅ Existing order finalized via webhook: ${order.orderNumber}`,
        );
      } else {
        // Legacy fallback: create new order from session metadata
        order = await tx.order.create({
          data: {
            orderNumber: `STRIPE-${session.id}`,
            checkoutOrderId: session.id,
            userId: user.id,
            customerEmail,
            customerName,
            status: "COMPLETED",
            totalAmount: totalIncl,
            currency: String(session.currency || "SEK").toUpperCase(),
            metadata: {
              attribution,
              campaignId: session.metadata?.campaignId || null,
              campaignSource: session.metadata?.campaignSource || null,
              recoveredFromOrderId:
                session.metadata?.recoveredFromOrderId || null,
              stripeSessionId: session.id,
              stripePaymentIntentId: String(paymentIntentId),
            },
            items: {
              create: items.map((it) => ({
                courseId: null,
                name: it.name,
                price: it.price,
                quantity: it.quantity || 1,
                type: it.type || "course",
              })),
            },
          },
          include: { items: true },
        });

        console.log(
          `✅ Legacy order created via webhook: ${order.orderNumber}`,
        );
      }

      finalOrderId = order.id;

      // Record payment
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: "stripe",
          status: "COMPLETED",
          amount: totalIncl,
          currency: String(session.currency || "SEK").toUpperCase(),
          externalId: String(paymentIntentId),
          processedAt: new Date(),
          gatewayResponse: {
            sessionId: session.id,
            attribution,
          },
        },
      });

      // Link order items to actual course ids and create purchases
      const orderItems = order.items || [];
      const sourceItems = orderItems.length > 0 ? orderItems : items;

      const courseNameMap: Record<string, string> = {
        "hormonell balans": "Hormonell Balans",
        "functional flow": "Functional Flow",
        "functional gut health/flow": "Functional Flow",
        "functional basics": "Functional Basics",
        "functional energy": "Functional Energy",
        "functional insulin balance/energy": "Functional Energy",
        "prova på vecka med functional foods!":
          "Prova på vecka med Functional Foods!",
        "prova på vecka": "Prova på vecka med Functional Foods!",
      };

      for (const it of sourceItems.filter((i: any) => i.type === "course")) {
        const normalizedName = it.name.toLowerCase().trim();
        const mappedName = courseNameMap[normalizedName] || it.name;

        let course = await tx.courseProduct.findFirst({
          where: {
            name: { equals: mappedName, mode: "insensitive" },
          },
        });

        if (!course) {
          course = await tx.courseProduct.findFirst({
            where: {
              name: { equals: it.name, mode: "insensitive" },
            },
          });
        }

        if (!course && it.name.toLowerCase().includes("functional")) {
          const functionalPart = it.name.split("Functional ")[1]?.trim();
          if (functionalPart) {
            course = await tx.courseProduct.findFirst({
              where: {
                AND: [
                  { name: { contains: "Functional", mode: "insensitive" } },
                  { name: { contains: functionalPart, mode: "insensitive" } },
                ],
              },
            });
          }
        }

        if (!course) {
          console.error(
            `❌ Course not found for: "${it.name}" (normalized: "${normalizedName}", mapped: "${mappedName}")`,
          );
          continue;
        }

        console.log(`✅ Matched course: "${it.name}" → "${course.name}"`);

        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id,
            },
          },
        });

        if (!existingPurchase) {
          await tx.purchase.create({
            data: {
              userId: user.id,
              courseId: course.id,
              amount: it.price * (it.quantity || 1),
              status: "completed",
              orderId: order.id,
              accessExpiresAt: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
              ),
            },
          });
        }

        await tx.orderItem.updateMany({
          where: {
            orderId: order.id,
            type: "course",
            courseId: null,
            name: it.name,
          },
          data: { courseId: course.id },
        });
      }

      // Send emails
      try {
        const VAT_RATE = 0.25;
        const courseItems = order.items.filter((i: any) => i.type === "course");
        const bookItems = order.items.filter((i: any) => i.type === "book");

        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "https://www.functionalfoods.se";

        if (bookItems.length > 0) {
          for (const book of bookItems) {
            try {
              const crypto = await import("crypto");
              const downloadToken = crypto
                .randomBytes(16)
                .toString("hex")
                .toUpperCase();

              const ebookId = resolveEbookId(book) || "brodboken-2026";

              const existingDownload = await tx.ebookDownload.findFirst({
                where: {
                  orderNumber: order.orderNumber,
                  ebookId,
                },
              });

              if (!existingDownload) {
                await tx.ebookDownload.create({
                  data: {
                    token: downloadToken,
                    orderNumber: order.orderNumber,
                    customerEmail: user.email,
                    ebookId,
                    ebookName: book.name,
                    maxDownloads: 5,
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  },
                });

                await emailService.sendEbookDownloadEmail({
                  email: user.email,
                  name: user.name || user.email,
                  ebookName: book.name || EBOOK_DISPLAY_NAMES[ebookId],
                  downloadUrl: buildEbookDownloadUrl(
                    baseUrl,
                    ebookId,
                    downloadToken,
                  ),
                  downloadPassword: downloadToken,
                  orderNumber: order.orderNumber,
                });

                console.log(`✅ E-book download email sent for: ${book.name}`);
              }
            } catch (ebookError) {
              console.error(
                `❌ Failed to send e-book email for ${book.name}:`,
                ebookError,
              );
            }
          }
        }

        if (courseItems.length > 0) {
          const emailCourses = courseItems.map((it: any) => ({
            name: it.name,
            price: Math.round(it.price * (1 + VAT_RATE)) * (it.quantity || 1),
          }));

          await emailService.sendOrderConfirmation({
            customerEmail: user.email,
            customerName: user.name || user.email,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount || totalIncl,
            courses: emailCourses,
            loginCredentials:
              isNewUser && temporaryPassword
                ? {
                    email: user.email,
                    password: temporaryPassword,
                    loginUrl: `${baseUrl}/login`,
                  }
                : undefined,
            isExistingUser: !isNewUser,
          });

          console.log(
            `✅ Order confirmation sent via webhook to ${user.email}`,
          );
        }
      } catch (e) {
        console.error("❌ Failed to send confirmation via webhook:", e);
      }
    });

    if (!finalOrderId) {
      console.warn("⚠️ No order id resolved after webhook transaction");
      return;
    }

    const finalOrder = await prisma.order.findUnique({
      where: { id: finalOrderId },
      include: { user: true, items: true },
    });

    if (!finalOrder) {
      console.warn("⚠️ Final order not found after webhook transaction");
      return;
    }

    await ensureEbookDownloadsForOrder(
      finalOrder,
      finalOrder.customerEmail || finalOrder.user?.email || customerEmail,
      finalOrder.customerName ||
        finalOrder.user?.name ||
        customerName ||
        customerEmail,
    );

    const finalMetadata = (finalOrder.metadata as any) || {};
    if (
      finalMetadata.campaignId !== SUMMER_EBOOK_CAMPAIGN_ID &&
      hasSummerEbookBundleByIdentity(finalOrder.items)
    ) {
      const detectedMetadata = {
        ...finalMetadata,
        campaignId: SUMMER_EBOOK_CAMPAIGN_ID,
        campaignSource:
          finalMetadata.campaignSource ||
          session.metadata?.campaignSource ||
          "bundle-detected",
      };

      await prisma.order.update({
        where: { id: finalOrder.id },
        data: { metadata: detectedMetadata },
      });

      finalOrder.metadata = detectedMetadata;
    }

    // --- Mailchimp Marketing tags ---
    try {
      const metadata = (finalOrder.metadata as any) || {};
      const mailchimpMarketing = getMailchimpMarketing();
      const emailForTracking =
        finalOrder.user?.email || finalOrder.customerEmail || customerEmail;

      if (
        !metadata.mailchimpMarketingTaggedAt &&
        mailchimpMarketing.isConfigured() &&
        emailForTracking &&
        !emailForTracking.startsWith("guest-")
      ) {
        const productNames = finalOrder.items.map((item: any) => item.name);
        const nameParts = (
          finalOrder.customerName ||
          finalOrder.user?.name ||
          ""
        )
          .split(" ")
          .filter(Boolean);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await mailchimpMarketing.addCustomerWithCourseTags(
          emailForTracking,
          productNames,
          firstName,
          lastName,
          metadata.campaignId === SUMMER_EBOOK_CAMPAIGN_ID
            ? [SUMMER_EBOOK_CAMPAIGN_TAG]
            : [],
        );

        const recoveredTaggedAt =
          metadata.recoveredFromOrderId &&
          !metadata.mailchimpRecoveredTaggedAt
            ? new Date().toISOString()
            : metadata.mailchimpRecoveredTaggedAt;

        if (
          metadata.recoveredFromOrderId &&
          !metadata.mailchimpRecoveredTaggedAt
        ) {
          await mailchimpMarketing.addRecoveredAbandonedCartTag(
            emailForTracking,
          );
        }

        await prisma.order.update({
          where: { id: finalOrder.id },
          data: {
            metadata: {
              ...metadata,
              ...(recoveredTaggedAt
                ? { mailchimpRecoveredTaggedAt: recoveredTaggedAt }
                : {}),
            },
          },
        });

        console.log(
          `✅ Mailchimp Marketing tagged via webhook: ${emailForTracking}`,
        );
      }
    } catch (e) {
      console.warn(
        "⚠️ Mailchimp Marketing subscriber add failed (non-critical):",
        e,
      );
    }

    // --- GA4 server-side purchase tracking ---
    try {
      await trackPurchaseServer({
        transactionId: String(paymentIntentId || session.id),
        value: (session.amount_total || 0) / 100,
        currency: String(session.currency || "SEK").toUpperCase(),
        items: finalOrder.items.map((it: any) => ({
          item_id: it.courseId ? String(it.courseId) : it.name,
          item_name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
        userId: customerEmail || undefined,
        clientSeed: customerEmail || session.id,
      });

      const { sendMetaEvent } = await import("../../../lib/meta-capi");
      await sendMetaEvent({
        eventName: "Purchase",
        eventId: String(session.id),
        email: customerEmail,
        sourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.functionalfoods.se"}/checkout/success`,
        params: {
          value: (session.amount_total || 0) / 100,
          currency: String(session.currency || "SEK").toUpperCase(),
          contents: finalOrder.items.map((it: any) => ({
            id: it.courseId ? String(it.courseId) : it.name,
            quantity: it.quantity,
            item_price: it.price,
          })),
          content_type: "product",
          content_ids: finalOrder.items.map((it: any) =>
            it.courseId ? String(it.courseId) : it.name,
          ),
        },
      });

      console.log("✅ GA4 purchase sent via Measurement Protocol");
    } catch (e) {
      console.warn("⚠️ GA4 purchase tracking failed:", e);
    }

    // --- Mailchimp E-commerce purchase tracking ---
    try {
      const { getMailchimpEcommerce } =
        await import("@/app/lib/mailchimp-ecommerce");
      const mailchimpEcommerce = getMailchimpEcommerce();
      const metadata = (finalOrder.metadata as any) || {};
      const attr = metadata.attribution || attribution;

      const emailForTracking =
        finalOrder.user?.email || finalOrder.customerEmail || customerEmail;

      if (
        mailchimpEcommerce.isConfigured() &&
        emailForTracking &&
        !emailForTracking.startsWith("guest-") &&
        !metadata.mailchimpEcommerceTrackedAt
      ) {
        const totalAmount =
          finalOrder.totalAmount || (session.amount_total || 0) / 100;
        const vatRate = 0.25;
        const taxTotal = (totalAmount * vatRate) / (1 + vatRate);
        const discountTotal = session.total_details?.amount_discount
          ? session.total_details.amount_discount / 100
          : 0;
        const shippingTotal = session.total_details?.amount_shipping
          ? session.total_details.amount_shipping / 100
          : 0;

        const campaignId = attr?.mc_cid || undefined;
        const trackingCode = attr?.utm_campaign || campaignId || undefined;

        let landingSite: string | undefined;
        if (attr?.utm_source || attr?.utm_campaign) {
          const params = new URLSearchParams();
          if (attr?.utm_source) params.set("utm_source", attr.utm_source);
          if (attr?.utm_medium) params.set("utm_medium", attr.utm_medium);
          if (attr?.utm_campaign) params.set("utm_campaign", attr.utm_campaign);
          if (attr?.mc_cid) params.set("mc_cid", attr.mc_cid);
          landingSite = `https://functionalfoods.se/?${params.toString()}`;
        }

        await mailchimpEcommerce.trackPurchase({
          orderId: finalOrder.orderNumber,
          customerEmail: emailForTracking,
          customerName:
            finalOrder.user?.name || finalOrder.customerName || undefined,
          items: finalOrder.items.map((item: any) => ({
            id: item.courseId || `ebook:${item.name}`,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type || "course",
          })),
          totalAmount,
          currency:
            finalOrder.currency ||
            String(session.currency || "SEK").toUpperCase(),
          orderDate: finalOrder.createdAt,
          discountTotal,
          shippingTotal,
          taxTotal,
          campaignId,
          landingSite,
          trackingCode,
        });

        await mailchimpEcommerce.deleteCart(
          metadata.mailchimpCartId ||
            finalOrder.orderNumber ||
            finalOrder.id,
        );

        await prisma.order.update({
          where: { id: finalOrder.id },
          data: {
            metadata: {
              ...metadata,
              mailchimpEcommerceTrackedAt: new Date().toISOString(),
              mailchimpCartDeletedAt: new Date().toISOString(),
            },
          },
        });

        console.log("✅ Mailchimp E-commerce tracked via webhook:", {
          orderId: finalOrder.orderNumber,
          email: emailForTracking,
          itemsCount: finalOrder.items.length,
        });
      }
    } catch (e) {
      console.warn("⚠️ Mailchimp E-commerce tracking failed:", e);
    }

    // Ensure abandoned cart cleanup is persisted even if purchase tracking was
    // already handled by verify or skipped because of idempotency metadata.
    try {
      const refreshedOrder = await prisma.order.findUnique({
        where: { id: finalOrder.id },
        include: { user: true, items: true },
      });

      if (refreshedOrder) {
        const metadata = (refreshedOrder.metadata as any) || {};
        const { getMailchimpEcommerce } =
          await import("@/app/lib/mailchimp-ecommerce");
        const mailchimpEcommerce = getMailchimpEcommerce();

        if (!metadata.mailchimpCartDeletedAt) {
          await mailchimpEcommerce.deleteCart(
            metadata.mailchimpCartId ||
              refreshedOrder.orderNumber ||
              refreshedOrder.id,
          );

          await prisma.order.update({
            where: { id: refreshedOrder.id },
            data: {
              metadata: {
                ...metadata,
                mailchimpCartDeletedAt: new Date().toISOString(),
              },
            },
          });
        }

        if (metadata.recoveredFromOrderId) {
          const recoveredOrder = await prisma.order.findUnique({
            where: { id: metadata.recoveredFromOrderId },
            select: { id: true, metadata: true },
          });
          const recoveredMetadata =
            (recoveredOrder?.metadata as any) || {};

          if (recoveredOrder && !recoveredMetadata.mailchimpCartDeletedAt) {
            await mailchimpEcommerce.deleteCart(
              recoveredMetadata.mailchimpCartId ||
                metadata.recoveredFromOrderId,
            );

            await prisma.order.update({
              where: { id: recoveredOrder.id },
              data: {
                metadata: {
                  ...recoveredMetadata,
                  recoveredByOrderId: refreshedOrder.id,
                  recoveredAt:
                    recoveredMetadata.recoveredAt ||
                    new Date().toISOString(),
                  recoveryReason: "abandoned_cart_recovered",
                  mailchimpCartDeletedAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }
    } catch (cleanupError) {
      console.warn(
        "⚠️ Stripe webhook: Mailchimp cart cleanup failed (non-critical):",
        cleanupError,
      );
    }    
  } catch (error) {
    console.error("Failed to handle checkout.session.completed:", error);
  }
}

async function handleFreeOrder(session: any) {
  console.log("📦 Processing free order from session:", session.id);

  try {
    const customerEmail =
      session.customer_email || session.customer_details?.email;
    const customerName =
      session.customer_details?.name || customerEmail?.split("@")[0] || "Kund";

    if (!customerEmail) {
      console.error("❌ No customer email in session");
      return;
    }

    // Idempotency guard: prefer the internal pending order created at checkout.
    const existingOrder = await findStripeOrder(session, false);
    if (existingOrder?.status === "COMPLETED") {
      console.log(
        "ℹ️ Free order session already processed:",
        session.id,
        "- Skipping duplicate.",
      );
      return;
    }

    // Parse metadata to get items
    const metadata = session.metadata || {};
    let items: any[] = [];

    try {
      if (metadata.items) {
        items = JSON.parse(metadata.items);
      }
    } catch (e) {
      console.error("Failed to parse session metadata items:", e);
      return;
    }

    if (items.length === 0) {
      console.error("❌ No items in session metadata");
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Get or create user
      let user = await tx.user.findUnique({
        where: { email: customerEmail },
      });

      const isNewUser = !user;
      let temporaryPassword = "";

      if (!user) {
        // Create new user with temporary password
        const bcrypt = require("bcryptjs");
        temporaryPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        user = await tx.user.create({
          data: {
            email: customerEmail,
            name: customerName,
            password: hashedPassword,
            role: "customer",
            mustChangePassword: true,
          },
        });
        console.log(`✅ New user created: ${user.email}`);
      } else {
        console.log(`✅ Existing user found: ${user.email}`);
      }

      let order: any;

      if (existingOrder) {
        const currentMetadata = (existingOrder.metadata as any) || {};

        order = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            userId: existingOrder.userId || user.id,
            customerEmail: existingOrder.customerEmail || customerEmail,
            customerName: existingOrder.customerName || customerName,
            status: "COMPLETED",
            totalAmount: 0,
            currency: String(
              existingOrder.currency || session.currency || "SEK",
            ).toUpperCase(),
            checkoutOrderId: session.id,
            metadata: {
              ...currentMetadata,
              stripeSessionId: session.id,
            },
          },
        include: { items: true },
        });
      } else {
        // Legacy fallback: create order with session ID in orderNumber for idempotency
        const orderNumber = `STRIPE-FREE-${session.id}`;
        order = await tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            status: "COMPLETED",
            totalAmount: 0,
            currency: "SEK",
            metadata: {
              stripeSessionId: session.id,
            },
            items: {
              create: items.map((item: any) => ({
                courseId: null, // Will be set when we find the course
                name: item.name,
                price: 0,
                quantity: item.quantity || 1,
                type: item.type || "course",
              })),
            },
          },
          include: { items: true },
        });
      }

      console.log(`✅ Order created: ${order.orderNumber}`);
      processedOrderId = order.id;

      // Increment coupon usage if applicable (only once in webhook, not in verify endpoint)
      if (metadata.couponCode) {
        try {
          const couponCode = metadata.couponCode.toUpperCase().trim();
          await tx.coupon.update({
            where: { code: couponCode },
            data: { timesUsed: { increment: 1 } },
          });
          console.log(`✅ Incremented usage for coupon: ${couponCode}`);
        } catch (couponError) {
          console.warn("⚠️ Failed to increment coupon usage:", couponError);
        }
      }

      // Create purchases for courses
      const purchasedCourses = [];
      for (const item of items.filter((i: any) => i.type === "course")) {
        // Find course by name
        const course = await tx.courseProduct.findFirst({
          where: {
            name: {
              in: [
                item.name,
                item.name.replace(
                  "Functional Insulin balance/Energy",
                  "Functional Energy",
                ),
                item.name.replace(
                  "Functional Gut Health/Flow",
                  "Functional Flow",
                ),
              ],
            },
          },
        });

        if (!course) {
          console.warn(`⚠️ Course not found: ${item.name}`);
          continue;
        }

        // Check if purchase already exists
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id,
            },
          },
        });

        if (!existingPurchase) {
          const purchase = await tx.purchase.create({
            data: {
              userId: user.id,
              courseId: course.id,
              amount: 0,
              status: "completed",
              orderId: order.id,
              accessExpiresAt: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
              ),
            },
          });
          purchasedCourses.push(course);
          console.log(`✅ Purchase created for: ${course.name}`);
        }
      }

      // Send order confirmation email to ALL users (new and existing)
      try {
        await emailService.sendOrderConfirmation({
          customerEmail: user.email,
          customerName: user.name || user.email,
          orderNumber: order.orderNumber,
          totalAmount: 0,
          courses: purchasedCourses.map((c) => ({ name: c.name, price: 0 })),
          // Only include login credentials for NEW users
          loginCredentials:
            isNewUser && temporaryPassword
              ? {
                  email: user.email,
                  password: temporaryPassword,
                  loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://functionalfoods.se"}/login`,
                }
              : undefined,
          // Flag for existing users to show login reminder
          isExistingUser: !isNewUser,
        });
        console.log(
          `✅ Order confirmation email sent to: ${user.email} (${isNewUser ? "new user" : "existing user"})`,
        );
      } catch (emailError) {
        console.error(
          "❌ Failed to send order confirmation email:",
          emailError,
        );
      }
    });

    // --- Add new customers to Mailchimp Marketing with "kund" tag + course tags ---
    try {
      const user = await prisma.user.findUnique({
        where: { email: customerEmail },
      });
      if (user) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const isNewUser = user.createdAt > oneHourAgo;

        if (isNewUser) {
          const mailchimpMarketing = getMailchimpMarketing();
          if (mailchimpMarketing.isConfigured()) {
            const courseNames = (items || [])
              .filter((item: any) => item.type === "course")
              .map((item: any) => item.name);
            const nameParts = customerName.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";
            await mailchimpMarketing.addCustomerWithCourseTags(
              customerEmail,
              courseNames,
              firstName,
              lastName,
            );
            console.log(
              `✅ New customer added to Mailchimp with course tags (free order): ${customerEmail}`,
            );
          }
        }
      }
    } catch (e) {
      console.warn(
        "⚠️ Mailchimp Marketing subscriber add failed (non-critical):",
        e,
      );
    }

    try {
      if (processedOrderId) {
        const completedOrder = await prisma.order.findUnique({
          where: { id: processedOrderId },
          select: { id: true, orderNumber: true, metadata: true },
        });
        const completedMetadata = (completedOrder?.metadata as any) || {};

        if (completedOrder) {
          const { getMailchimpEcommerce } =
            await import("@/app/lib/mailchimp-ecommerce");
          const mailchimpEcommerce = getMailchimpEcommerce();

          if (!completedMetadata.mailchimpCartDeletedAt) {
            await mailchimpEcommerce.deleteCart(
              completedMetadata.mailchimpCartId ||
                completedOrder.orderNumber ||
                completedOrder.id,
            );

            await prisma.order.update({
              where: { id: completedOrder.id },
              data: {
                metadata: {
                  ...completedMetadata,
                  mailchimpCartDeletedAt: new Date().toISOString(),
                },
              },
            });
          }

          if (completedMetadata.recoveredFromOrderId) {
            const recoveredOrder = await prisma.order.findUnique({
              where: { id: completedMetadata.recoveredFromOrderId },
              select: { id: true, metadata: true },
            });
            const recoveredMetadata =
              (recoveredOrder?.metadata as any) || {};

            if (recoveredOrder && !recoveredMetadata.mailchimpCartDeletedAt) {
              await mailchimpEcommerce.deleteCart(
                recoveredMetadata.mailchimpCartId ||
                  completedMetadata.recoveredFromOrderId,
              );

              await prisma.order.update({
                where: { id: recoveredOrder.id },
                data: {
                  metadata: {
                    ...recoveredMetadata,
                    recoveredByOrderId: completedOrder.id,
                    recoveredAt:
                      recoveredMetadata.recoveredAt ||
                      new Date().toISOString(),
                    recoveryReason: "abandoned_cart_recovered",
                    mailchimpCartDeletedAt: new Date().toISOString(),
                  },
                },
              });
            }
          }
        }
      }
    } catch (cleanupError) {
      console.warn(
        "⚠️ Stripe free order: Mailchimp cart cleanup failed (non-critical):",
        cleanupError,
      );
    }

    console.log("✅ Free order processed successfully");
  } catch (error) {
    console.error("❌ Error processing free order:", error);
  }
}

async function handleSwishWebhook(payload: any): Promise<NextResponse> {
  try {
    const { id, status } = payload;

    const payment = await prisma.payment.findFirst({
      where: { externalId: id },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    switch (status) {
      case "PAID":
        await completePayment(payment.id, payload);
        break;
      case "DECLINED":
      case "ERROR":
        await failPayment(payment.id, payload);
        break;
      case "CANCELLED":
        await cancelPayment(payment.id, payload);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Swish webhook error:", error);
    return NextResponse.json(
      { error: "Swish webhook processing failed" },
      { status: 500 },
    );
  }
}

async function completePayment(paymentId: string, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        gatewayResponse: webhookData,
      },
      include: {
        order: {
          include: {
            items: true,
            user: true,
          },
        },
      },
    });

    // Update order
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "COMPLETED" },
    });

    // Get user and check if they need login credentials
    const user = payment.order.user;
    let needsLoginCredentials = false;
    let temporaryPassword = "";

    // Check if user was created recently (within last hour) - indicates new user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.createdAt > oneHourAgo) {
      needsLoginCredentials = true;
      // Generate temporary password
      temporaryPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8).toUpperCase();

      // Update user with temporary password
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, mustChangePassword: true },
      });
    }

    // Create purchases for courses
    const purchasedCourses = [];
    for (const item of payment.order.items) {
      if (item.type === "course" && item.courseId) {
        // Check if purchase already exists
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: payment.order.userId,
              courseId: item.courseId,
            },
          },
        });

        if (!existingPurchase) {
          const purchase = await tx.purchase.create({
            data: {
              userId: payment.order.userId,
              courseId: item.courseId,
              amount: item.price * item.quantity,
              status: "completed",
              orderId: payment.order.id,
              accessExpiresAt: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
              ),
            },
            include: {
              course: true,
            },
          });
          purchasedCourses.push(purchase.course);
        }
      }
    }

    // Send order confirmation email with login credentials if needed
    try {
      const VAT_RATE = 0.25;
      const emailCourses = payment.order.items
        .filter((it: any) => it.type === "course")
        .map((it: any) => ({
          name: it.name,
          price: Math.round(it.price * (1 + VAT_RATE)) * it.quantity,
        }));
      const emailData = {
        customerEmail: user.email,
        customerName: user.name || user.email.split("@")[0],
        orderNumber: payment.order.orderNumber,
        totalAmount: payment.order.totalAmount,
        courses: emailCourses,
        isExistingUser: !needsLoginCredentials,
        ...(needsLoginCredentials && {
          loginCredentials: {
            email: user.email,
            password: temporaryPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://functionalfoods.se"}/login`,
          },
        }),
      };

      await emailService.sendOrderConfirmation(emailData);
      console.log(
        "Order confirmation email sent with login credentials:",
        user.email,
      );
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }

    console.log(`Payment completed for order ${payment.order.orderNumber}`);

    // Fire server-side GA4 purchase (browser may block client scripts)
    try {
      await trackPurchaseServer({
        transactionId: payment.order.orderNumber,
        value: payment.order.totalAmount,
        currency: payment.order.currency || "SEK",
        items: payment.order.items.map((it: any) => ({
          item_id: it.courseId ? String(it.courseId) : it.name,
          item_name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
        userId: payment.order.user.id,
        clientSeed: payment.order.user.email,
      });
    } catch (e) {
      console.warn("GA4 server purchase failed (non-fatal):", e);
    }
  });
}

async function failPayment(paymentId: string, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        gatewayResponse: webhookData,
        failureReason: webhookData.error?.message || "Payment failed",
      },
    });

    // Update order
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (payment) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "CANCELLED" },
      });

      console.log(`Payment failed for order ${payment.order.orderNumber}`);
    }
  });
}

async function cancelPayment(paymentId: string, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "CANCELLED",
        gatewayResponse: webhookData,
      },
    });

    // Update order
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (payment) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "CANCELLED" },
      });

      console.log(`Payment cancelled for order ${payment.order.orderNumber}`);
    }
  });
}
