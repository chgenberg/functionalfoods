import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { requireAdminAuth } from "@/app/lib/admin-auth";
import { emailService } from "@/app/lib/email";
import { getMailchimpMarketing } from "@/app/lib/mailchimp-marketing";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

function generateSecurePassword(): string {
  const length = 16;
  const chars =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * POST /api/admin/orders/manual-complete
 * Body: { orderId?: string; orderNumber?: string }
 *
 * Marks an order as COMPLETED and sends the appropriate confirmation email(s).
 * This is intended for Svea orders that are paid but stuck as PENDING in admin.
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { orderId, orderNumber } = body || {};

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: "orderId eller orderNumber krävs" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { orderNumber },
      include: {
        user: true,
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order hittades inte" },
        { status: 404 },
      );
    }

    const metadata = (order.metadata as any) || {};
    const customerEmail = order.customerEmail || order.user?.email;
    const customerName = order.customerName || order.user?.name || "Kund";

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Saknar kundens e-post" },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.functionalfoods.se";
    const bookItems = order.items.filter((i) => i.type === "book");
    const courseItems = order.items.filter((i) => i.type === "course");

    let isNewUser = false;
    let temporaryPassword: string | undefined;
    let user = order.user;

    await prisma.$transaction(async (tx) => {
      // Upsert user if missing
      if (!user) {
        const existing = await tx.user.findUnique({
          where: { email: customerEmail.toLowerCase().trim() },
        });
        if (existing) {
          user = existing;
          await tx.order.update({
            where: { id: order.id },
            data: { userId: existing.id },
          });
        } else {
          temporaryPassword = generateSecurePassword();
          const hashed = await bcrypt.hash(temporaryPassword, 12);
          user = await tx.user.create({
            data: {
              email: customerEmail.toLowerCase().trim(),
              name: customerName || "Ny kund",
              password: hashed,
              role: "customer",
            },
          });
          isNewUser = true;
          await tx.order.update({
            where: { id: order.id },
            data: { userId: user.id },
          });
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          metadata: {
            ...metadata,
            manuallyApproved: true,
            approvedAt: new Date().toISOString(),
            approvedBy: "admin-manual-complete",
          },
        },
      });

      // Update payment status if present
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: "COMPLETED",
            processedAt: new Date(),
          },
        });
      }

      // Map known course names to courseProducts
      const courseNameMap: Record<string, string> = {
        "functional energy": "Functional Energy",
        "functional basics": "Functional Basics",
        "functional flow": "Functional Flow",
        "hormonell balans": "Hormonell Balans",
        "prova på vecka med functional foods!":
          "Prova på vecka med Functional Foods!",
        "prova på vecka": "Prova på vecka med Functional Foods!",
      };

      // Ensure purchases for course items
      if (user) {
        for (const item of courseItems) {
          let courseId = item.courseId;

          if (!courseId) {
            const normalized = item.name.toLowerCase().trim();
            const mapped = courseNameMap[normalized] || item.name;
            const course = await tx.courseProduct.findFirst({
              where: {
                OR: [
                  { name: { equals: mapped, mode: "insensitive" } },
                  { name: { equals: item.name, mode: "insensitive" } },
                  {
                    name: {
                      contains: normalized.split(" ").pop() || "",
                      mode: "insensitive",
                    },
                  },
                ],
              },
            });
            if (course) {
              courseId = course.id;
              await tx.orderItem.update({
                where: { id: item.id },
                data: { courseId: course.id },
              });
            }
          }

          if (courseId) {
            const exists = await tx.purchase.findUnique({
              where: { userId_courseId: { userId: user.id, courseId } },
            });
            if (!exists) {
              await tx.purchase.create({
                data: {
                  userId: user.id,
                  courseId,
                  amount: item.price * (item.quantity || 1),
                  status: "completed",
                  orderId: order.id,
                  accessExpiresAt: new Date(
                    new Date().setFullYear(new Date().getFullYear() + 1),
                  ),
                },
              });
            }
          }
        }
      }

      // Ensure ebook download tokens
      for (const book of bookItems) {
        const existing = await tx.ebookDownload.findFirst({
          where: {
            orderNumber: order.orderNumber,
            ebookName: book.name,
          },
        });
        if (!existing) {
          const downloadToken = (await import("crypto"))
            .randomBytes(16)
            .toString("hex")
            .toUpperCase();
          let ebookId = "brodboken-2026";
          if (
            book.name.toLowerCase().includes("brodboken") ||
            book.name.toLowerCase().includes("brodbok")
          ) {
            ebookId = "brodboken-2026";
          }
          if (
            book.name.toLowerCase().includes("påskbuffé") ||
            book.name.toLowerCase().includes("paskbuffe")
          ) {
            ebookId = "paskbuffe";
          }
          if (
            book.name.toLowerCase().includes("söta godsaker") ||
            book.name.toLowerCase().includes("sota godsaker") ||
            book.name.toLowerCase().includes("sota-godsaker")
          ) {
            ebookId = "sota-godsaker";
          }
          if (
            book.name.toLowerCase().includes("grill- & sommarmat") ||
            book.name.toLowerCase().includes("grill sommarmat") ||
            book.name.toLowerCase().includes("grill och sommarmat") ||
            book.name.toLowerCase().includes("grill-sommarmat")
          ) {
            ebookId = "grill-sommarmat";
          }
          if (
            book.name.toLowerCase().includes("hälsosamma frukostar") ||
            book.name.toLowerCase().includes("halsosamma frukostar") ||
            book.name.toLowerCase().includes("halsosamma-frukostar")
          ) {
            ebookId = "halsosamma-frukostar";
          }
          await tx.ebookDownload.create({
            data: {
              token: downloadToken,
              orderNumber: order.orderNumber,
              customerEmail: customerEmail,
              ebookId,
              ebookName: book.name,
              maxDownloads: 5,
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    });

    // Send emails (outside transaction)
    const results: string[] = [];
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, user: true },
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order hittades inte efter uppdatering" },
        { status: 404 },
      );
    }

    const freshMetadata = (updatedOrder.metadata as any) || {};
    const courseItemsNow = updatedOrder.items.filter(
      (i) => i.type === "course",
    );
    const bookItemsNow = updatedOrder.items.filter((i) => i.type === "book");

    // Course confirmation email (if not already sent)
    if (courseItemsNow.length > 0 && !freshMetadata.confirmationEmailSent) {
      const emailCourses = courseItemsNow.map((item) => ({
        name: item.name,
        price: item.price * (item.quantity || 1),
      }));

      await emailService.sendOrderConfirmation({
        customerEmail,
        customerName,
        orderNumber: updatedOrder.orderNumber,
        totalAmount: updatedOrder.totalAmount || 0,
        courses: emailCourses,
        loginCredentials:
          isNewUser && temporaryPassword
            ? {
                email: customerEmail,
                password: temporaryPassword,
                loginUrl: `${baseUrl}/login`,
              }
            : undefined,
        isExistingUser: !isNewUser,
      });

      await prisma.order.update({
        where: { id: updatedOrder.id },
        data: {
          metadata: {
            ...freshMetadata,
            confirmationEmailSent: true,
            confirmationEmailSentAt: new Date().toISOString(),
          },
        },
      });
      results.push("order_confirmation_sent");
    }

    // E-book emails
    if (bookItemsNow.length > 0) {
      for (const book of bookItemsNow) {
        const downloadRecord = await prisma.ebookDownload.findFirst({
          where: {
            orderNumber: updatedOrder.orderNumber,
            ebookName: book.name,
          },
        });
        if (downloadRecord) {
          let downloadUrl = `${baseUrl}/brodboken/ladda-ner?token=${downloadRecord.token}`;

          if (downloadRecord.ebookId === "paskbuffe") {
            downloadUrl = `${baseUrl}/e-bocker/paskbuffe/ladda-ner?token=${downloadRecord.token}`;
          }

          if (downloadRecord.ebookId === "sota-godsaker") {
            downloadUrl = `${baseUrl}/e-bocker/sota-godsaker/ladda-ner?token=${downloadRecord.token}`;
          }

          if (downloadRecord.ebookId === "grill-sommarmat") {
            downloadUrl = `${baseUrl}/e-bocker/grill-sommarmat/ladda-ner?token=${downloadRecord.token}`;
          }

          if (downloadRecord.ebookId === "halsosamma-frukostar") {
            downloadUrl = `${baseUrl}/e-bocker/halsosamma-frukostar/ladda-ner?token=${downloadRecord.token}`;
          }

          const sent = await emailService.sendEbookDownloadEmail({
            email: customerEmail,
            name: customerName,
            ebookName: book.name,
            downloadUrl,
            downloadPassword: downloadRecord.token,
            orderNumber: updatedOrder.orderNumber,
          });
          if (sent) results.push(`ebook_email_sent:${book.name}`);

          // After successful e-book send: sync to Mailchimp (non-blocking + timeout)
          if (sent) {
            try {
              const mailchimpMarketing = getMailchimpMarketing();
              if (mailchimpMarketing.isConfigured()) {
                const normalizedEmail = customerEmail.toLowerCase().trim();
                const name = (customerName || "").trim();
                const [firstName, ...rest] = name ? name.split(/\s+/) : [];
                const lastName = rest.length ? rest.join(" ") : undefined;

                const purchaseTag =
                  downloadRecord.ebookId === "paskbuffe"
                    ? "Köp - Påskbuffé"
                    : downloadRecord.ebookId === "grill-sommarmat"
                      ? "Köp - Grill & Sommarmat"
                      : downloadRecord.ebookId === "sota-godsaker"
                        ? "Köp - Sötsaker"
                        : downloadRecord.ebookId === "halsosamma-frukostar"
                          ? "Köp - Hälsosamma Frukostar"
                          : "Köp - Brödboken";

                await Promise.race([
                  mailchimpMarketing.addSubscriber({
                    email: normalizedEmail,
                    firstName: firstName || undefined,
                    lastName,
                    tags: ["kund", purchaseTag],
                    status: "subscribed",
                  }),
                  new Promise((resolve) => setTimeout(resolve, 1500)),
                ]);
              }
            } catch (e) {
              console.warn(
                "⚠️ Mailchimp Marketing subscriber add failed (non-critical):",
                e,
              );
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      status: "COMPLETED",
      emails: results,
    });
  } catch (error) {
    console.error("Error manually completing order:", error);
    return NextResponse.json(
      { error: "Kunde inte slutföra ordern manuellt" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
