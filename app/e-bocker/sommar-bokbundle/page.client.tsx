"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChefHat,
  Leaf,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { trackAddToCart, trackViewContent } from "@/app/lib/analytics";
import {
  SUMMER_EBOOK_BUNDLE_GROSS_PRICE,
  SUMMER_EBOOK_PRODUCTS,
  storeSummerEbookCampaignSource,
} from "@/app/lib/campaigns/summer-ebooks";

const DEFAULT_CONTENT = {
  title: "Sommarkampanj",
  subtitle: "Köp 3 E-böcker för endast 250 kr – få en bok gratis!",
  description:
    "Fyll sommaren med god mat, smarta recept och massor av inspiration. Under en begränsad tid får du tre av våra mest populära e-böcker inom Functional Foods till ett extra förmånligt pris.",
  shortDescription:
    "Välj bland recept för grillkvällar, somriga måltider, hälsosamma bakverk och naturligt söta godsaker – allt samlat i digitala e-böcker som du kan ladda ner och börja använda direkt. Erbjudandet gäller E-böckerna Grill- & Sommarmat, Söta Godsaker och Baka Glutenfritt.",
  image: "/sommar-bokbundle-omslag.png",
  price: "250 kr",
  features: [
    "Hitta nya favoritrecept inför sommaren",
    "Laga näringsrik mat med naturliga råvaror",
    "Inspireras till hälsosammare bakning och fika",
    "Ha recepten alltid tillgängliga i mobilen, surfplattan eller datorn",
  ],
  authorSection:
    "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker. Hennes online-kurser har hjälpt tiotusentals personer att finna en mer hållbar och hälsosam livsstil.",
};

interface PageContent {
  title?: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  price?: string;
  features?: string[];
  authorSection?: string;
}

export default function SommarBokbundlePageClient() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent>(DEFAULT_CONTENT);
  const { addItem } = useCart();
  const router = useRouter();

  const content = { ...DEFAULT_CONTENT, ...pageContent };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/pages/sommar-bokbundle");
        if (response.ok) {
          const data = await response.json();
          if (data.content) setPageContent(data.content);
        }
      } catch (error) {
        console.error("Failed to fetch page content:", error);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    try {
      trackViewContent(
        {
          id: "sommar-bokbundle",
          name: "Sommarerbjudande – E-böcker av Ulrika Davidsson",
          price: SUMMER_EBOOK_BUNDLE_GROSS_PRICE / 1.06,
        },
        "SEK",
      );
    } catch {}
  }, []);

  const handleAddToCart = async () => {
    setIsAdding(true);

    storeSummerEbookCampaignSource("product-page");
    SUMMER_EBOOK_PRODUCTS.forEach((product) => addItem(product));

    try {
      SUMMER_EBOOK_PRODUCTS.forEach((product) => {
        trackAddToCart(
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
          "SEK",
        );
      });
    } catch {}

    setAdded(true);

    setTimeout(() => {
      setIsAdding(false);
      router.push("/cart");
    }, 800);
  };

  const featureIcons = [ChefHat, BookOpen, Leaf, Sparkles, ChefHat, BookOpen];
  const features = (content.features || DEFAULT_CONTENT.features).map(
    (text, index) => ({
      icon: featureIcons[index % featureIcons.length],
      text,
    }),
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a1f14] via-[#102a1c] to-[#0a1f14] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#93C560]/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-lime-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-teal-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#93C560]/15 rounded-full border border-[#93C560]/30 mb-4">
            <BookOpen className="w-4 h-4 text-[#93C560]" />
            <span className="text-[#cfe8b0] text-sm font-medium">
              Sommarerbjudande
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center lg:justify-end order-1 lg:order-1"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#93C560]/20 via-emerald-400/15 to-lime-300/15 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div
                  className={`transition-all duration-700 ${
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                >
                  <Image
                    src={content.image || DEFAULT_CONTENT.image}
                    alt={`${content.title} – ${content.subtitle}`}
                    width={400}
                    height={500}
                    className="rounded-2xl shadow-2xl shadow-black/50 transition-transform duration-500 group-hover:scale-[1.02]"
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                </div>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse w-[400px] h-[500px]" />
                )}
                <div className="absolute -top-4 -right-4 bg-[#FF7E70] text-[#FFFFFF] px-4 py-2 rounded-full font-bold text-lg shadow-lg transform rotate-12">
                  {content.price}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-2 lg:order-2 space-y-6"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {content.title}
              <span className="block text-[#93C560] mt-2">
                {content.subtitle}
              </span>
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed">
              {content.description}
            </p>

            <p className="text-gray-300 leading-relaxed">
              {content.shortDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                >
                  <feature.icon className="w-5 h-5 text-[#93C560] flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-6 space-y-4">
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-[#FF7E70] text-white hover:bg-[#ff6b5c] shadow-[#FF7E70]/30"
                } disabled:opacity-50`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Tillagd i varukorgen!
                  </>
                ) : isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Lägger till...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Lägg i varukorg
                  </>
                )}
              </motion.button>

              <p className="text-sm text-gray-400">
                Digital leverans direkt efter köp.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
