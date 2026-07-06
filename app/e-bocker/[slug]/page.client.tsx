"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import {
  ShoppingCart,
  Check,
  BookOpen,
  ChefHat,
  Leaf,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { trackAddToCart, trackViewContent } from "@/app/lib/analytics";
import { SUMMER_EBOOK_PRODUCTS } from "@/app/lib/campaigns/summer-ebooks";

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

type PageContent = Partial<EbookDefaults>;

function parsePriceToExVat(priceText: string): number {
  const num = Number((priceText || "").replace(/[^\d.,]/g, "").replace(",", "."));
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Number((num / 1.06).toFixed(2));
}

export default function EbookSlugPageClient({
  slug,
  fallback,
}: {
  slug: string;
  fallback: EbookDefaults;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent>({});
  const { addItem } = useCart();
  const router = useRouter();

  const content = { ...fallback, ...pageContent };
  const priceExVat = useMemo(
    () => parsePriceToExVat(content.price || fallback.price),
    [content.price, fallback.price],
  );

  const ebook = {
    id: fallback.id || slug,
    name: `${content.title} – ${content.subtitle}`,
    price: priceExVat,
    quantity: 1,
    type: "book" as const,
    image: content.image || fallback.image,
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.content) setPageContent(data.content);
      } catch (error) {
        console.error("Failed to fetch e-book page content:", error);
      }
    };
    fetchContent();
  }, [slug]);

  useEffect(() => {
    try {
      trackViewContent({ id: ebook.id, name: ebook.name, price: ebook.price }, "SEK");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = async () => {
    setIsAdding(true);
    const productsToAdd =
      fallback.id === "sommar-bokbundle" ? SUMMER_EBOOK_PRODUCTS : [ebook];
    productsToAdd.forEach((product) => addItem(product));
    try {
      productsToAdd.forEach((product) => {
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
  const features = (content.features || fallback.features || []).map((text, index) => ({
    icon: featureIcons[index % featureIcons.length],
    text,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a1f14] via-[#102a1c] to-[#0a1f14] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#93C560]/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-lime-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-teal-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#93C560]/15 rounded-full border border-[#93C560]/30 mb-4">
            <BookOpen className="w-4 h-4 text-[#93C560]" />
            <span className="text-[#cfe8b0] text-sm font-medium">Ny E-bok</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex justify-center lg:justify-end order-1 lg:order-1">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#93C560]/20 via-emerald-400/15 to-lime-300/15 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className={`transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                  <Image
                    src={content.image || fallback.image}
                    alt={`${content.title} – ${content.subtitle}`}
                    width={400}
                    height={500}
                    className="rounded-2xl shadow-2xl shadow-black/50 transition-transform duration-500 group-hover:scale-[1.02]"
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                </div>
                {!imageLoaded && <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse w-[400px] h-[500px]" />}
                <div className="absolute -top-4 -right-4 bg-[#FF7E70] text-[#FFFFFF] px-4 py-2 rounded-full font-bold text-lg shadow-lg transform rotate-12">
                  {content.price}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="order-2 lg:order-2 space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {content.title}
              <span className="block text-[#93C560] mt-2">{content.subtitle}</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">{content.description}</p>
            <p className="text-gray-300 leading-relaxed">{content.shortDescription}</p>

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
                  added ? "bg-green-500 text-white" : "bg-[#FF7E70] hover:bg-[#660C21] text-[#F3EFE3]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Tillagd i varukorgen!
                  </>
                ) : isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Lägger till...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Köp E-bok – {content.price}
                  </>
                )}
              </motion.button>
              <p className="text-gray-300 text-sm">E-boken skickas direkt till din e-post efter köp</p>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-16 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#93C560] to-[#014421] flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Om Ulrika Davidsson</h3>
              <p className="text-gray-300">{content.authorSection}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
