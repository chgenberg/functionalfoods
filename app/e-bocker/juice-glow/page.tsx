import { generateEbookMetadata } from "@/app/lib/ebook-seo";
import JuiceGlowPageClient from "./page.client";

export async function generateMetadata() {
  return generateEbookMetadata({
    pageId: "juice-glow",
    url: "/e-bocker/juice-glow",
    fallbackTitle: "Juice & Glow - E-bok",
    fallbackDescription:
      "Ulrika bjuder in till en färgstark juicingvärld i en inspirerande e-bok fylld med goda juicer och smoothies för energi, välmående och en friskare vardag.",
    fallbackImage: "/juice-glow-square.png",
    keywords: [
      "juicing",
      "juicerecept",
      "hälsosamma juicer",
      "juicekur",
      "smoothierecept",
      "hälsosamma smoothies",
      "detox",
      "juice detox",
      "gröna juicer",
      "Functional Foods",
      "e-bok juicing",
      "Ulrika Davidsson",
    ],
  });
}

export default function JuiceGlowPage() {
  return <JuiceGlowPageClient />;
}
