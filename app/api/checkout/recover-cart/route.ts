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

    return NextResponse.json({
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      items: order.items.map((item: any) => ({
        id: item.courseId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
      })),
    });
  } catch (error) {
    console.error("Recover cart error:", error);
    return NextResponse.json(
      { error: "Kunde inte återställa kundvagnen" },
      { status: 500 },
    );
  }
}
