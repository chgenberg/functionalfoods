import { generateEbookMetadata } from "@/app/lib/ebook-seo";
import GrillSommarmatPageClient from "./page.client";

export async function generateMetadata() {
  return generateEbookMetadata({
    pageId: "grill-sommarmat",
    url: "/e-bocker/grill-sommarmat",
    fallbackTitle: "Grill- & Sommarmat - E-bok",
    fallbackDescription:
      "Ulrika har samlat sina bästa recept för sommaren i en e-bok fylld med grillfavoriter, fräscha sallader, picknickmat, goda tapasrätter, mocktails och smakrika tillbehör.",
    fallbackImage: "/grill-sommarmat-square.png",
    keywords: [
      "grill sommarmat",
      "grill- och sommarmat",
      "grillmat",
      "sommarmat",
      "e-bok",
      "functional foods",
      "Ulrika Davidsson",
    ],
  });
}

export default function GrillSommarmatPage() {
  return <GrillSommarmatPageClient />;
}
