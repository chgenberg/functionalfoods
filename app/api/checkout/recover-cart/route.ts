import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/database";

export const dynamic = "force-dynamic";

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
      items: order.items.map((item: any) => {
        const originalItem = originalItems.find((candidate: any) => {
          if (!candidate) return false;
          if (item.courseId && candidate.courseId === item.courseId) return true;
          if (item.courseId && candidate.id === item.courseId) return true;
          return candidate.name === item.name && candidate.type === item.type;
        });

        return {
          id: originalItem?.id || item.courseId || item.id,
          name: originalItem?.name || item.name,
          price: originalItem?.price ?? item.price,
          quantity: originalItem?.quantity || item.quantity,
          type: originalItem?.type || item.type,
          image: originalItem?.image,
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
