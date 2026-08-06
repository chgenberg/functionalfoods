import { prisma } from "@/app/lib/database";

const ADDREVENUE_ENDPOINT = "https://addrevenue.io/t";
const ADDREVENUE_ADVERTISER_ID = "988141";
const ADDREVENUE_EVENT_TYPE = "Purchase";
const ADDREVENUE_MARKET = "SE";
const ADDREVENUE_CURRENCY = "SEK";

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

export async function sendAddrevenuePostbackForOrder(order: TrackOrderInput) {
  const metadata = ((order.metadata as any) || {}) as Record<string, any>;

  if (metadata.addrevenueTrackedAt || metadata.addrevenuePostbackPendingAt) {
    return { skipped: true, reason: "already_tracked_or_pending" };
  }

  const addrevenue = getAddrevenueAttribution(metadata);
  if (!addrevenue) {
    return { skipped: true, reason: "missing_addrevenue_attribution" };
  }

  const now = new Date().toISOString();
  await prisma.order.update({
    where: { id: order.id },
    data: {
      metadata: {
        ...metadata,
        addrevenuePostbackPendingAt: now,
      },
    },
  });

  const payload = {
    type: ADDREVENUE_EVENT_TYPE,
    advertiserId:
      addrevenue.addrevenue_advertiserId || ADDREVENUE_ADVERTISER_ID,
    channelId: addrevenue.addrevenue_channelId,
    clickId: addrevenue.addrevenue_clickId,
    value: formatValue(Number(order.totalAmount || 0)),
    currency: (order.currency || ADDREVENUE_CURRENCY).toUpperCase(),
    orderId: order.orderNumber || order.id,
    market: addrevenue.addrevenue_market || ADDREVENUE_MARKET,
  };

  try {
    const response = await fetch(ADDREVENUE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    const trackedAt = new Date().toISOString();

    await prisma.order.update({
      where: { id: order.id },
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
          addrevenuePostbackPendingAt: null,
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
      where: { id: order.id },
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
          addrevenuePostbackPendingAt: null,
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
