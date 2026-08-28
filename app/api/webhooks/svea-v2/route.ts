import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getSveaCheckout,
  SveaCheckoutService,
} from "@/app/lib/svea-checkout-service";
import { emailService } from "@/app/lib/email";
import { getMailchimpMarketing } from "@/app/lib/mailchimp-marketing";
import {
  SUMMER_EBOOK_CAMPAIGN_ID,
  SUMMER_EBOOK_CAMPAIGN_TAG,
} from "@/app/lib/campaigns/summer-ebooks";
import { sendAddrevenuePostbackForOrder } from "@/app/lib/addrevenue";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Webhook event types from Svea
type WebhookEventType =
  | "OrderCreated"
  | "OrderConfirmed"
  | "OrderDelivered"
  | "OrderCancelled"
  | "OrderExpired"
  | "OrderAwaitingPayment"
  | "OrderPaymentDenied";

interface SveaWebhookPayload {
  // Svea uses PascalCase in webhooks
  CheckoutOrderId?: number;
  OrderId?: number;
  Status?: string;
  PaymentType?: string;
  CreationDate?: string;
  CustomerCountry?: string;
  Currency?: string;
  OrderAmount?: number;
  CapturedAmount?: number;
  CreditedAmount?: number;
  MerchantData?: string;
  // Also support camelCase (fallback)
  orderId?: number;
  status?: string;
  paymentType?: string;
  creationDate?: string;
  customerCountry?: string;
  currency?: string;
  orderAmount?: number;
  capturedAmount?: number;
  creditedAmount?: number;
  merchantData?: string;
}

