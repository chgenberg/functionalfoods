"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, ShoppingCart, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/app/lib/utils";
import { useCart, CartItem } from "@/app/context/CartContext";

const DEFAULT_CONTENT = {
  title: "Brödboken",
  subtitle: "E-bok: baka gott, smart och enkelt",
  description:
    "Brödboken är en praktisk e-bok som hjälper dig lyckas med bröd i vardagen – med tydliga steg, smarta tips och recept som faktiskt blir av.",
  shortDescription:
    "Du får recept, tekniker och genvägar som gör att du kan baka mer hemma – oavsett om du vill ha snabbare bröd, bättre struktur eller mer smak.",
  image: "/brodboken.png",
  price: "199",
  features: ["E-bok (PDF)", "30+ recept", "Steg-för-steg"],
  authorSection:
    "Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker. Hennes online-kurser har hjälpt tiotusentals personer att finna en mer hållbar och hälsosam livsstil.",
  quote: "Bröd behöver inte vara krångligt – det ska vara gott, enkelt och kul."
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
  quote?: string;
  details?: Array<{ label: string; value: string }>;
}

export default function BrodbokenPage() {
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [added, setAdded] = useState(false);

  const content = useMemo(() => ({ ...DEFAULT_CONTENT, ...pageContent }), [pageContent]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/pages/brodboken");
        if (response.ok) {
          const data = await response.json();
          if (data?.content) setPageContent(data.content);
        }
      } catch (error) {
        console.error("Failed to fetch page content:", error);
      }
    };
    fetchContent();
  }, []);

  const handleAddToCart = () => {
    const price = Number.parseInt(content.price || "199", 10);
    const item: CartItem = {
      id: "brodboken",
      name: content.title || "Brödboken",
      price: Number.isFinite(price) ? price : 199,
      quantity: 1, // addItem ignorerar quantity och sätter 1 / +1 i er context, men typmässigt krävs den
      type: "book",
      image: content.image || "/brodboken.png"
    };

    addItem(item);

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fffdf3" }}>
      <div className="container-custom section-padding">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            {content.title}
          </h1>
          <p className="text-lg text-text-secondary">{content.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          <div className="flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative group">
              <div className={`transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}>
                <Image
                  src={content.image || "/brodboken.png"}
                  alt={content.title || "Brödboken"}
                  width={400}
                  height={600}
                  className="rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {!imageLoaded && <div className="absolute inset-0 bg-white/50 rounded-2xl animate-pulse" />}
            </div>
          </div>

          <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col items-center mb-4">
                <p className="text-3xl font-light text-primary numeric">
                  {formatPrice(parseInt(content.price || "199", 10))} kr
                </p>
                <p className="text-sm text-text-secondary mt-1">Moms ingår</p>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary w-full flex items-center justify-center group"
              >
                <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Lägg i varukorg
              </button>

              <div className="mt-3 flex items-center justify-center gap-3">
                {added ? (
                  <span className="inline-flex items-center text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Tillagd i varukorg
                  </span>
                ) : (
                  <Link href="/cart" className="text-sm text-text-secondary hover:underline inline-flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Visa varukorg
                  </Link>
                )}
                <span className="text-text-secondary/40">•</span>
                <Link href="/checkout" className="text-sm text-primary hover:underline">
                  Gå till kassan
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(content.features || DEFAULT_CONTENT.features).slice(0, 3).map((feature, index) => {
                const icons = [Clock, CheckCircle, Clock];
                const Icon = icons[index % icons.length];
                return (
                  <div key={index} className="bg-white rounded-xl p-4 text-center">
                    <Icon className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">{feature}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 text-text-secondary">
              <p className="leading-relaxed">{content.description}</p>
              <p className="leading-relaxed">{content.shortDescription}</p>

              {content.quote && (
                <div className="bg-accent/10 rounded-xl p-4 border-l-4 border-accent">
                  <p className="text-sm italic">"{content.quote}"</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-medium text-primary mb-4">Bokdetaljer</h3>

              {Array.isArray(content.details) && content.details.length > 0 ? (
                <dl className="space-y-3">
                  {content.details.map((row, i) => (
                    <div key={i} className="flex justify-between text-sm gap-6">
                      <dt className="text-text-secondary">{row.label}</dt>
                      <dd className="font-medium text-right">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <dl className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-text-secondary">Format</dt>
                    <dd className="font-medium">PDF (e-bok)</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-text-secondary">Leverans</dt>
                    <dd className="font-medium">Direkt efter köp</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-text-secondary">Enhet</dt>
                    <dd className="font-medium">Mobil, surfplatta & dator</dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-light text-primary mb-4">Om författaren</h2>
            <p className="text-text-secondary leading-relaxed">{content.authorSection}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
