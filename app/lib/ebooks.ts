export const EBOOK_PRODUCTS: Record<
  string,
  {
    id: string;
    name: string;
    priceExVat: number;
    downloadRoute: string;
    pdfPath: string;
    matchers: string[];
  }
> = {
  "brodboken-2026": {
    id: "brodboken-2026",
    name: "Baka Glutenfritt – E-bok",
    priceExVat: 65.09,
    downloadRoute: "/brodboken/ladda-ner",
    pdfPath: "/baka-glutenfritt-ulrika-davidsson.pdf",
    matchers: [
      "brodboken-2026",
      "brodboken",
      "brodbok",
      "baka glutenfritt",
      "glutenfritt",
    ],
  },
  paskbuffe: {
    id: "paskbuffe",
    name: "Påskbuffé – E-bok av Ulrika Davidsson",
    priceExVat: 93.4,
    downloadRoute: "/e-bocker/paskbuffe/ladda-ner",
    pdfPath: "/paskbuffe-ulrika-davidsson.pdf",
    matchers: ["paskbuffe", "påskbuffé", "påskbuffe"],
  },
  "sota-godsaker": {
    id: "sota-godsaker",
    name: "Söta Godsaker – E-bok av Ulrika Davidsson",
    priceExVat: 102.83,
    downloadRoute: "/e-bocker/sota-godsaker/ladda-ner",
    pdfPath: "/sota-godsaker-ulrika-davidsson.pdf",
    matchers: ["sota-godsaker", "sota godsaker", "söta godsaker"],
  },
  "grill-sommarmat": {
    id: "grill-sommarmat",
    name: "Grill- & Sommarmat – E-bok av Ulrika Davidsson",
    priceExVat: 140.57,
    downloadRoute: "/e-bocker/grill-sommarmat/ladda-ner",
    pdfPath: "/grill-sommarmat-ulrika-davidsson.pdf",
    matchers: [
      "grill-sommarmat",
      "grill sommarmat",
      "grill och sommarmat",
      "grill- & sommarmat",
    ],
  },
  "halsosamma-frukostar": {
    id: "halsosamma-frukostar",
    name: "Hälsosamma Frukostar – E-bok av Ulrika Davidsson",
    priceExVat: 93.4,
    downloadRoute: "/e-bocker/halsosamma-frukostar/ladda-ner",
    pdfPath: "/halsosamma-frukostar-ulrika-davidsson.pdf",
    matchers: [
      "halsosamma-frukostar",
      "halsosamma frukostar",
      "hälsosamma frukostar",
    ],
  },
};

export function resolveEbookIdFromValue(value: unknown): string | null {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return null;

  for (const product of Object.values(EBOOK_PRODUCTS)) {
    if (product.matchers.some((matcher) => normalized.includes(matcher))) {
      return product.id;
    }
  }

  return null;
}

export function resolveEbookIdFromItem(item: any): string | null {
  return resolveEbookIdFromValue(
    [
      item?.id,
      item?.courseId,
      item?.name,
      item?.description,
      item?.price?.product?.name,
      item?.price?.product,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function buildEbookDownloadUrl(
  baseUrl: string,
  ebookId: string,
  token: string,
