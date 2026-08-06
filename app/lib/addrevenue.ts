import { prisma } from "@/app/lib/database";

const ADDREVENUE_ENDPOINT = "https://addrevenue.io/t";
const ADDREVENUE_ADVERTISER_ID = "988141";
const ADDREVENUE_EVENT_TYPE = "Purchase";
const ADDREVENUE_MARKET = "SE";
const ADDREVENUE_CURRENCY = "SEK";
const PENDING_RETRY_AFTER_MS = 2 * 60 * 1000;

type AddrevenueAttribution = {
  addrevenue_clickId?: string;
  addrevenue_channelId?: string;
  addrevenue_advertiserId?: string;
  addrevenue_market?: string;
  addrevenue_clickRef?: string;
};

type TrackOrderInput = {
  id: string;
  orderNumber?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  metadata?: unknown;
  items?: Array<{
    price?: number | null;
    quantity?: number | null;
  }>;
};

function getAddrevenueAttribution(metadata: any): AddrevenueAttribution | null {
  const attr = metadata?.attribution || {};
  const nested = attr?.addrevenue || {};

  const addrevenue = {
    addrevenue_clickId:
      nested.clickId ||
      nested.clickid ||
      attr.addrevenue_clickId ||
      attr.clickId ||
      attr.clickid,
    addrevenue_channelId:
      nested.channelId ||
      nested.channelid ||
      attr.addrevenue_channelId ||
      attr.channelId ||
      attr.channelid,
    addrevenue_advertiserId:
      nested.advertiserId ||
      nested.advertiserid ||
      attr.addrevenue_advertiserId ||
      attr.advertiserId ||
      attr.advertiserid,
    addrevenue_market:
      nested.market ||
      attr.addrevenue_market ||
      attr.market,
    addrevenue_clickRef:
      nested.clickRef ||
      nested.clickref ||
      attr.addrevenue_clickRef ||
      attr.clickRef ||
      attr.clickref,
  };

  if (!addrevenue.addrevenue_clickId || !addrevenue.addrevenue_channelId) {
    return null;
  }

  return addrevenue;
}

function formatValue(value: number): number {
  return Math.round(value * 100) / 100;
}

function getOrderValueExVat(
  items: TrackOrderInput["items"],
  fallbackTotalInclVat: number,
): number {
  const itemValueExVat = (items || []).reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  if (itemValueExVat > 0) {
    return itemValueExVat;
  }

  return fallbackTotalInclVat / 1.06;
}

function isFreshPending(metadata: Record<string, any>): boolean {
  if (metadata.addrevenuePostbackStatus !== "pending") {
    return false;
  }

  const queuedAt = metadata.addrevenuePostbackQueuedAt
    ? new Date(metadata.addrevenuePostbackQueuedAt).getTime()
    : 0;

  return queuedAt > 0 && Date.now() - queuedAt < PENDING_RETRY_AFTER_MS;
}

export async function sendAddrevenuePostbackForOrder(order: TrackOrderInput) {
  const orderRecord = await prisma.order.findUnique({
    where: { id: order.id },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      currency: true,
      metadata: true,
      items: {
        select: {
          price: true,
          quantity: true,
        },
      },
    },
  });

  if (!orderRecord) {
    return { skipped: true, reason: "order_not_found" };
  }

  const orderId = orderRecord.id;
  const orderNumber = orderRecord.orderNumber || order.orderNumber || order.id;
  const orderTotal = Number(orderRecord.totalAmount || order.totalAmount || 0);
  const orderValueExVat = getOrderValueExVat(orderRecord.items, orderTotal);
  const orderCurrency = (
    orderRecord.currency ||
    order.currency ||
    ADDREVENUE_CURRENCY
  ).toUpperCase();
  const metadata = ((orderRecord.metadata as any) || {}) as Record<string, any>;

  const addrevenue = getAddrevenueAttribution(metadata);
  if (!addrevenue) {
    return { skipped: true, reason: "missing_addrevenue_attribution" };
  }

  const payload = {
    type: ADDREVENUE_EVENT_TYPE,
    advertiserId:
      addrevenue.addrevenue_advertiserId || ADDREVENUE_ADVERTISER_ID,
    channelId: addrevenue.addrevenue_channelId,
    clickId: addrevenue.addrevenue_clickId,
    value: formatValue(orderValueExVat),
    currency: orderCurrency,
    orderId: orderNumber,
    market: addrevenue.addrevenue_market || ADDREVENUE_MARKET,
  };

  if (
    metadata.addrevenuePostbackStatus === "success" ||
    isFreshPending(metadata)
  ) {
    return {
      skipped: true,
      reason:
        metadata.addrevenuePostbackStatus === "success"
          ? "already_tracked"
          : "already_pending",
    };
  }
 
  await prisma.order.update({
    where: { id: orderId },
    data: {
      metadata: {
        ...metadata,
        addrevenue: {
          clickId: payload.clickId,
          channelId: payload.channelId,
          advertiserId: payload.advertiserId,
          market: payload.market,
          clickRef: addrevenue.addrevenue_clickRef || null,
        },
        addrevenuePayload: payload,
        addrevenuePostbackStatus: "pending",
        addrevenuePostbackQueuedAt: new Date().toISOString(),
      },
    },
  });

  try {
    const response = await fetch(ADDREVENUE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    const trackedAtDate = new Date();
    const trackedAt = trackedAtDate.toISOString();

    await prisma.order.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...metadata,
          addrevenue: {
            clickId: payload.clickId,
            channelId: payload.channelId,
            advertiserId: payload.advertiserId,
            market: payload.market,
            clickRef: addrevenue.addrevenue_clickRef || null,
          },
          addrevenuePayload: payload,
          addrevenueTrackedAt: response.ok ? trackedAt : null,
          addrevenuePostbackStatus: response.ok ? "success" : "failed",
          addrevenuePostbackStatusCode: response.status,
          addrevenuePostbackResponse: responseText.slice(0, 500),
        },
      },
    });

    return {
      skipped: false,
      ok: response.ok,
      status: response.status,
      responseText,
      payload,
    };
  } catch (error: any) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...metadata,
          addrevenue: {
            clickId: payload.clickId,
            channelId: payload.channelId,
            advertiserId: payload.advertiserId,
            market: payload.market,
            clickRef: addrevenue.addrevenue_clickRef || null,
          },
          addrevenuePayload: payload,
          addrevenuePostbackStatus: "error",
          addrevenuePostbackError:
            error?.message || "Unknown Addrevenue postback error",
        },
      },
    });

    return {
      skipped: false,
      ok: false,
      error: error?.message || "Unknown Addrevenue postback error",
      payload,
    };
  }
}
