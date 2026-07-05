import { generateEbookMetadata } from "@/app/lib/ebook-seo";
import SommarBokbundlePageClient from "./page.client";

export async function generateMetadata() {
  return generateEbookMetadata({
    pageId: "sommar-bokbundle",
    url: "/e-bocker/sommar-bokbundle",
    fallbackTitle: "Sommarkampanj - Bokbundle",
    fallbackDescription:
      "Fyll sommaren med god mat, smarta recept och massor av inspiration. Under en begränsad tid får du tre av våra mest populära e-böcker inom Functional Foods till ett extra förmånligt pris.",
    fallbackImage: "/sommar-bokbundle-square.png",
    keywords: [
      "sommar bokbundle",
      "sommarerbjudande",
      "sommarkampanj",
      "bokbundle",
      "grill sommarmat",
      "söta godsaker",
      "baka glutenfritt",
      "e-bok",
      "functional foods",
      "Ulrika Davidsson",
    ],
  });
}

export default function SommarBokbundlePage() {
  return <SommarBokbundlePageClient />;
}
