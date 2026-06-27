import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/database";

export const dynamic = "force-dynamic";

const productImages: Record<string, string> = {
  "brodboken-2026": "/baka-glutenfritt-square.png",
  paskbuffe: "/paskbuffe-square.jpg",
  "sota-godsaker": "/sota-godsaker-square.png",
  "grill-sommarmat": "/grill-sommarmat-square.png",
  "functional-flow": "/Kurser_bilder/Functional_Gut Health.jpg",
  "functional-basics": "/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg",
  "functional-energy": "/Kurser_bilder/Functional_insulin balance.jpg",
  "functional-hormone": "/Hormonell_balans/hormonell_balans_kurssida.png",
  "hormonell-balans": "/Hormonell_balans/hormonell_balans_kurssida.png",
};

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId")?.trim();

    if (!orderId) {
      return NextResponse.json({ error: "orderId saknas" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        status: "PENDING",
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Kundvagnen hittades inte" }, { status: 404 });
    }

    const metadata = (order.metadata as any) || {};
    const originalItems = Array.isArray(metadata.items) ? metadata.items : [];

    return NextResponse.json({
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      couponCode: metadata.couponCode || undefined,
      items: order.items.map((item: any) => {
        const originalItem = originalItems.find((candidate: any) => {
          if (!candidate) return false;
          if (item.courseId && candidate.courseId === item.courseId) return true;
          if (item.courseId && candidate.id === item.courseId) return true;
          return candidate.name === item.name && candidate.type === item.type;
        });

        const itemId = originalItem?.id || item.courseId || item.id;

        return {
          id: itemId,
          name: originalItem?.name || item.name,
          price: originalItem?.price ?? item.price,
          quantity: originalItem?.quantity || item.quantity,
          type: originalItem?.type || item.type,
          image: originalItem?.image || productImages[itemId],
        };
      }),
    });
  } catch (error) {
    console.error("Recover cart error:", error);
    return NextResponse.json(
      { error: "Kunde inte återställa kundvagnen" },
      { status: 500 },
    );
  }
}
