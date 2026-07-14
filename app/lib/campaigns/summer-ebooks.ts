export const SUMMER_EBOOK_CAMPAIGN_ID = "sommar-ebocker-2026";
export const SUMMER_EBOOK_CAMPAIGN_STORAGE_KEY = "ff_campaign_sommar_ebocker_2026";
export const SUMMER_EBOOK_CAMPAIGN_TAG = "Köp – Sommarkampanj E-böcker";
export const SUMMER_EBOOK_BUNDLE_GROSS_PRICE = 250;
export const SUMMER_EBOOK_BUNDLE_IDS = [
  "grill-sommarmat",
  "sota-godsaker",
  "brodboken-2026",
] as const;

const BOOK_VAT_RATE = 0.06;

export type SummerEbookCartItem = {
  id: string;
  name?: string;
  price: number;
  quantity: number;
  type: "course" | "book";
  vatRate?: number;
};

export type SummerEbookCampaignSource =
  | "campaign-link"
  | "cart-upsell"
  | "checkout-upsell"
  | "product-page"
  | "prova-popup";

export function storeSummerEbookCampaignSource(
  source: SummerEbookCampaignSource,
) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      SUMMER_EBOOK_CAMPAIGN_STORAGE_KEY,
      JSON.stringify({
        id: SUMMER_EBOOK_CAMPAIGN_ID,
        source,
        createdAt: new Date().toISOString(),
      }),
    );
  } catch {}
}

export function getStoredSummerEbookCampaignSource():
  | SummerEbookCampaignSource
  | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const stored = sessionStorage.getItem(SUMMER_EBOOK_CAMPAIGN_STORAGE_KEY);
    if (!stored) return undefined;

    const parsed = JSON.parse(stored);
    if (!isSummerEbookCampaignId(parsed?.id)) return undefined;
    return parsed?.source;
  } catch {
    return undefined;
  }
}

export const SUMMER_EBOOK_PRODUCTS = [
  {
    id: "grill-sommarmat",
    name: "Grill- & Sommarmat – E-bok av Ulrika Davidsson",
    price: 140.57,
    quantity: 1,
    type: "book" as const,
    image: "/grill-sommarmat-square.png",
  },
  {
    id: "sota-godsaker",
    name: "Söta Godsaker – E-bok av Ulrika Davidsson",
    price: 102.83,
    quantity: 1,
    type: "book" as const,
    image: "/sota-godsaker-square.png",
  },
  {
    id: "brodboken-2026",
    name: "Baka Glutenfritt – E-bok av Ulrika Davidsson",
    price: 65.09,
    quantity: 1,
    type: "book" as const,
    image: "/baka-glutenfritt-square.png",
  },
];

export const SUMMER_EBOOK_TRIGGER_IDS = [
  ...SUMMER_EBOOK_BUNDLE_IDS,
  "paskbuffe",
  "halsosamma-frukostar",
] as const;

export function isSummerEbookCampaignId(campaignId?: string | null) {
  return campaignId === SUMMER_EBOOK_CAMPAIGN_ID;
}

export function isSummerEbookBundleBook(id: string) {
  return (SUMMER_EBOOK_BUNDLE_IDS as readonly string[]).includes(id);
}

export function isSummerEbookTriggerBook(id: string) {
  return (SUMMER_EBOOK_TRIGGER_IDS as readonly string[]).includes(id);
}

export function hasSummerEbookBundle(items: SummerEbookCartItem[]) {
  return SUMMER_EBOOK_BUNDLE_IDS.every((id) =>
    items.some((item) => item.id === id && item.quantity > 0),
  );
}

export function hasSummerEbookBundleByIdentity(
  items: Array<{
    id?: string | null;
    name?: string | null;
    quantity?: number | null;
  }>,
) {
  const present = new Set<string>();

  for (const item of items) {
    if ((item.quantity ?? 1) <= 0) continue;

    const identity = `${item.id || ""} ${item.name || ""}`.toLowerCase();

    if (
      identity.includes("grill-sommarmat") ||
      identity.includes("grill- & sommarmat") ||
      identity.includes("grill & sommarmat") ||
      identity.includes("grill och sommarmat")
    ) {
      present.add("grill-sommarmat");
    }

    if (
      identity.includes("sota-godsaker") ||
      identity.includes("söta godsaker") ||
      identity.includes("sota godsaker")
    ) {
      present.add("sota-godsaker");
    }

    if (
      identity.includes("brodboken-2026") ||
      identity.includes("baka glutenfritt") ||
      identity.includes("brödboken") ||
      identity.includes("brodboken")
    ) {
      present.add("brodboken-2026");
    }
  }

  return SUMMER_EBOOK_BUNDLE_IDS.every((id) => present.has(id));
}

export function getMissingSummerEbookProducts(items: SummerEbookCartItem[]) {
  const present = new Set(
    items.filter((item) => item.quantity > 0).map((item) => item.id),
  );

  return SUMMER_EBOOK_PRODUCTS.filter((product) => !present.has(product.id));
}

export function applySummerEbookBundlePricing<T extends SummerEbookCartItem>(
  items: T[],
): T[] {
  if (!hasSummerEbookBundle(items)) return items;

  const bundleItems = SUMMER_EBOOK_BUNDLE_IDS.map((id) =>
    items.find((item) => item.id === id),
  ).filter(Boolean) as T[];

  const bundleCount = Math.min(...bundleItems.map((item) => item.quantity));
  if (!Number.isFinite(bundleCount) || bundleCount <= 0) return items;

  const normalBundleGross = bundleItems.reduce((sum, item) => {
    const vatRate = item.vatRate ?? BOOK_VAT_RATE;
    return sum + item.price * (1 + vatRate);
  }, 0);

  if (normalBundleGross <= SUMMER_EBOOK_BUNDLE_GROSS_PRICE) return items;

  return items.map((item) => {
    if (!isSummerEbookBundleBook(item.id)) return item;

    const vatRate = item.vatRate ?? BOOK_VAT_RATE;
    const normalGross = item.price * (1 + vatRate);
    const campaignGrossShare =
      SUMMER_EBOOK_BUNDLE_GROSS_PRICE * (normalGross / normalBundleGross);
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