// Normalize webhook payload to consistent format
function normalizeWebhookPayload(raw: SveaWebhookPayload) {
  return {
    orderId: raw.CheckoutOrderId || raw.OrderId || raw.orderId,
    status: raw.Status || raw.status,
    paymentType: raw.PaymentType || raw.paymentType,
    merchantData: raw.MerchantData || raw.merchantData,
    orderAmount: raw.OrderAmount || raw.orderAmount,
  };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "svea-webhook-v2",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  let body = "";

  try {
    // Read raw body for signature validation
    body = await request.text();
    const signature =
      request.headers.get("x-signature-512") ||
      request.headers.get("x-svea-signature") ||
      "";
    const signatureTimestamp = request.headers.get("x-timestamp") || "";
    const url = request.url;
    const searchParams = new URL(url).searchParams;

    const rawQueryOrderId =
      searchParams.get("checkoutOrderId") ||
      searchParams.get("CheckoutOrderId") ||
      searchParams.get("orderId") ||
      searchParams.get("OrderId");

    const queryOrderId =
      rawQueryOrderId && /^\d+$/.test(rawQueryOrderId) ? rawQueryOrderId : null;

    const headerOrderId =
      request.headers.get("x-sveacheckout-orderid") ||
      request.headers.get("X-SveaCheckout-OrderId") ||
      request.headers.get("x-svea-checkout-orderid") ||
      request.headers.get("X-Svea-Checkout-OrderId") ||
      null;

    const debugWebhookLogging = process.env.SVEA_WEBHOOK_DEBUG === "true";
    const webhookLog: Record<string, unknown> = {
      hasBody: !!body,
      bodyLength: body.length,
      eventType: (() => {
        try {
          return JSON.parse(body || "{}")?.type;
        } catch {
          return undefined;
        }
      })(),
      hasSignature: !!signature,
      signatureLength: signature.length,
      hasSignatureTimestamp: !!signatureTimestamp,
      path: new URL(url).pathname,
      queryOrderId,
      headerOrderId,
      userAgent: request.headers.get("user-agent"),
      forwardedFor: request.headers.get("x-forwarded-for"),
      requestId: request.headers.get("x-request-id"),
    };

    if (debugWebhookLogging) {
      webhookLog.bodyPreview = body.substring(0, 100);
      webhookLog.allHeaders = Object.fromEntries(request.headers.entries());
    }

    console.log("📩 Svea webhook received:", webhookLog);

    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();

    // SVEA_WEBHOOK_VALIDATION is our own feature flag, not a Svea API setting.
    // Keep it disabled until the exact Checkout PushUri signing secret is confirmed.
    const requireValidSignature =
      process.env.SVEA_WEBHOOK_VALIDATION === "true";

    if (requireValidSignature) {
      const webhookSecret =
        process.env.SVEA_WEBHOOK_SECRET || process.env.SVEA_SECRET_WORD || "";

      if (!signature || !signatureTimestamp || !webhookSecret) {
        console.warn("⚠️ Missing Svea webhook signature inputs");
        return NextResponse.json(
          { error: "Missing webhook signature" },
          { status: 401 },
        );
      }

      const isValid = sveaCheckout.validateWebhookSignature(
        body,
        signature,
        signatureTimestamp,
        webhookSecret,
      );

      if (!isValid) {
        console.warn("⚠️ Invalid Svea webhook signature");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 },
        );
      }
    }

    // Parse webhook payload
    let rawWebhookData: SveaWebhookPayload;
    try {
      rawWebhookData = JSON.parse(body || "{}");
    } catch (error) {
      console.error("❌ Failed to parse webhook body:", error);
      rawWebhookData = {};
    }

    // Log raw payload for debugging
    console.log("📦 Raw webhook payload:", JSON.stringify(rawWebhookData));

    // Normalize to consistent format (Svea uses PascalCase)
    let webhookData = normalizeWebhookPayload(rawWebhookData);

    // If body is empty/minimal, try to get orderId from query/headers
    if (!webhookData.orderId) {
      const fallbackOrderId = queryOrderId || headerOrderId;

      // Guard: must be numeric. Avoid "{checkout.order.id}" → NaN.
      const fallbackStr = (fallbackOrderId ?? "").toString().trim();
      const numericId = /^\d+$/.test(fallbackStr)
        ? parseInt(fallbackStr, 10)
        : null;

      if (numericId) {
        console.log(
          `🔄 Body empty, using numeric orderId from query/header: ${numericId}`,
        );

        try {
          const sveaOrder = await sveaCheckout.getOrder(numericId);
          console.log("📋 Fetched Svea order:", {
            orderId: numericId,
            status: sveaOrder.status,
            merchantData: sveaOrder.merchantData,
          });

          webhookData = {
            orderId: numericId,
            status: sveaOrder.status,
            merchantData: sveaOrder.merchantData,
            paymentType: sveaOrder.paymentType,
            orderAmount: undefined,
          };
        } catch (fetchError) {
          console.error("❌ Failed to fetch Svea order:", fetchError);
        }
      } else if (fallbackOrderId) {
        console.warn(
          "⚠️ Body empty, but fallback orderId was not numeric:",
          fallbackOrderId,
        );
      }
    }

    console.log("✅ Webhook normalized:", {
      orderId: webhookData.orderId,
      status: webhookData.status,
      merchantData: webhookData.merchantData,
    });

    // Process webhook based on status
    switch (webhookData.status) {
      case "Final":
      case "Confirmed":
        await handleOrderCompleted(webhookData);
        break;

      case "Cancelled":
      case "Expired":
        await handleOrderFailed(webhookData);
        break;

      case "Created":
      case "AwaitingPayment":
        // Order is still pending, no action needed
        console.log(
          `ℹ️ Order ${webhookData.orderId} is in status: ${webhookData.status}`,
        );
        break;

      default:
        console.warn(`⚠️ Unknown webhook status: ${webhookData.status}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("💥 Webhook processing error:", error);

    // Don't expose internal errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function handleOrderCompleted(
  webhookData: ReturnType<typeof normalizeWebhookPayload>,
) {
  const { orderId, merchantData } = webhookData;

  console.log("🎉 Processing completed order:", {
    sveaOrderId: orderId,
    internalOrderId: merchantData,
  });

  if (!orderId) {
    console.error("❌ Missing orderId in webhook payload");
    return;
  }

  try {
    // Get full order details from Svea
    const sveaCheckout = getSveaCheckout();
    const sveaOrder = await sveaCheckout.getOrder(orderId);

    console.log("📋 Svea order details:", {
      status: sveaOrder.status,
      customer: sveaOrder.customer?.email,
      paymentType: sveaOrder.paymentType,
    });

    // Find our order by merchantData (our order ID)
    const order = await prisma.order.findUnique({
      where: { id: merchantData || "" },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      console.error(`❌ Order not found: ${merchantData}`);
      return;
    }

    // Skip if already processed
    const orderAlreadyCompleted = order.status === "COMPLETED";

    if (orderAlreadyCompleted) {
      console.log(
        `ℹ️ Order ${order.id} already completed - continuing to verify ebook delivery`,
      );
    }

    // Variables to track user creation (needed outside transaction for email)
    const isGuestEmail = (email?: string | null) =>
      !!email && email.startsWith("guest-");

    let isNewUser = false;
    let temporaryPassword: string | undefined;

    await prisma.$transaction(async (tx) => {
      // Get customer info from Svea
      const customerEmail = sveaOrder.customer?.email || order.customerEmail;
      const customerName =
        `${sveaOrder.customer?.firstName || ""} ${sveaOrder.customer?.lastName || ""}`.trim() ||
        order.customerName;

      // Update order status AND customer info
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          customerEmail: customerEmail || order.customerEmail,
          customerName: customerName || order.customerName,
          metadata: {
            ...(order.metadata as any),
            sveaOrderId: orderId,
            sveaStatus: sveaOrder.status,
            sveaPaymentType: sveaOrder.paymentType || "svea",
            customerInfo: {
              email: sveaOrder.customer?.email,
              phone: sveaOrder.customer?.phoneNumber,
              name: customerName,
            },
          },
        },
      });

      const orderMetadata = (order.metadata as any) || {};
      const recoveredFromOrderId = orderMetadata.recoveredFromOrderId;
      if (recoveredFromOrderId && recoveredFromOrderId !== order.id) {
        const recoveredOrder = await tx.order.findFirst({
          where: { id: recoveredFromOrderId, status: "PENDING" },
          select: { id: true, metadata: true },
        });

        if (recoveredOrder) {
          await tx.order.update({
            where: { id: recoveredOrder.id },
            data: {
              metadata: {
                ...((recoveredOrder.metadata as any) || {}),
                recoveredByOrderId: order.id,
                recoveredAt: new Date().toISOString(),
                recoveryReason: "abandoned_cart_recovered",
              },
            },
          });
        }
      }

      // Handle user creation/linking
      let user = order.user;

      const guestUser = user && isGuestEmail(user.email) ? user : null;

      if ((!user || guestUser) && customerEmail) {
        const normalizedEmail = customerEmail.toLowerCase().trim();

        // Check if user exists
        const existingUser = await tx.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingUser) {
          // Link order to existing user
          user = existingUser;
          await tx.order.update({
            where: { id: order.id },
            data: {
              userId: user.id,
              customerEmail: normalizedEmail,
              customerName,
            },
          });
        } else if (guestUser) {
          // Upgrade guest user to real customer
          temporaryPassword = generateSecurePassword();
          const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

          user = await tx.user.update({
            where: { id: guestUser.id },
            data: {
              email: normalizedEmail,
              name: customerName || "Ny kund",
              password: hashedPassword,
              mustChangePassword: true,
              isActive: true,
              role: "customer",
            },
          });

          isNewUser = true;

          await tx.order.update({
            where: { id: order.id },
            data: {
              userId: user.id,
              customerEmail: normalizedEmail,
              customerName: user.name || customerName,
            },
          });
        } else {
          // Create new user
          temporaryPassword = generateSecurePassword();
          const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

          user = await tx.user.create({
            data: {
              email: normalizedEmail,
              name: customerName || "Ny kund",
              password: hashedPassword,
              role: "customer",
              emailVerified: null, // Will be verified when they set password
            },
          });

          isNewUser = true;

          // Link order to new user
          await tx.order.update({
            where: { id: order.id },
            data: {
              userId: user.id,
              customerEmail: normalizedEmail,
              customerName,
            },
          });

          console.log(`📧 New user created: ${user.email}`);

          // Add new customer to Mailchimp Marketing with "kund" tag + course tags
          try {
            const mailchimpMarketing = getMailchimpMarketing();
            if (mailchimpMarketing.isConfigured()) {
              const courseNames = order.items
                .filter((item) => item.type === "course")
                .map((item) => item.name);
              const nameParts = (customerName || "").split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";
              await mailchimpMarketing.addCustomerWithCourseTags(
                normalizedEmail,
                courseNames,
                firstName,
                lastName,
                (order.metadata as any)?.campaignId === SUMMER_EBOOK_CAMPAIGN_ID
                  ? [SUMMER_EBOOK_CAMPAIGN_TAG]
                  : [],
              );
              console.log(
                `✅ New customer added to Mailchimp with course tags: ${normalizedEmail}`,
              );
            }
          } catch (mailchimpError) {
            console.warn(
              "⚠️ Failed to add customer to Mailchimp (non-critical):",
              mailchimpError,
            );
          }
        }
      }

      // Create purchases for courses
      const courseItems = order.items.filter((item) => item.type === "course");

      // Course name mapping for exact matching
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

      for (const item of courseItems) {
        // Use courseId if available, otherwise match by name
        let courseId = item.courseId;

        if (!courseId) {
          // Match course by name using same logic as other webhooks
          const normalizedName = item.name.toLowerCase().trim();
          const mappedName = courseNameMap[normalizedName] || item.name;

          // Try exact match first (case-insensitive)
          let course = await tx.courseProduct.findFirst({
            where: {
              name: { equals: mappedName, mode: "insensitive" },
            },
          });

          // If no exact match, try original name
          if (!course) {
            course = await tx.courseProduct.findFirst({
              where: {
                name: { equals: item.name, mode: "insensitive" },
              },
            });
          }

          // Only use contains as last resort, and be more specific
          if (!course && item.name.toLowerCase().includes("functional")) {
            const functionalPart = item.name.split("Functional ")[1]?.trim();
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
            console.error(`❌ Course not found for: "${item.name}"`);
            continue;
          }

          courseId = course.id;
          console.log(`✅ Matched course: "${item.name}" → "${course.name}"`);

          // Update order item with courseId for future reference
          await tx.orderItem.update({
            where: { id: item.id },
            data: { courseId: course.id },
          });
        }

        // Check if purchase already exists
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: user!.id,
              courseId: courseId,
            },
          },
        });

        if (!existingPurchase) {
          await tx.purchase.create({
            data: {
              userId: user!.id,
              courseId: courseId,
              amount: item.price * (item.quantity || 1),
              status: "completed",
              orderId: order.id,
              accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            },
          });
          console.log(`✅ Created purchase for course: ${courseId}`);
        } else {
          console.log(`ℹ️ Purchase already exists for course: ${courseId}`);
        }
      }

      // TODO: Handle book orders - send download links
      const bookItems = order.items.filter((item) => item.type === "book");
      if (bookItems.length > 0) {
        console.log(
          `📚 Process book orders:`,
          bookItems.map((b) => b.name),
        );
      }
    });

    console.log(`✅ Order ${order.id} completed successfully`);

    let completedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { user: true, items: true },
    });

    // --- Mailchimp E-commerce purchase tracking ---
    try {
      const { getMailchimpEcommerce } =
        await import("@/app/lib/mailchimp-ecommerce");
      const mailchimpEcommerce = getMailchimpEcommerce();

      const updatedOrder = completedOrder;

      if (updatedOrder && updatedOrder.user) {
        const totalAmount = updatedOrder.totalAmount;
        const vatRate = 0.25;
        const taxTotal = (totalAmount * vatRate) / (1 + vatRate);

        // Calculate discount total from metadata or by comparing item prices
        let discountTotal = 0;
        const metadata = updatedOrder.metadata as any;

        if (metadata?.mailchimpEcommerceTrackedAt) {
          console.log(
            "ℹ️ Mailchimp E-commerce already tracked (svea webhook, skipping):",
            {
              orderId: updatedOrder.orderNumber,
              trackedAt: metadata.mailchimpEcommerceTrackedAt,
            },
          );
        }

        if (!metadata?.mailchimpEcommerceTrackedAt) {
          if (metadata?.discountAmount) {
            // Discount amount stored in metadata (in SEK)
            discountTotal = metadata.discountAmount;
          } else {
            // Calculate discount by comparing original prices with discounted prices
            // Sum up original prices (if available) vs actual paid prices
            const originalTotal = updatedOrder.items.reduce((sum, item) => {
              // Try to get original price from course product or metadata
              const originalPrice =
                (item as any).originalPrice ||
                metadata?.items?.[0]?.price ||
                item.price;
              return sum + originalPrice * item.quantity;
            }, 0);

            if (originalTotal > totalAmount) {
              discountTotal = originalTotal - totalAmount;
            }
          }

          // Extract attribution data from order metadata for campaign tracking
          const attribution = metadata?.attribution || {};
          const campaignId = attribution?.mc_cid || undefined;
          const trackingCode =
            attribution?.utm_campaign || campaignId || undefined;

          // Build landing site URL from UTM params or Mailchimp campaign tracking
          let landingSite: string | undefined;
          if (
            attribution?.utm_source ||
            attribution?.utm_campaign ||
            attribution?.mc_cid
          ) {
            const params = new URLSearchParams();
            if (attribution.utm_source)
              params.set("utm_source", attribution.utm_source);
            if (attribution.utm_medium)
              params.set("utm_medium", attribution.utm_medium);
            if (attribution.utm_campaign)
              params.set("utm_campaign", attribution.utm_campaign);
            if (attribution.mc_cid) params.set("mc_cid", attribution.mc_cid);
            landingSite = `https://functionalfoods.se/?${params.toString()}`;
          }

          await mailchimpEcommerce.trackPurchase({
            orderId: updatedOrder.orderNumber,
            customerEmail: updatedOrder.user.email,
            customerName: updatedOrder.user.name || undefined,
            items: updatedOrder.items.map((item) => ({
              id: item.courseId || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              type: item.type || "course",
            })),
            totalAmount: totalAmount,
            currency: updatedOrder.currency || "SEK",
            orderDate: updatedOrder.createdAt,
            discountTotal: discountTotal,
            shippingTotal: 0,
            taxTotal: taxTotal,
            // Campaign attribution for Mailchimp reports
            campaignId: campaignId,
            landingSite: landingSite,
            trackingCode: trackingCode,
          });

          await mailchimpEcommerce.deleteCart(
            metadata?.mailchimpCartId ||
              updatedOrder.orderNumber ||
              updatedOrder.id,
          );

          if (metadata?.recoveredFromOrderId) {
            try {
              const recoveredOrder = await prisma.order.findUnique({
                where: { id: metadata.recoveredFromOrderId },
                select: { id: true, metadata: true },
              });
              const recoveredMetadata = (recoveredOrder?.metadata as any) || {};
              const sourceCartId =
                recoveredMetadata.mailchimpCartId ||
                metadata.recoveredFromOrderId;

              await mailchimpEcommerce.deleteCart(sourceCartId);

              if (recoveredOrder) {
                await prisma.order.update({
                  where: { id: recoveredOrder.id },
                  data: {
                    metadata: {
                      ...recoveredMetadata,
                      recoveredByOrderId: updatedOrder.id,
                      recoveredAt:
                        recoveredMetadata.recoveredAt ||
                        new Date().toISOString(),
                      recoveryReason: "abandoned_cart_recovered",
                      mailchimpCartDeletedAt: new Date().toISOString(),
                    },
                  },
                });
              }
            } catch (recoveredCartError) {
              console.warn(
                "⚠️ Mailchimp E-commerce: failed to delete recovered source cart (webhook):",
                recoveredCartError,
              );
            }
          }

          await prisma.order.update({
            where: { id: updatedOrder.id },
            data: {
              metadata: {
                ...(metadata || {}),
                mailchimpEcommerceTrackedAt: new Date().toISOString(),
                mailchimpCartDeletedAt: new Date().toISOString(),
              },
            },
          });

          completedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { user: true, items: true },
          });
        }
      }
    } catch (e) {
      console.warn("⚠️ Mailchimp E-commerce tracking failed:", e);
      try {
        const failedOrder = await prisma.order.findUnique({
          where: { id: order.id },
          select: { metadata: true },
        });
        const failedMetadata = (failedOrder?.metadata as any) || {};

        await prisma.order.update({
          where: { id: order.id },
          data: {
            metadata: {
              ...failedMetadata,
              mailchimpEcommerceErrorAt: new Date().toISOString(),
              mailchimpEcommerceError:
                e instanceof Error ? e.message : String(e),
            },
          },
        });
      } catch (metadataError) {
        console.warn(
          "⚠️ Failed to record Mailchimp E-commerce error metadata:",
          metadataError,
        );
      }
    }

    try {
      const sveaOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true, user: true },
      });

      if (sveaOrder) {
        const result = await sendAddrevenuePostbackForOrder(sveaOrder);
        if (!result.skipped) {
          console.log("✅ Addrevenue postback attempted (svea webhook):", {
            orderId: sveaOrder.orderNumber,
            ok: result.ok,
          });
        }
      }
    } catch (addrevenueError) {
      console.warn(
        "⚠️ Addrevenue postback failed (svea webhook, non-critical):",
        addrevenueError,
      );
    }

    try {
      const sveaOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true, user: true },
      });

      if (sveaOrder) {
        const result = await sendAddrevenuePostbackForOrder(sveaOrder);
        if (!result.skipped) {
          console.log("✅ Addrevenue postback attempted (svea webhook):", {
            orderId: sveaOrder.orderNumber,
            ok: result.ok,
          });
        } else {
          console.log("ℹ️ Addrevenue postback skipped (svea webhook):", {
            orderId: sveaOrder.orderNumber,
            reason: result.reason,
          });
        }
      }
    } catch (addrevenueError) {
      console.warn(
        "⚠️ Addrevenue postback failed (svea webhook, non-critical):",
        addrevenueError,
      );
    }

    // Ensure abandoned cart cleanup is visible in admin even if purchase tracking
    // was skipped or handled by another completion path.
    try {
      const { getMailchimpEcommerce } =
        await import("@/app/lib/mailchimp-ecommerce");
      const mailchimpEcommerce = getMailchimpEcommerce();
      const cleanupOrder = await prisma.order.findUnique({
        where: { id: order.id },
        select: { id: true, orderNumber: true, metadata: true },
      });
      const cleanupMetadata = (cleanupOrder?.metadata as any) || {};

      if (cleanupOrder && !cleanupMetadata.mailchimpCartDeletedAt) {
        await mailchimpEcommerce.deleteCart(
          cleanupMetadata.mailchimpCartId ||
            cleanupOrder.orderNumber ||
            cleanupOrder.id,
        );

        await prisma.order.update({
          where: { id: cleanupOrder.id },
          data: {
            metadata: {
              ...cleanupMetadata,
              mailchimpCartDeletedAt: new Date().toISOString(),
            },
          },
        });
      }

      if (cleanupMetadata.recoveredFromOrderId) {
        const recoveredOrder = await prisma.order.findUnique({
          where: { id: cleanupMetadata.recoveredFromOrderId },
          select: { id: true, metadata: true },
        });
        const recoveredMetadata = (recoveredOrder?.metadata as any) || {};

        if (recoveredOrder && !recoveredMetadata.mailchimpCartDeletedAt) {
          await mailchimpEcommerce.deleteCart(
            recoveredMetadata.mailchimpCartId ||
              cleanupMetadata.recoveredFromOrderId,
          );

          await prisma.order.update({
            where: { id: recoveredOrder.id },
            data: {
              metadata: {
                ...recoveredMetadata,
                recoveredByOrderId: cleanupOrder?.id || order.id,
                recoveredAt:
                  recoveredMetadata.recoveredAt || new Date().toISOString(),
                recoveryReason: "abandoned_cart_recovered",
                mailchimpCartDeletedAt: new Date().toISOString(),
              },
            },
          });
        }
      }
    } catch (cleanupError) {
      console.warn(
        "⚠️ Mailchimp E-commerce cart cleanup failed (webhook, non-critical):",
        cleanupError,
      );
    }

    // GA4 server-side purchase tracking (non-blocking)
    try {
      const { trackPurchaseServer } =
        await import("@/app/lib/server-analytics");
      const normalizeGaItemId = (
        rawId: string | undefined | null,
        name: string | undefined | null,
      ) => {
        return rawId || undefined;
      };
      const gaOrder = completedOrder || order;
      const gaItems = gaOrder.items.map((item: any) => ({
        item_id: normalizeGaItemId(item.courseId || item.id, item.name),
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));
      await trackPurchaseServer({
        transactionId: gaOrder.orderNumber,
        value: gaOrder.totalAmount || 0,
        currency: gaOrder.currency || "SEK",
        items: gaItems,
        userId: gaOrder.customerEmail || undefined,
        clientSeed: gaOrder.customerEmail || gaOrder.orderNumber,
      });
    } catch (e) {
      console.warn("⚠️ GA4 server purchase tracking failed (Svea):", e);
    }

    // Send order confirmation email with login credentials for new users
    try {
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          user: true,
        },
      });

      if (!updatedOrder) {
        console.warn(`⚠️ Order not found for email sending: ${order.id}`);
        // Don't return - let the function complete normally
      } else {
        // Determine email address to use - prioritize customerEmail from order or Svea
        const emailToUse =
          updatedOrder.customerEmail ||
          (updatedOrder.user && !isGuestEmail(updatedOrder.user.email)
            ? updatedOrder.user.email
            : null) ||
          sveaOrder.customer?.email ||
          null;

        const nameToUse =
          updatedOrder.customerName ||
          updatedOrder.user?.name ||
          null ||
          `${sveaOrder.customer?.firstName || ""} ${sveaOrder.customer?.lastName || ""}`.trim() ||
          emailToUse?.split("@")[0] ||
          "Kund";

        if (!emailToUse || isGuestEmail(emailToUse)) {
          console.warn(
            `⚠️ No valid email address found for order ${order.id}. customerEmail: ${updatedOrder.customerEmail}, user.email: ${updatedOrder.user?.email}`,
          );
          // Don't return - let the function complete normally
        } else {
          // Check if email was already sent (via metadata flag)
          const metadata = updatedOrder.metadata as any;
          const emailAlreadySent = metadata?.confirmationEmailSent;

          if (emailAlreadySent) {
            console.log(
              `ℹ️ Order confirmation email already sent (skipping duplicate)`,
            );
          } else {
            const COURSE_VAT_RATE = 0.25;
            const BOOK_VAT_RATE = 0.06;
            const courseItems = updatedOrder.items.filter(
              (item) => item.type === "course",
            );
            const bookItems = updatedOrder.items.filter(
              (item) => item.type === "book",
            );
            const emailCourses = courseItems.map((item) => ({
              name: item.name,
              price:
                (Math.round(item.price * (1 + COURSE_VAT_RATE) * 100) / 100) *
                (item.quantity || 1),
            }));

            console.log(
              `📧 Preparing to send order confirmation email to: ${emailToUse}, isNewUser: ${isNewUser}`,
            );
            console.log(
              `📚 Order contains: ${courseItems.length} courses, ${bookItems.length} e-books`,
            );

            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_URL ||
              "https://www.functionalfoods.se";

            // Send e-book download email for standalone e-book purchases (or mixed orders with e-books)
            if (bookItems.length > 0) {
              for (const book of bookItems) {
                const n = book.name.toLowerCase();

                let ebookId = "brodboken-2026";

                if (
                  n.includes("söta godsaker") ||
                  n.includes("sota godsaker") ||
                  n.includes("sota-godsaker")
                ) {
                  ebookId = "sota-godsaker";
                } else if (
                  n.includes("grill- & sommarmat") ||
                  n.includes("grill sommarmat") ||
                  n.includes("grill och sommarmat") ||
                  n.includes("grill-sommarmat")
                ) {
                  ebookId = "grill-sommarmat";
                } else if (n.includes("påskbuffé") || n.includes("paskbuffe")) {
                  ebookId = "paskbuffe";
                } else if (
                  n.includes("brodboken") ||
                  n.includes("brodbok") ||
                  n.includes("glutenfritt")
                ) {
                  ebookId = "brodboken-2026";
                } else if (
                  n.includes("hälsosamma frukostar") ||
                  n.includes("halsosamma frukostar") ||
                  n.includes("halsosamma-frukostar")
                ) {
                  ebookId = "juice-glow";
                } else if (
                  n.includes("juice & glow") ||
                  n.includes("juice glow") ||
                  n.includes("juice och glow") ||
                  n.includes("juice-glow")
                ) {
                  ebookId = "juice-glow";
                }

                // Reuse existing token if it already exists for this order + ebook
                let existingDownload = await prisma.ebookDownload.findFirst({
                  where: {
                    orderNumber: updatedOrder.orderNumber,
                    ebookId,
                  },
                });

                let downloadToken = existingDownload?.token;

                if (!downloadToken) {
                  const crypto = await import("crypto");
                  downloadToken = crypto
                    .randomBytes(16)
                    .toString("hex")
                    .toUpperCase();

                  await prisma.ebookDownload.create({
                    data: {
                      token: downloadToken,
                      orderNumber: updatedOrder.orderNumber,
                      customerEmail: emailToUse,
                      ebookId,
                      ebookName: book.name,
                      maxDownloads: 5,
                      expiresAt: new Date(
                        Date.now() + 365 * 24 * 60 * 60 * 1000,
                      ),
                    },
                  });
                }

                let downloadUrl = `${baseUrl}/brodboken/ladda-ner?token=${downloadToken}`;

                if (ebookId === "paskbuffe") {
                  downloadUrl = `${baseUrl}/e-bocker/paskbuffe/ladda-ner?token=${downloadToken}`;
                }

                if (ebookId === "sota-godsaker") {
                  downloadUrl = `${baseUrl}/e-bocker/sota-godsaker/ladda-ner?token=${downloadToken}`;
                }

                if (ebookId === "grill-sommarmat") {
                  downloadUrl = `${baseUrl}/e-bocker/grill-sommarmat/ladda-ner?token=${downloadToken}`;
                }

                if (ebookId === "halsosamma-frukostar") {
                  downloadUrl = `${baseUrl}/e-bocker/halsosamma-frukostar/ladda-ner?token=${downloadToken}`;
                }
                if (ebookId === "juice-glow") {
                  downloadUrl = `${baseUrl}/e-bocker/juice-glow/ladda-ner?token=${downloadToken}`;
                }

                await emailService.sendEbookDownloadEmail({
                  email: emailToUse,
                  name: nameToUse,
                  ebookName: book.name,
                  downloadUrl,
                  downloadPassword: downloadToken,
                  orderNumber: updatedOrder.orderNumber,
                });

                console.log(
                  `✅ E-book download email sent for: ${book.name} (${ebookId})`,
                );

                // Send regular order confirmation for course purchases (ALWAYS send if there are courses)
                if (courseItems.length > 0) {
                  console.log(
                    `📧 Sending order confirmation for ${courseItems.length} courses, isNewUser: ${isNewUser}, hasPassword: ${!!temporaryPassword}`,
                  );
                  await emailService.sendOrderConfirmation({
                    customerEmail: emailToUse,
                    customerName: nameToUse,
                    orderNumber: updatedOrder.orderNumber,
                    totalAmount: updatedOrder.totalAmount || 0,
                    courses: emailCourses,
                    loginCredentials:
                      isNewUser && temporaryPassword
                        ? {
                            email: emailToUse,
                            password: temporaryPassword,
                            loginUrl: `${baseUrl}/login`,
                          }
                        : undefined,
                    isExistingUser: !isNewUser,
                  });
                  console.log(
                    `✅ Order confirmation email sent to ${emailToUse}${isNewUser ? " (new user with login credentials)" : " (existing user)"}`,
                  );
                }
                // After successful e-book send: sync to Mailchimp (non-blocking + timeout)
                try {
                  const mailchimpMarketing = getMailchimpMarketing();
                  if (mailchimpMarketing.isConfigured()) {
                    const normalizedEmail = emailToUse.toLowerCase().trim();
                    const name = (nameToUse || "").trim();
                    const [firstName, ...rest] = name ? name.split(/\s+/) : [];
                    const lastName = rest.length ? rest.join(" ") : undefined;

                    const purchaseTag =
                      ebookId === "paskbuffe"
                        ? "Köp - Påskbuffé"
                        : ebookId === "grill-sommarmat"
                          ? "Köp - Grill & Sommarmat"
                          : ebookId === "sota-godsaker"
                            ? "Köp - Sötsaker"
                            : ebookId === "halsosamma-frukostar"
                              ? "Köp - Hälsosamma Frukostar"
                              : ebookId === "juice-glow"
                                ? "Köp - Juice & Glow"
                                : "Köp - Brödboken";

                    await Promise.race([
                      mailchimpMarketing.addSubscriber({
                        email: normalizedEmail,
                        firstName: firstName || undefined,
                        lastName,
                        tags: [
                          "kund",
                          purchaseTag,
                          ...((metadata as any)?.campaignId ===
                          SUMMER_EBOOK_CAMPAIGN_ID
                            ? [SUMMER_EBOOK_CAMPAIGN_TAG]
                            : []),
                        ],
                        status: "subscribed",
                      }),
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                    ]);

                    const latestOrder = await prisma.order.findUnique({
                      where: { id: order.id },
                      select: { metadata: true },
                    });
                    const latestMetadata = (latestOrder?.metadata as any) || {};

                    await prisma.order.update({
                      where: { id: order.id },
                      data: {
                        metadata: {
                          ...latestMetadata,
                          mailchimpMarketingTaggedAt:
                            latestMetadata.mailchimpMarketingTaggedAt ||
                            new Date().toISOString(),
                        },
                      },
                    });
                  }
                } catch (e) {
                  console.warn(
                    "⚠️ Mailchimp Marketing subscriber add failed (non-critical):",
                    e,
                  );
                }
              }
            }
            // Mark email as sent in metadata
            const latestOrderForEmailMetadata = await prisma.order.findUnique({
              where: { id: order.id },
              select: { metadata: true },
            });
            const latestEmailMetadata =
              (latestOrderForEmailMetadata?.metadata as any) || metadata;

            await prisma.order.update({
              where: { id: order.id },
              data: {
                metadata: {
                  ...latestEmailMetadata,
                  confirmationEmailSent: true,
                  confirmationEmailSentAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }
    } catch (emailError) {
      console.error("❌ Failed to send order confirmation email:", emailError);
      // Don't throw - email failure shouldn't fail the order processing
    }
  } catch (error) {
    console.error("❌ Error processing completed order:", error);
    throw error;
  }
}

async function handleOrderFailed(
  webhookData: ReturnType<typeof normalizeWebhookPayload>,
) {
  const { orderId, merchantData, status } = webhookData;

  console.log("❌ Processing failed order:", {
    sveaOrderId: orderId,
    internalOrderId: merchantData,
    status,
  });

  try {
    // Find our order
    const order = await prisma.order.findUnique({
      where: { id: merchantData || "" },
    });

    if (!order) {
      console.error(`❌ Order not found: ${merchantData}`);
      return;
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: status === "Cancelled" ? "CANCELLED" : "FAILED",
        metadata: {
          ...(order.metadata as any),
          sveaOrderId: orderId,
          sveaStatus: status,
          failedAt: new Date().toISOString(),
        },
      },
    });

    // Restore coupon usage if applicable
    const couponCode = (order.metadata as any)?.couponCode;
    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode },
        data: { timesUsed: { decrement: 1 } },
      });
      console.log(`♻️ Restored coupon usage for: ${couponCode}`);
    }

    console.log(`✅ Order ${order.id} marked as ${status}`);
  } catch (error) {
    console.error("❌ Error processing failed order:", error);
    throw error;
  }
}

function generateSecurePassword(): string {
  const length = 16;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}
