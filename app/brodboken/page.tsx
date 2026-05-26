import { generateEbookMetadata } from "@/app/lib/ebook-seo";
import BrodbokenPageClient from "./page.client";

export async function generateMetadata() {
  return generateEbookMetadata({
    pageId: "brodboken",
    url: "/brodboken",
    fallbackTitle: "Baka Glutenfritt - E-bok",
    fallbackDescription:
      "Brödboken med Ulrika Davidssons glutenfria recept för vardag och fest, med fokus på functional foods.",
    fallbackImage: "/baka-glutenfritt-square.png",
    keywords: [
      "brodboken",
      "baka glutenfritt",
      "e-bok",
      "functional foods",
      "Ulrika Davidsson",
    ],
  });
}

export default function BrodbokenPage() {
  return <BrodbokenPageClient />;
}
