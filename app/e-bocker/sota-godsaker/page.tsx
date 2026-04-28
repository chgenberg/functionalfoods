import { generateEbookMetadata } from "@/app/lib/ebook-seo";
import SotaGodsakerPageClient from "./page.client";

export async function generateMetadata() {
  return generateEbookMetadata({
    pageId: "sota-godsaker",
    url: "/e-bocker/sota-godsaker",
    fallbackTitle: "Söta Godsaker - E-bok",
    fallbackDescription:
      "Ulrika har samlat sina mest älskade bakverk i en inspirerande e-bok fylld av sockerfria och glutenfria favoriter.",
    fallbackImage: "/sota-godsaker-square.png",
    keywords: [
      "sota godsaker",
      "söta godsaker",
      "e-bok",
      "functional foods",
      "Ulrika Davidsson",
    ],
  });
}

export default function SotaGodsakerPage() {
  return <SotaGodsakerPageClient />;
}
