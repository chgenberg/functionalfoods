"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

// Default content (fallback)
const DEFAULT_CONTENT = {
  title: "Påskbuffé",
  subtitle: "E-bok av Ulrika Davidsson",
  description:
    "Fira påsken med smakrika, näringsrika och hälsosamma alternativ! Ulrika har samlat 50 enkla och inspirerande recept som passar perfekt till påskbordet – från frukost och lunch till middag och sötsaker.",
  shortDescription:
    "Upptäck allt från påskiga bröd och pajer till nyttigare sötsaker, sallader och festliga huvudrätter. Perfekt om du vill njuta av påskbordet utan att kompromissa med hälsan.",
  image: "/paskbuffe-omslag.jpg",
  price: "99 kr",
  features: [
    "Smarta tips för påskens utmaningar",
    "50 festliga recept för hela påskbordet",
    "Näringsrika rätter som hela familjen älskar",
    "Snabba, goda och mättande måltider",
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

export default function PaskbokenPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent>(DEFAULT_CONTENT);
  const { addItem } = useCart();
  const router = useRouter();

  // Merge custom content with defaults
  const content = { ...DEFAULT_CONTENT, ...pageContent };

  const ebook = {
    id: "paskbuffe",
    name: "Påskbuffé – E-bok av Ulrika Davidsson",
    price: 93.4, // 99 kr inkl 6% moms = 93.40 kr exkl moms (99 / 1.06)
    quantity: 1,
    type: "book" as const,
    image: content.image || "/paskbuffe-omslag.jpg",
  };

  // Fetch custom page content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/pages/paskbuffe");
        if (response.ok) {
          const data = await response.json();
          if (data.content) setPageContent(data.content);
        }
      } catch (error) {
        // Silently fail - use defaults
        console.error("Failed to fetch page content:", error);
      }
    };
    fetchContent();
  }, []);

  // Track product view (GA/Meta server fallback included)
  useEffect(() => {
    try {
      trackViewContent(
        { id: ebook.id, name: ebook.name, price: ebook.price },
        "SEK",
      );
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = async () => {
    setIsAdding(true);

    addItem(ebook);
    try {
      trackAddToCart(
        { id: ebook.id, name: ebook.name, price: ebook.price, quantity: 1 },
        "SEK",
      );
    } catch {}

    setAdded(true);

    setTimeout(() => {
      setIsAdding(false);
      router.push("/cart");
    }, 800);
  };

  // Feature icons (neutral, non-seasonal)
  const featureIcons = [ChefHat, BookOpen, Leaf, Sparkles, ChefHat, BookOpen];
  const features = (content.features || DEFAULT_CONTENT.features).map(
    (text, index) => ({
      icon: featureIcons[index % featureIcons.length],
      text,
    }),
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a1f14] via-[#102a1c] to-[#0a1f14] relative overflow-hidden">
      {/* Decorative background elements (no snowflakes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#93C560]/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-lime-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-teal-300/10 rounded-full blur-3xl" />

        {/* Subtle floating particles (non-seasonal) */}
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.08, 0.18, 0.08],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#93C560]/15 rounded-full border border-[#93C560]/30 mb-4">
            <BookOpen className="w-4 h-4 text-[#93C560]" />
            <span className="text-[#cfe8b0] text-sm font-medium">Ny E-bok</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Book Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center lg:justify-end order-1 lg:order-1"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#93C560]/20 via-emerald-400/15 to-lime-300/15 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Book image */}
              <div className="relative">
                <div
                  className={`transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                >
                  <Image
                    src={content.image || "/paskbuffe-omslag.jpg"}
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

                {/* Price badge */}
                <div className="absolute -top-4 -right-4 bg-[#FF7E70] text-[#FFFFFF] px-4 py-2 rounded-full font-bold text-lg shadow-lg transform rotate-12">
                  {content.price}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
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

            {/* Features grid */}
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

            {/* CTA Section */}
            <div className="pt-6 space-y-4">
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-[#FF7E70] hover:bg-[#660C21] text-[#F3EFE3]"
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

              <p className="text-gray-300 text-sm">
                E-boken skickas direkt till din e-post efter köp
              </p>
            </div>
          </motion.div>
        </div>

        {/* What's included section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Du får:
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-6 h-6 text-[#93C560]" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                Hälsosamma recept
              </h3>
              <p className="text-gray-300 text-sm">
                Du får näringsrika, mättande och riktigt goda recept - som är
                enkla att laga
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                En komplett e-bok
              </h3>
              <p className="text-gray-300 text-sm">
                Goda recept till påsken – smakrika favoriter att njuta av under
                påskhelgen.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-lime-300/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-lime-200" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                Functional Foods
              </h3>
              <p className="text-gray-300 text-sm">
                Oavsett om det är vardag eller högtid går det att njuta av både
                god och näringsrik mat som får kroppen att må bra.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Author section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-3xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#93C560] to-[#014421] flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Om Ulrika Davidsson
              </h3>
              <p className="text-gray-300">{content.authorSection}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
