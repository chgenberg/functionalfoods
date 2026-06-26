import { generateEbookMetadata } from "@/app/lib/ebook-seo";
import PaskbokenPageClient from "./page.client";

export async function generateMetadata() {
  return generateEbookMetadata({
    pageId: "halsosamma-frukostar",
    url: "/e-bocker/halsosamma-frukostar",
    fallbackTitle: "Hälsosamma Frukostar - E-bok",
    fallbackDescription:
      "I e-boken Hälsosamma Frukostar har Ulrika samlat sina bästa recept för dig som vill äta goda, balanserade och näringsrika frukostar utan krångel.",
    fallbackImage: "/halsosamma-frukostar-square.jpg",
    keywords: [
      "hälsosamma frukostar",
      "frukostrecept",
      "nyttiga frukostar",
      "enkla frukostar",
      "proteinrika frukostar",
      "näringsrika frukostar",
      "e-bok",
      "functional foods",
      "Ulrika Davidsson",
    ],
  });
}

export default function PaskbokenPage() {
  return <PaskbokenPageClient />;
}
