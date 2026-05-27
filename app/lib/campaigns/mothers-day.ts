export const MOTHERS_DAY_CAMPAIGN_ID = "mors-dag-2026";
export const MOTHERS_DAY_CAMPAIGN_STORAGE_KEY = "ff_campaign_mors_dag_2026";
export const MOTHERS_DAY_BUNDLE_GROSS_PRICE = 125;
export const MOTHERS_DAY_BOOK_IDS = ["brodboken-2026", "sota-godsaker"] as const;

const STOCKHOLM_TIME_ZONE = "Europe/Stockholm";
const CAMPAIGN_START = { year: 2026, month: 5, day: 29 };
const CAMPAIGN_END = { year: 2026, month: 5, day: 31 };
const BOOK_VAT_RATE = 0.06;

export type CampaignCartItem = {
  id: string;
  name?: string;
  price: number;
  quantity: number;
  type: "course" | "book";
  vatRate?: number;
};

export function isMothersDayCampaignId(campaignId?: string | null) {
  return campaignId === MOTHERS_DAY_CAMPAIGN_ID;
}

function campaignForceEnabled() {
  const env =
    typeof process !== "undefined" && process.env ? process.env : {};

  return (
    env.MOTHERS_DAY_CAMPAIGN_FORCE === "true" ||
    env.NEXT_PUBLIC_MOTHERS_DAY_CAMPAIGN_FORCE === "true"
  );
}

function stockholmDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: STOCKHOLM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value || 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

function dateKey(parts: { year: number; month: number; day: number }) {
  return parts.year * 10000 + parts.month * 100 + parts.day;
}

export function isMothersDayCampaignActive(date = new Date()) {
  if (campaignForceEnabled()) return true;

  const today = dateKey(stockholmDateParts(date));
  return today >= dateKey(CAMPAIGN_START) && today <= dateKey(CAMPAIGN_END);
}

export function isMothersDayCampaignPreviewAllowed(origin?: string | null) {
  if (campaignForceEnabled()) return true;
  if (!origin) return false;

  try {
    const hostname = new URL(origin).hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.includes("staging")) return true;
    if (hostname.endsWith(".vercel.app")) return true;
    if (hostname.endsWith(".railway.app")) return true;
    return ![
      "functionalfoods.se",
      "www.functionalfoods.se",
      "ulrikafunctionalfoods.com",
      "www.ulrikafunctionalfoods.com",
    ].includes(hostname);
  } catch {
    return false;
  }
}

export function shouldApplyMothersDayCampaign(options?: {
  campaignId?: string | null;
  origin?: string | null;
  date?: Date;
}) {
  if (isMothersDayCampaignActive(options?.date)) return true;
  return (
    isMothersDayCampaignId(options?.campaignId) &&
    isMothersDayCampaignPreviewAllowed(options?.origin)
  );
}

export function hasStoredMothersDayCampaign() {
  if (typeof window === "undefined") return false;

  try {
    const stored = sessionStorage.getItem(MOTHERS_DAY_CAMPAIGN_STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return isMothersDayCampaignId(parsed?.id);
  } catch {
    return false;
  }
}

export function isMothersDayBook(id: string) {
  return (MOTHERS_DAY_BOOK_IDS as readonly string[]).includes(id);
}

export function hasMothersDayBundle(items: CampaignCartItem[]) {
  return MOTHERS_DAY_BOOK_IDS.every((id) =>
    items.some((item) => item.id === id && item.quantity > 0),
  );
}

export function getMissingMothersDayBookId(items: CampaignCartItem[]) {
  const present = new Set(items.filter((item) => item.quantity > 0).map((item) => item.id));
  const missing = MOTHERS_DAY_BOOK_IDS.find((id) => !present.has(id));
  const hasOneCampaignBook = MOTHERS_DAY_BOOK_IDS.some((id) => present.has(id));
  return hasOneCampaignBook ? missing || null : null;
}

export function applyMothersDayBundlePricing<T extends CampaignCartItem>(
  items: T[],
  active = isMothersDayCampaignActive(),
): T[] {
  if (!active || !hasMothersDayBundle(items)) return items;

  const bundleItems = MOTHERS_DAY_BOOK_IDS.map((id) =>
    items.find((item) => item.id === id),
  ).filter(Boolean) as T[];

  const bundleCount = Math.min(...bundleItems.map((item) => item.quantity));
  if (!Number.isFinite(bundleCount) || bundleCount <= 0) return items;

  const normalBundleGross = bundleItems.reduce((sum, item) => {
    const vatRate = item.vatRate ?? BOOK_VAT_RATE;
    return sum + item.price * (1 + vatRate);
  }, 0);

  if (normalBundleGross <= MOTHERS_DAY_BUNDLE_GROSS_PRICE) return items;

  return items.map((item) => {
    if (!isMothersDayBook(item.id)) return item;

    const vatRate = item.vatRate ?? BOOK_VAT_RATE;
    const normalGross = item.price * (1 + vatRate);
    const campaignGrossShare =
      MOTHERS_DAY_BUNDLE_GROSS_PRICE * (normalGross / normalBundleGross);
    const campaignExVatShare = campaignGrossShare / (1 + vatRate);
    const regularQuantity = Math.max(0, item.quantity - bundleCount);
    const adjustedUnitPrice =
      (campaignExVatShare * bundleCount + item.price * regularQuantity) /
      item.quantity;

    return {
      ...item,
      price: adjustedUnitPrice,
    };
  });
}

export function getMothersDayBundleSavingsGross(
  items: CampaignCartItem[],
  active = isMothersDayCampaignActive(),
) {
  if (!active || !hasMothersDayBundle(items)) return 0;

  const bundleItems = MOTHERS_DAY_BOOK_IDS.map((id) =>
    items.find((item) => item.id === id),
  ).filter(Boolean) as CampaignCartItem[];
  const bundleCount = Math.min(...bundleItems.map((item) => item.quantity));
  const normalBundleGross = bundleItems.reduce((sum, item) => {
    const vatRate = item.vatRate ?? BOOK_VAT_RATE;
    return sum + item.price * (1 + vatRate) * bundleCount;
  }, 0);
  const campaignGross = MOTHERS_DAY_BUNDLE_GROSS_PRICE * bundleCount;

  return Math.max(0, Math.round(normalBundleGross - campaignGross));
}
