import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/database";
import {
  getSveaCheckout,
  SveaCheckoutService,
} from "@/app/lib/svea-checkout-service";
import { emailService } from "@/app/lib/email";
import { getMailchimpMarketing } from "@/app/lib/mailchimp-marketing";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

interface VerifyRequest {
  checkoutOrderId: string;
  orderId: string;
}

const isGuestEmail = (email?: string | null) =>
  !!email && email.startsWith("guest-");

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyRequest;
    let checkoutOrderId = body.checkoutOrderId;
    const clientOrderId = body.orderId;

    if (!clientOrderId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // ✅ If checkoutOrderId not provided by frontend, fetch it from DB
    if (!checkoutOrderId) {
      const dbOrder = await prisma.order.findUnique({
        where: { id: clientOrderId },
        select: { checkoutOrderId: true },
      });

      checkoutOrderId = dbOrder?.checkoutOrderId || undefined;

      console.log(
        "ℹ️ verify-svea-v2: checkoutOrderId missing from client; loaded from DB",
        {
          clientOrderId,
          checkoutOrderId: checkoutOrderId ? "present" : "missing",
        },
      );
    }

    if (!checkoutOrderId) {
      return NextResponse.json(
        {
          error:
            "Missing checkoutOrderId (not provided and not found on order)",
        },
        { status: 400 },
      );
    }

    // If simulation is enabled, treat as completed without contacting Svea
    if (
      process.env.PAYMENTS_SIMULATE === "true" ||
      checkoutOrderId === "SIMULATED"
    ) {
      const order = await prisma.order.findUnique({
        where: { id: clientOrderId },
        include: { items: true, user: true },
      });

      if (!order)
        return NextResponse.json({ error: "Order not found" }, { status: 404 });

      return NextResponse.json({
        success: true,
        paymentCompleted: true,
        orderStatus: "COMPLETED",
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          items: order.items.map((i) => ({
            productId: i.courseId || i.id,
            productName: i.name,
            productType: i.type,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      });
    }

    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();

    // Get order from Svea
    const sveaOrder = await sveaCheckout.getOrder(
      parseInt(checkoutOrderId, 10),
    );

    console.log("🔍 Verifying Svea order:", {
      checkoutOrderId,
      orderId: clientOrderId,
      sveaStatus: sveaOrder.status,
    });

    // Check if payment is completed
    const isCompleted = SveaCheckoutService.isOrderCompleted(sveaOrder.status);

    // Get our order from database
    let order = await prisma.order.findUnique({
      where: { id: clientOrderId },
      include: { items: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Calculate actual paid amount from SVEA order (includes discounts)
    let actualPaidAmount = 0;
    const sveaItemsMap = new Map<string, any>();

    if (sveaOrder.cart?.items) {
      for (const sveaItem of sveaOrder.cart.items) {
        // Skip discount items for item mapping, but include in total
        if (!String(sveaItem.articleNumber || "").startsWith("DISCOUNT")) {
          sveaItemsMap.set(sveaItem.articleNumber, sveaItem);
        }
        // All items (including negative discount) contribute to total
        actualPaidAmount +=
          (sveaItem.unitPrice || 0) * (sveaItem.quantity || 1);
      }
    }

    // Convert from öre to SEK
    let actualPaidAmountSEK = actualPaidAmount / 100;

    // Safety checks
    if (order.totalAmount > 0) {
      const ratio = actualPaidAmountSEK / order.totalAmount;
      if (ratio > 10) {
        actualPaidAmountSEK = actualPaidAmount; // likely already SEK
        console.warn(
          "⚠️ Detected amount might already be in SEK. Using as-is:",
          {
            original: actualPaidAmount,
            divided: actualPaidAmount / 100,
            dbAmount: order.totalAmount,
            ratio,
            using: actualPaidAmountSEK,
          },
        );

        if (
          Math.abs(actualPaidAmountSEK - order.totalAmount) >
          order.totalAmount * 0.5
        ) {
          console.warn(
            "⚠️ Calculated amount still seems wrong, using DB amount as fallback",
          );
          actualPaidAmountSEK = order.totalAmount;
        }
      } else if (ratio < 0.1 && actualPaidAmountSEK > 0) {
        console.warn("⚠️ Amount seems too small, might be double-divided");
      }
    }

    if (actualPaidAmountSEK < 0 || actualPaidAmountSEK > 100000) {
      console.warn(
        "⚠️ Calculated amount is outside reasonable range, using DB amount:",
        {
          calculated: actualPaidAmountSEK,
          dbAmount: order.totalAmount,
        },
      );
      actualPaidAmountSEK = order.totalAmount;
    }

    console.log("💰 Calculated actual paid amount from SVEA:", {
      actualPaidAmountOre: actualPaidAmount,
      actualPaidAmountSEK,
      dbTotalAmount: order.totalAmount,
      itemCount: sveaOrder.cart?.items?.length || 0,
      sveaItems: sveaOrder.cart?.items?.map((item: any) => ({
        articleNumber: item.articleNumber,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: (item.unitPrice || 0) * (item.quantity || 1),
      })),
    });

    // Use SVEA amount if cart items exist, otherwise DB fallback
    const displayTotalAmount =
      sveaOrder.cart?.items && sveaOrder.cart.items.length > 0
        ? actualPaidAmountSEK
        : order.totalAmount;

    // Map items with actual prices from SVEA if available
    const displayItems = order.items.map((item) => {
      let displayPrice = item.price;
      const vatRate = item.type === "book" ? 1.06 : 1.25;

      for (const [articleNumber, sveaItem] of sveaItemsMap.entries()) {
        const itemIdLower = item.id?.toLowerCase() || "";
        const articleLower = articleNumber.toLowerCase();

        if (
          itemIdLower.includes(articleLower) ||
          articleLower.includes(itemIdLower) ||
          item.name.toLowerCase().includes(articleLower) ||
          articleLower.includes(item.name.toLowerCase())
        ) {
          const priceInclVAT = (sveaItem.unitPrice || 0) / 100;
          displayPrice = priceInclVAT / vatRate;
          break;
        }
      }

      return {
        productId: item.courseId || item.id,
        productName: item.name,
        productType: item.type,
        quantity: item.quantity,
        price: Math.round(displayPrice * 100) / 100,
      };
    });

    const response: any = {
      success: true,
      paymentCompleted: isCompleted,
      orderStatus: sveaOrder.status,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: displayTotalAmount,
        customerEmail: sveaOrder.customer?.email || order.customerEmail,
        customerName:
          `${sveaOrder.customer?.firstName || ""} ${sveaOrder.customer?.lastName || ""}`.trim() ||
          order.customerName,
        items: displayItems,
      },
    };

    // If payment is completed, process the order (create purchases, send email, etc.)
    if (isCompleted) {
      // Update order with paid amount + SVEA metadata
      await prisma.order.update({
        where: { id: order.id },
        data: {
          totalAmount: displayTotalAmount,
          metadata: {
            ...(order.metadata as any),
            sveaOrderId: sveaOrder.id,
            sveaStatus: sveaOrder.status,
            sveaPaymentType: sveaOrder.paymentType,
            verifiedAt: new Date().toISOString(),
            actualPaidAmount: actualPaidAmountSEK,
          },
        },
      });

      let orderJustCompleted = false;
      let isNewUser = false;
      let temporaryPassword: string | undefined;

      // If order was PENDING, fast-track to COMPLETED (and link/create user if needed)
      if (order.status === "PENDING") {
        orderJustCompleted = true;

        const customerEmail = sveaOrder.customer?.email || order.customerEmail;
        const customerName =
          `${sveaOrder.customer?.firstName || ""} ${sveaOrder.customer?.lastName || ""}`.trim() ||
          order.customerName;

        const hasGuestUser = isGuestEmail(order.user?.email);

        if ((!order.userId || hasGuestUser) && customerEmail) {
          const normalizedEmail = customerEmail.toLowerCase().trim();

          const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (existingUser) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                userId: existingUser.id,
                customerEmail: normalizedEmail,
                customerName,
              },
            });

            const updatedOrder = await prisma.order.findUnique({
              where: { id: order.id },
              include: { items: true, user: true },
            });
            if (updatedOrder) order = updatedOrder;
          } else {
            temporaryPassword = generateSecurePassword();
            const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

            if (order.userId && hasGuestUser) {
              const updatedUser = await prisma.user.update({
                where: { id: order.userId },
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

              await prisma.order.update({
                where: { id: order.id },
                data: {
                  customerEmail: normalizedEmail,
                  customerName: updatedUser.name || customerName,
                },
              });

              const refreshedOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: true, user: true },
              });
              if (refreshedOrder) order = refreshedOrder;

              console.log(
                `📧 Guest user upgraded via verify: ${updatedUser.email}`,
              );
            } else {
              const newUser = await prisma.user.create({
                data: {
                  email: normalizedEmail,
                  name: customerName || "Ny kund",
                  password: hashedPassword,
                  role: "customer",
                  emailVerified: null,
                },
              });

              isNewUser = true;

              await prisma.order.update({
                where: { id: order.id },
                data: {
                  userId: newUser.id,
                  customerEmail: normalizedEmail,
                  customerName,
                },
              });

              const updatedOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: true, user: true },
              });
              if (updatedOrder) order = updatedOrder;

              console.log(`📧 New user created via verify: ${newUser.email}`);
            }
          }
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            customerEmail: sveaOrder.customer?.email || order.customerEmail,
            customerName:
              `${sveaOrder.customer?.firstName || ""} ${sveaOrder.customer?.lastName || ""}`.trim() ||
              order.customerName,
            metadata: {
              ...(order.metadata as any),
              processedAt: new Date().toISOString(),
            },
          },
        });

        console.log("⚡ Fast-tracking order completion from verification");

        // Refresh local order after completion update
        const refreshedAfterCompletion = await prisma.order.findUnique({
          where: { id: order.id },
          include: { items: true, user: true },
        });
        if (refreshedAfterCompletion) order = refreshedAfterCompletion;
      }

      // ✅ Mailchimp Marketing tagging (post-completion, idempotent)
      try {
        const refreshedOrder = await prisma.order.findUnique({
          where: { id: order.id },
          include: { items: true, user: true },
        });

        const metadata = (refreshedOrder?.metadata as any) || {};

        if (refreshedOrder && !metadata.mailchimpMarketingTaggedAt) {
          const emailToTag =
            refreshedOrder.user?.email &&
            !isGuestEmail(refreshedOrder.user.email)
              ? refreshedOrder.user.email
              : refreshedOrder.customerEmail &&
                  !isGuestEmail(refreshedOrder.customerEmail)
                ? refreshedOrder.customerEmail
                : null;

          if (!emailToTag) {
            console.warn(
              "⚠️ Mailchimp Marketing: missing email (cannot tag):",
              {
                orderId: refreshedOrder.id,
                userId: refreshedOrder.userId,
                userEmail: refreshedOrder.user?.email,
                customerEmail: refreshedOrder.customerEmail,
              },
            );
          } else {
            const mailchimpMarketing = getMailchimpMarketing();

            if (mailchimpMarketing.isConfigured()) {
              const courseNames = refreshedOrder.items
                .filter((i) => i.type === "course" || i.type === "book")
                .map((i) => i.name);

              const nameParts = (
                refreshedOrder.customerName ||
                refreshedOrder.user?.name ||
                ""
              )
                .trim()
                .split(" ")
                .filter(Boolean);

              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";

              await mailchimpMarketing.addCustomerWithCourseTags(
                emailToTag,
                courseNames,
                firstName,
                lastName,
              );

              await prisma.order.update({
                where: { id: refreshedOrder.id },
                data: {
                  metadata: {
                    ...metadata,
                    mailchimpMarketingTaggedAt: new Date().toISOString(),
                  },
                },
              });

              console.log(
                `✅ Mailchimp Marketing tagged (post-completion): ${emailToTag}`,
              );
            } else {
              console.warn(
                "⚠️ Mailchimp Marketing not configured (skipping tagging)",
              );
            }
          }
        } else if (refreshedOrder && metadata.mailchimpMarketingTaggedAt) {
          console.log("ℹ️ Mailchimp Marketing already tagged (skipping):", {
            orderId: refreshedOrder.orderNumber,
            taggedAt: metadata.mailchimpMarketingTaggedAt,
          });
        }
      } catch (err) {
        console.warn(
          "⚠️ Mailchimp Marketing tagging failed (non-critical):",
          err,
        );
      }

      // Update item prices if they differ from SVEA (only if cart.items is available)
      if (
        actualPaidAmountSEK > 0 &&
        sveaOrder.cart?.items &&
        sveaOrder.cart.items.length > 0
      ) {
        for (const orderItem of order.items) {
          for (const sveaItem of sveaOrder.cart.items) {
            if (String(sveaItem.articleNumber || "").startsWith("DISCOUNT"))
              continue;

            const itemIdLower = orderItem.id?.toLowerCase() || "";
            const articleLower = sveaItem.articleNumber.toLowerCase();

            if (
              itemIdLower.includes(articleLower) ||
              articleLower.includes(itemIdLower) ||
              orderItem.name.toLowerCase().includes(articleLower)
            ) {
              const vatRate = orderItem.type === "book" ? 1.06 : 1.25;
              const priceInclVAT = (sveaItem.unitPrice || 0) / 100;
              const priceExclVAT = priceInclVAT / vatRate;

              if (Math.abs(orderItem.price - priceExclVAT) > 0.01) {
                await prisma.orderItem.update({
                  where: { id: orderItem.id },
                  data: { price: Math.round(priceExclVAT * 100) / 100 },
                });
                console.log(
                  `✅ Updated item price: ${orderItem.name} from ${orderItem.price} to ${priceExclVAT}`,
                );
              }
              break;
            }
          }
        }
      }

      // Create purchases for courses if user exists
      if (order.userId) {
        const courseItems = order.items.filter(
          (item) => item.type === "course",
        );

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
          let courseId = item.courseId;

          if (!courseId) {
            const normalizedName = item.name.toLowerCase().trim();
            const mappedName = courseNameMap[normalizedName] || item.name;

            let course = await prisma.courseProduct.findFirst({
              where: { name: { equals: mappedName, mode: "insensitive" } },
            });

            if (!course) {
              course = await prisma.courseProduct.findFirst({
                where: { name: { equals: item.name, mode: "insensitive" } },
              });
            }

            if (!course && item.name.toLowerCase().includes("functional")) {
              const functionalPart = item.name.split("Functional ")[1]?.trim();
              if (functionalPart) {
                course = await prisma.courseProduct.findFirst({
                  where: {
                    AND: [
                      { name: { contains: "Functional", mode: "insensitive" } },
                      {
                        name: { contains: functionalPart, mode: "insensitive" },
                      },
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

            await prisma.orderItem.update({
              where: { id: item.id },
              data: { courseId: course.id },
            });
          }

          const existingPurchase = await prisma.purchase.findUnique({
            where: { userId_courseId: { userId: order.userId, courseId } },
          });

          if (!existingPurchase) {
            await prisma.purchase.create({
              data: {
                userId: order.userId,
                courseId,
                amount: item.price * (item.quantity || 1),
                status: "completed",
                orderId: order.id,
                accessExpiresAt: new Date(
                  Date.now() + 365 * 24 * 60 * 60 * 1000,
                ),
              },
            });
            console.log(`✅ Created purchase for course: ${courseId}`);
          }
        }
      }

      response.order.status = "COMPLETED";
      response.order.totalAmount = displayTotalAmount;
      response.paymentCompleted = true;

      // Send order confirmation email if order was just completed
      if (orderJustCompleted) {
        try {
          const updatedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: true, user: true },
          });

          if (!updatedOrder) {
            console.warn(`⚠️ Order not found for email sending: ${order.id}`);
          } else {
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
              `${sveaOrder.customer?.firstName || ""} ${sveaOrder.customer?.lastName || ""}`.trim() ||
              emailToUse?.split("@")[0] ||
              "Kund";

            if (!emailToUse || isGuestEmail(emailToUse)) {
              console.warn(
                `⚠️ No valid email address found for order ${order.id}. customerEmail: ${updatedOrder.customerEmail}, user.email: ${updatedOrder.user?.email}`,
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

              // --- E-book download email (inside same scope as updatedOrder/emailToUse/baseUrl/bookItems) ---
              if (bookItems.length > 0) {
                const crypto = await import("crypto");
                const baseUrl =
                  process.env.NEXT_PUBLIC_BASE_URL ||
                  "https://www.functionalfoods.se";

                for (const book of bookItems) {
                  const downloadToken = crypto
                    .randomBytes(16)
                    .toString("hex")
                    .toUpperCase();

                  let ebookId = "brodboken-2026";
                  const n = book.name.toLowerCase();
                  if (n.includes("brodboken") || n.includes("brodbok")) {
                    ebookId = "brodboken-2026";
                  }
                  if (n.includes("påskbuffé") || n.includes("paskbuffe")) {
                    ebookId = "paskbuffe";
                  }
                  if (
                    n.includes("söta godsaker") ||
                    n.includes("sota godsaker") ||
                    n.includes("sota-godsaker")
                  ) {
                    ebookId = "sota-godsaker";
                  }

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

                  let downloadUrl = `${baseUrl}/brodboken/ladda-ner?token=${downloadToken}`;

                  if (ebookId === "paskbuffe") {
                    downloadUrl = `${baseUrl}/e-bocker/paskbuffe/ladda-ner?token=${downloadToken}`;
                  }
                  if (ebookId === "sota-godsaker") {
                    downloadUrl = `${baseUrl}/e-bocker/sota-godsaker/ladda-ner?token=${downloadToken}`;
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
                    `✅ E-book download email sent for: ${book.name} with token: ${downloadToken.substring(0, 8)}...`,
                  );
                }
              }

              const emailCourses = courseItems.map((item) => ({
                name: item.name,
                price:
                  (Math.round(item.price * (1 + COURSE_VAT_RATE) * 100) / 100) *
                  (item.quantity || 1),
              }));

              const metadata = (updatedOrder.metadata as any) || {};
              const emailAlreadySent = metadata.confirmationEmailSent;

              if (emailAlreadySent) {
                console.log(
                  "ℹ️ Order confirmation email already sent (skipping duplicate)",
                );
              } else {
                const baseUrl =
                  process.env.NEXT_PUBLIC_BASE_URL ||
                  "https://www.functionalfoods.se";

                if (courseItems.length > 0) {
                  await emailService.sendOrderConfirmation({
                    customerEmail: emailToUse,
                    customerName: nameToUse,
                    orderNumber: updatedOrder.orderNumber,
                    totalAmount: displayTotalAmount,
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
                    `✅ Order confirmation email sent via verify to ${emailToUse}${
                      isNewUser
                        ? " (new user with login credentials)"
                        : " (existing user)"
                    }`,
                  );
                }

                await prisma.order.update({
                  where: { id: order.id },
                  data: {
                    metadata: {
                      ...metadata,
                      confirmationEmailSent: true,
                      confirmationEmailSentAt: new Date().toISOString(),
                    },
                  },
                });
              }
            }
          }
        } catch (emailError) {
          console.error(
            "❌ Failed to send order confirmation email via verify:",
            emailError,
          );
        }
      }

      // --- Mailchimp E-commerce purchase tracking (run from verify to avoid webhook dependency) ---
      try {
        const updatedOrder = await prisma.order.findUnique({
          where: { id: order.id },
          include: { user: true, items: true },
        });

        if (!updatedOrder) {
          console.warn(
            "⚠️ Mailchimp E-commerce: order not found after completion:",
            order.id,
          );
        } else {
          const emailForTracking =
            updatedOrder.user?.email &&
            !updatedOrder.user.email.startsWith("guest-")
              ? updatedOrder.user.email
              : updatedOrder.customerEmail &&
                  !updatedOrder.customerEmail.startsWith("guest-")
                ? updatedOrder.customerEmail
                : null;

          if (!emailForTracking) {
            console.warn(
              "⚠️ Mailchimp E-commerce: missing email (cannot track):",
              {
                orderId: updatedOrder.id,
                userId: updatedOrder.userId,
                userEmail: updatedOrder.user?.email,
                customerEmail: updatedOrder.customerEmail,
              },
            );
          } else {
            const metadata = (updatedOrder.metadata as any) || {};

            if (metadata.mailchimpEcommerceTrackedAt) {
              console.log(
                "ℹ️ Mailchimp E-commerce already tracked (skipping):",
                {
                  orderId: updatedOrder.orderNumber,
                  trackedAt: metadata.mailchimpEcommerceTrackedAt,
                },
              );
            } else {
              const { getMailchimpEcommerce } =
                await import("@/app/lib/mailchimp-ecommerce");
              const mailchimpEcommerce = getMailchimpEcommerce();

              const totalAmount = updatedOrder.totalAmount || 0;
              const vatRate = 0.25;
              const taxTotal = 0;

              let discountTotal = 0;
              if (typeof metadata.discountAmount === "number") {
                discountTotal = metadata.discountAmount;
              } else if (typeof metadata.discountAmount === "string") {
                const parsed = Number(metadata.discountAmount);
                if (!Number.isNaN(parsed)) discountTotal = parsed;
              }

              const attribution = metadata.attribution || {};
              const campaignId = attribution?.mc_cid || undefined;
              const trackingCode =
                attribution?.utm_campaign || campaignId || undefined;

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
                if (attribution.mc_cid)
                  params.set("mc_cid", attribution.mc_cid);
                landingSite = `https://functionalfoods.se/?${params.toString()}`;
              }

              await mailchimpEcommerce.trackPurchase({
                orderId: updatedOrder.orderNumber,
                customerEmail: emailForTracking,
                customerName:
                  updatedOrder.user?.name ||
                  updatedOrder.customerName ||
                  undefined,
                items: updatedOrder.items.map((it) => ({
                  id: it.courseId || it.id,
                  name: it.name,
                  price: it.price,
                  quantity: it.quantity,
                  type: (it.type as any) || "course",
                })),
                totalAmount,
                currency: updatedOrder.currency || "SEK",
                orderDate: updatedOrder.createdAt,
                discountTotal,
                shippingTotal: 0,
                taxTotal,
                campaignId,
                landingSite,
                trackingCode,
              });

              console.log(
                "✅ Mailchimp E-commerce purchase tracked (via verify):",
                {
                  orderId: updatedOrder.orderNumber,
                  email: emailForTracking,
                  totalAmount,
                  itemsCount: updatedOrder.items.length,
                },
              );

              await prisma.order.update({
                where: { id: updatedOrder.id },
                data: {
                  metadata: {
                    ...metadata,
                    mailchimpEcommerceTrackedAt: new Date().toISOString(),
                  },
                },
              });
            }
          }
        }
      } catch (e) {
        console.warn(
          "⚠️ Mailchimp E-commerce tracking failed (verify, non-critical):",
          e,
        );
      }
    }

    console.log("✅ Returning verification response:", {
      success: response.success,
      paymentCompleted: response.paymentCompleted,
      orderStatus: response.orderStatus,
      orderDbStatus: response.order.status,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Verification error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
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
