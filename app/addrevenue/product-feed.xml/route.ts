import { prisma } from "@/app/lib/database";
import { EBOOK_PRODUCTS } from "@/app/lib/ebooks";
import { getCourseDisplayPricing } from "@/app/lib/course-pricing";
import { SUMMER_EBOOK_BUNDLE_GROSS_PRICE } from "@/app/lib/campaigns/summer-ebooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BRAND = "Functional Foods";
const CURRENCY = "SEK";
const COURSE_VAT_RATE = 0.25;
const BOOK_VAT_RATE = 0.06;

type FeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  price: number;
  productType: string;
};

const COURSE_CONFIG: Record<
  string,
  {
    slug: string;
    image: string;
    fallbackDescription: string;
  }
> = {
  "Functional Basics": {
    slug: "functional-basics",
    image: "/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg",
    fallbackDescription:
      "Digital kurs i grunderna for functional foods, med maltidsplaner, recept och kunskap for en hallbar halsosam livsstil.",
  },
  "Functional Flow": {
    slug: "functional-flow",
    image: "/Kurser_bilder/Functional_Gut Health.jpg",
    fallbackDescription:
      "Digital kurs med fokus pa mage, hormoner och amnesomsattning genom functional foods, recept och veckoupplagg.",
  },
  "Functional Energy": {
    slug: "functional-energy",
    image: "/Kurser_bilder/Functional_insulin balance.jpg",
    fallbackDescription:
      "Digital kurs for mer energi, stabilare blodsocker och smartare vardagsrutiner med functional foods.",
  },
  "Hormonell Balans": {
    slug: "hormonell-balans",
    image: "/Hormonell_balans/hormonell_balans_kurssida.png",
    fallbackDescription:
      "Digital kurs med fokus pa hormonell balans, halsa och livsstil genom mat, recept och kunskap.",
  },
};

const EBOOK_CONFIG: Record<
  string,
  {
    slug: string;
    image: string;
    description: string;
  }
> = {
  "brodboken-2026": {
    slug: "brodboken",
    image: "/baka-glutenfritt-square.png",
    description:
      "Digital e-bok med glutenfria recept och inspiration for halsosam bakning.",
  },
  paskbuffe: {
    slug: "e-bocker/paskbuffe",
    image: "/paskbuffe-square.jpg",
    description:
      "Digital e-bok med recept och inspiration for en halsosam paskbuffe.",
  },
  "sota-godsaker": {
    slug: "e-bocker/sota-godsaker",
    image: "/sota-godsaker-square.png",
    description:
      "Digital e-bok med naturligt sotade godsaker och halsosammare fika.",
  },
  "grill-sommarmat": {
    slug: "e-bocker/grill-sommarmat",
    image: "/grill-sommarmat-square.png",
    description:
      "Digital e-bok med grillrecept, sommarmat och inspiration for halsosamma maltider.",
  },
  "halsosamma-frukostar": {
    slug: "e-bocker/halsosamma-frukostar",
    image: "/halsosamma-frukostar-square.png",
    description:
      "Digital e-bok med halsosamma frukostar, recept och inspiration for en battre start pa dagen.",
  },
};

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.functionalfoods.se"
  ).replace(/\/$/, "");
}

function absoluteUrl(path: string) {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

function escapeXml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatPrice(value: number) {
  return `${value.toFixed(2)} ${CURRENCY}`;
}

function grossPrice(exVatPrice: number, vatRate: number) {
  return Math.round(exVatPrice * (1 + vatRate) * 100) / 100;
}

function renderItem(item: FeedItem) {
  return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description)}</g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.imageLink)}</g:image_link>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${escapeXml(formatPrice(item.price))}</g:price>
      <g:brand>${escapeXml(BRAND)}</g:brand>
      <g:product_type>${escapeXml(item.productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
}

async function getCourseFeedItems(): Promise<FeedItem[]> {
  const courses = await prisma.courseProduct.findMany({
    where: {
      name: {
        in: Object.keys(COURSE_CONFIG),
      },
    },
    select: {
      name: true,
      description: true,
      price: true,
      basePrice: true,
      salePrice: true,
      saleStartsAt: true,
      saleEndsAt: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return courses.map((course) => {
    const config = COURSE_CONFIG[course.name];
    const pricing = getCourseDisplayPricing(course);

    return {
      id: config.slug,
      title: course.name,
      description: course.description || config.fallbackDescription,
      link: absoluteUrl(`/utbildning/${config.slug}`),
      imageLink: absoluteUrl(config.image),
      price: grossPrice(pricing.price, COURSE_VAT_RATE),
      productType: "Digital kurs",
    };
  });
}

function getEbookFeedItems(): FeedItem[] {
  const ebookItems = Object.values(EBOOK_PRODUCTS).map((product) => {
    const config = EBOOK_CONFIG[product.id];

    return {
      id: product.id,
      title: product.name,
      description: config.description,
      link: absoluteUrl(`/${config.slug}`),
      imageLink: absoluteUrl(config.image),
      price: grossPrice(product.priceExVat, BOOK_VAT_RATE),
      productType: "E-bok",
    };
  });

  return [
    ...ebookItems,
    {
      id: "sommar-bokbundle",
      title: "Sommarkampanj - 3 e-bocker for 250 kr",
      description:
        "Digitalt bokpaket med Grill- & Sommarmat, Sota Godsaker och Baka Glutenfritt till kampanjpris.",
      link: absoluteUrl("/e-bocker/sommar-bokbundle"),
      imageLink: absoluteUrl("/grill-sommarmat-square.png"),
      price: SUMMER_EBOOK_BUNDLE_GROSS_PRICE,
      productType: "E-bokspaket",
    },
  ];
}

export async function GET() {
  const items = [...(await getCourseFeedItems()), ...getEbookFeedItems()];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND)} product feed</title>
    <link>${escapeXml(getSiteUrl())}</link>
    <description>${escapeXml("Product feed for Addrevenue affiliate marketing")}</description>
${items.map(renderItem).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
