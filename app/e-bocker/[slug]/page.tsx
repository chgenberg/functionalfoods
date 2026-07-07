import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  generateEbookMetadata,
  getEbookPageContent,
} from "@/app/lib/ebook-seo";
import EbookSlugPageClient from "./page.client";

type Props = {
  params: {
    slug: string;
  };
};

type EbookDefaults = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  shortDescription: string;
  image: string;
  price: string;
  features: string[];
  authorSection: string;
};

const DEFAULT_BY_SLUG: Record<string, EbookDefaults> = {
  brodboken: {
    id: "brodboken-2026",
    title: "Baka Glutenfritt",
    subtitle: "E-bok av Ulrika Davidsson",
    description:
      "Vill du baka bröd som smakar fantastiskt och samtidigt känns lätt i magen? Brödboken samlar Ulrikas bästa brödrecept med fokus på functional foods.",
    shortDescription:
      "I e-boken får du en komplett samling brödrecept och smarta tips som gör det enkelt att lyckas.",
    image: "/baka-glutenfritt-omslag.png",
    price: "69 kr",
    features: [
      "En komplett brödguide med functional foods",
      "Recept för vardagsbröd, frallor & bröd till helgen",
      "Naturligt glutenfria alternativ",
    ],
    authorSection:
      "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker.",
  },
  paskbuffe: {
    id: "paskbuffe",
    title: "Påskbuffé",
    subtitle: "E-bok av Ulrika Davidsson",
    description:
      "Fira påsken med smakrika, näringsrika och hälsosamma alternativ med 50 inspirerande recept för hela påskbordet.",
    shortDescription:
      "Upptäck allt från påskiga bröd och pajer till nyttigare sötsaker, sallader och festliga huvudrätter.",
    image: "/paskbuffe-omslag.jpg",
    price: "99 kr",
    features: [
      "Smarta tips för påskens utmaningar",
      "50 festliga recept för hela påskbordet",
      "Näringsrika rätter som hela familjen älskar",
    ],
    authorSection:
      "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker.",
  },
  "sota-godsaker": {
    id: "sota-godsaker",
    title: "Söta godsaker",
    subtitle: "E-bok av Ulrika Davidsson",
    description:
      "Ulrika har samlat sina mest älskade bakverk i en inspirerande e-bok fylld av sockerfria och glutenfria favoriter.",
    shortDescription:
      "Upptäck över 50 recept på kakor, muffins, bullar, pajer och desserter för både vardag, fika och fest.",
    image: "/sota-godsaker-omslag.png",
    price: "109 kr",
    features: [
      "Enkla att lyckas med i hemmaköket",
      "Ett bättre näringsmässigt innehåll",
      "Fria från gluten och vitt socker",
      "Fungerar för hela familjen ",
    ],
    authorSection:
      "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker.",
  },
  "grill-sommarmat": {
    id: "grill-sommarmat",
    title: "Grill- & Sommarmat",
    subtitle: "E-bok av Ulrika Davidsson",
    description:
      "Ulrika har samlat sina bästa recept för sommaren i en e-bok fylld med grillfavoriter, fräscha sallader, picknickmat, goda tapasrätter, mocktails och smakrika tillbehör.",
    shortDescription:
      "Sommarrätter där färska råvaror, grönsaker och proteinrika alternativ står i fokus.",
    image: "/grill-sommarmat-omslag.png",
    price: "149 kr",
    features: [
      "+90 enkla recept",
      "Ingen grill krävs–alla recept går att anpassa och laga på flera sätt",
      "Passar både vardag, fest och grillkvällar",
      "Näringsrika rätter som fungera för hela familjen och alla typer av gäster",
    ],
    authorSection:
      "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker.",
  },
  "sommar-bokbundle": {
    id: "sommar-bokbundle",
    title: "Sommarkampanj",
    subtitle: "Köp 3 e-böcker för endast 250 kr",
    description:
      "Fyll sommaren med god mat, smarta recept och massor av inspiration. Under en begränsad tid får du tre av våra mest populära e-böcker inom Functional Foods till ett extra förmånligt pris.",
    shortDescription:
      "Erbjudandet gäller Grill- & Sommarmat, Söta Godsaker och Baka Glutenfritt. Allt levereras digitalt så du kan börja använda recepten direkt.",
    image: "/sommar-bokbundle-square.png",
    price: "250 kr",
    features: [
      "Grill- & Sommarmat – fräscha recept för grillen, buffén och sommaren",
      "Söta Godsaker – nyttigare bakverk, desserter och fika utan onödigt socker",
      "Baka Glutenfritt – recept för vardagsbröd, frallor & bröd till helgen",
    ],
    authorSection:
      "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker.",
  },
};

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFallback(slug: string): EbookDefaults {
  return (
    DEFAULT_BY_SLUG[slug] || {
      id: slug,
      title: humanizeSlug(slug),
      subtitle: "E-bok av Ulrika Davidsson",
      description:
        "En e-bok med recept och inspiration inom Functional Foods för en enklare och hälsosammare vardag.",
      shortDescription:
        "Utforska praktiska recept, tips och vägledning i digitalt format.",
      image: "/boken-banner.png",
      price: "99 kr",
      features: [
        "Digital e-bok",
        "Praktiska recept",
        "Inspiration för bättre hälsa",
      ],
      authorSection:
        "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker.",
    }
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const fallback = getFallback(slug);
  return generateEbookMetadata({
    pageId: slug,
    url: `/e-bocker/${slug}`,
    fallbackTitle: `${fallback.title} - E-bok`,
    fallbackDescription: fallback.description,
    fallbackImage: fallback.image,
    keywords: [slug, "e-bok", "functional foods", "Ulrika Davidsson"],
  });
}

export default async function EbookSlugPage({ params }: Props) {
  const slug = params.slug;
  const fallback = getFallback(slug);
  const content = await getEbookPageContent(slug);

  // Unknown slug with no configured content should 404.
  if (!content && !DEFAULT_BY_SLUG[slug]) {
    notFound();
  }

  return <EbookSlugPageClient slug={slug} fallback={fallback} />;
}
