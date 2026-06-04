"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import {
  ArrowLeft,
  Book,
  Check,
  Clock,
  CreditCard,
  Gift,
  Lightbulb,
  Minus,
  Plus,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { trackAddToCart, trackViewContent } from "@/app/lib/analytics";

const courseImages: Record<string, string> = {
  "functional-flow": "/Kurser_bilder/Functional_Gut Health.jpg",
  "functional-basics":
    "/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg",
  "functional-energy": "/Kurser_bilder/Functional_insulin balance.jpg",
};

const getItemImage = (item: {
  id: string;
  name: string;
  image?: string;
  productType?: "course" | "book";
}): string => {
  if (item.id === "brodboken-2026") return "/baka-glutenfritt-square.png";
  if (item.id === "paskbuffe") return "/paskbuffe-square.jpg";
  if (item.id === "sota-godsaker") return "/sota-godsaker-square.png";
  if (item.id === "grill-sommarmat") return "/grill-sommarmat-square.png";

  if (item.image) return item.image;
  if (courseImages[item.id]) return courseImages[item.id];
  return "/images/blog-placeholder.jpg";
};

const UPSELL_BOOK = {
  id: "grill-sommarmat",
  name: "Grill- & Sommarmat – E-bok",
  price: 140.57,
  type: "book" as const,
  image: "/grill-sommarmat-square.png",
  description: "+90 recept för vardag, fest och grillkvällar",
};

export default function CartPage() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    isLoaded,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [addingUpsell, setAddingUpsell] = useState(false);
  const [upsellAdded, setUpsellAdded] = useState(false);

  const activeUpsellBook = UPSELL_BOOK;
  const hasUpsellBook = items.some((item) => item.id === activeUpsellBook.id);
  const hasOtherCourseOrBookInCart = items.some(
    (item) =>
      (item.type === "course" || item.type === "book") &&
      item.id !== activeUpsellBook.id,
  );
  const showUpsell = !hasUpsellBook && hasOtherCourseOrBookInCart;

  useEffect(() => {
    if (!isLoaded || items.length === 0) return;

    try {
      items.forEach((item) => {
        const viewKey = `ff_ga_view_${item.id}`;
        const addKey = `ff_ga_add_${item.id}`;
        const hasView =
          typeof window !== "undefined"
            ? sessionStorage.getItem(viewKey)
            : null;
        const hasAdd =
          typeof window !== "undefined"
            ? sessionStorage.getItem(addKey)
            : null;

        if (!hasView) {
          trackViewContent(
            { id: item.id, name: item.name, price: item.price },
            "SEK",
          );
          if (typeof window !== "undefined") {
            sessionStorage.setItem(viewKey, "1");
          }
        }

        if (!hasAdd) {
          trackAddToCart(
            {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            },
            "SEK",
          );
          if (typeof window !== "undefined") {
            sessionStorage.setItem(addKey, "1");
          }
        }
      });
    } catch {
      // no-op if sessionStorage unavailable
    }
  }, [isLoaded, items]);

  const handleRemove = async (id: string) => {
    setRemovingItem(id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    removeItem(id);
    setRemovingItem(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    setApplying(true);
    setCouponError(null);

    const res = await applyCoupon(couponInput.trim());

    if (!res.success) {
      setCouponError(res.message || "Ogiltig rabattkod");
    } else {
      setCouponInput("");
    }

    setApplying(false);
  };

  const handleAddUpsell = () => {
    if (!isLoaded || hasUpsellBook) return;

    setAddingUpsell(true);

    try {
      addItem({
        id: activeUpsellBook.id,
        name: activeUpsellBook.name,
        price: activeUpsellBook.price,
        type: activeUpsellBook.type,
        image: activeUpsellBook.image,
        quantity: 1,
      });

      try {
        trackAddToCart(
          {
            id: activeUpsellBook.id,
            name: activeUpsellBook.name,
            price: activeUpsellBook.price,
            quantity: 1,
          },
          "SEK",
        );
      } catch {}

      setUpsellAdded(true);

      setTimeout(() => {
        setUpsellAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding upsell item to cart:", error);
    } finally {
      setAddingUpsell(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]" />
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="text-7xl mb-6">🛒</div>
              <h2 className="text-3xl font-bold text-[#014421] mb-4">
                Din varukorg är tom
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Upptäck våra kurser och börja din resa mot bättre hälsa
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/utbildning"
                  className="inline-flex items-center px-6 py-3 bg-[#014421] text-white font-medium rounded-lg hover:bg-[#116530] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Book className="w-5 h-5 inline mr-2" />
                  Utforska kurser
                </Link>
                <Link
                  href="/kunskapsbank"
                  className="inline-flex items-center px-6 py-3 bg-white text-[#014421] font-medium rounded-lg border-2 border-[#93C560] hover:bg-[#93C560]/10 transition-all duration-200"
                >
                  <Lightbulb className="w-5 h-5 inline mr-2" />
                  Kunskapsbank
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] pb-28 lg:pb-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/utbildning"
            className="inline-flex items-center text-sm sm:text-base text-gray-600 hover:text-[#014421] transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Tillbaka till kurser
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#014421]">
            Din varukorg
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            {items.length} {items.length === 1 ? "vara" : "varor"} i varukorgen
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-sm p-4 sm:p-6 transition-all duration-300 border border-gray-100 hover:border-[#93C560] hover:shadow-md ${
                  removingItem === item.id ? "opacity-50 scale-95" : ""
                }`}
              >
                <div className="flex gap-3 sm:hidden">
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={getItemImage(item)}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base font-semibold text-[#014421] leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        disabled={removingItem === item.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      {item.type === "course" ? (
                        <>
                          <span>🎓</span> Online-kurs
                        </>
                      ) : (
                        <>
                          <Book className="w-3 h-3" /> Digital bok
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 sm:hidden">
                  <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 font-medium min-w-[40px] text-center bg-white text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-white transition-colors rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-[#014421]">
                      {Math.round(
                        item.price *
                          item.quantity *
                          (item.type === "book" ? 1.06 : 1.25),
                      ).toLocaleString("sv-SE")}{" "}
                      kr
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-start gap-4">
                  <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={getItemImage(item)}
                      alt={item.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#014421] mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 flex items-center gap-1.5">
                          {item.type === "course" ? (
                            <>
                              <span>🎓</span> Online-kurs
                            </>
                          ) : (
                            <>
                              <Book className="w-4 h-4" /> Digital bok
                            </>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={removingItem === item.id}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-medium min-w-[50px] text-center bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-white transition-colors rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#014421]">
                          {Math.round(
                            item.price *
                              item.quantity *
                              (item.type === "book" ? 1.06 : 1.25),
                          ).toLocaleString("sv-SE")}{" "}
                          kr
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-gray-500">
                            {Math.round(
                              item.price * (item.type === "book" ? 1.06 : 1.25),
                            ).toLocaleString("sv-SE")}{" "}
                            kr/st (inkl. moms)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {showUpsell && (
              <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-5 border border-[#93C560] transition-all duration-300">
                <div className="flex gap-3 sm:gap-5">
                  <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={activeUpsellBook.image}
                      alt={activeUpsellBook.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#93C560]/15 text-[#014421] text-[11px] sm:text-xs font-semibold mb-2">
                      <Sparkles className="w-3 h-3" />
                      Rekommenderat tillägg
                    </div>

                    <h3 className="text-sm sm:text-lg font-semibold text-[#014421] leading-snug mb-1">
                      Lägg till {activeUpsellBook.name.replace(" – E-bok", "")}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 leading-snug mb-2 line-clamp-2 sm:line-clamp-none">
                      {activeUpsellBook.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] sm:text-sm text-gray-500 mb-2 sm:mb-3">
                      <Book className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>E-boken levereras direkt</span>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg sm:text-2xl font-bold text-[#014421] leading-none">
                          {Math.round(
                            activeUpsellBook.price * 1.06,
                          ).toLocaleString("sv-SE")}{" "}
                          kr
                        </div>
                        <div className="text-[11px] sm:text-sm text-gray-500 mt-1">
                          inkl. 6% moms
                        </div>
                      </div>

                      <button
                        onClick={handleAddUpsell}
                        disabled={addingUpsell || hasUpsellBook}
                        className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          upsellAdded
                            ? "bg-[#93C560] text-[#014421]"
                            : "bg-[#FF7e70] text-white hover:bg-[#e56b5e]"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {addingUpsell ? (
                          <>
                            <span className="inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            <span className="hidden sm:inline">
                              Lägger till...
                            </span>
                          </>
                        ) : upsellAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Tillagd</span>
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4" />
                            <span>Lägg till</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 sticky top-8 border-2 border-[#93C560]">
              <h2 className="text-lg sm:text-xl font-semibold text-[#014421] mb-4 sm:mb-6">
                Ordersammanfattning
              </h2>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[#93C560]/10 to-[#7ab050]/10 rounded-xl border border-[#93C560]/20">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="p-0.5 sm:p-1 bg-[#93C560] rounded-full flex-shrink-0">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="font-medium">
                    Omedelbar åtkomst efter köp
                  </span>
                </div>

                {items.some((item) => item.type === "course") && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                      <div className="p-0.5 sm:p-1 bg-[#93C560] rounded-full flex-shrink-0">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="font-medium">
                        12 månaders tillgång till allt material
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                      <div className="p-0.5 sm:p-1 bg-[#93C560] rounded-full flex-shrink-0">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="font-medium">
                        Personlig support via community
                      </span>
                    </div>
                  </>
                )}

                {items.some((item) => item.type === "book") &&
                  !items.some((item) => item.type === "course") && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                      <div className="p-0.5 sm:p-1 bg-[#93C560] rounded-full flex-shrink-0">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="font-medium">
                        PDF skickas direkt till din e-post
                      </span>
                    </div>
                  )}
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Rabattkod
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#93C560]/20 border border-[#93C560]">
                    <div className="flex items-center gap-2 text-[#014421] text-xs sm:text-sm">
                      <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        Rabatt: <strong>{appliedCoupon.code}</strong>
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#014421] hover:text-gray-700 flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Ange rabattkod"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applying || !couponInput.trim()}
                      className="px-3 sm:px-4 py-2 bg-[#93C560] text-[#014421] text-sm font-medium rounded-lg hover:bg-[#7ab050] disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {applying ? "..." : "Lägg till"}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600">
                    {couponError}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 border-b border-gray-200">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs sm:text-sm gap-2"
                  >
                    <span className="text-gray-600 truncate">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      {Math.round(
                        item.price *
                          item.quantity *
                          (item.type === "book" ? 1.06 : 1.25),
                      ).toLocaleString("sv-SE")}{" "}
                      kr
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-4 sm:py-6 space-y-2 sm:space-y-3">
                {(() => {
                  const hasBooks = items.some((item) => item.type === "book");
                  const hasCourses = items.some(
                    (item) => item.type === "course",
                  );

                  const subtotalInclVat = items.reduce((sum, item) => {
                    const vatMultiplier = item.type === "book" ? 1.06 : 1.25;
                    return sum + item.price * item.quantity * vatMultiplier;
                  }, 0);

                  const subtotalExVat = items.reduce((sum, item) => {
                    return sum + item.price * item.quantity;
                  }, 0);

                  const totalVat = items.reduce((sum, item) => {
                    const vatRate = item.type === "book" ? 0.06 : 0.25;
                    return sum + item.price * item.quantity * vatRate;
                  }, 0);

                  let discountInclVat = 0;

                  if (appliedCoupon && subtotalInclVat > 0) {
                    const normalizedType = String(
                      appliedCoupon.type || "",
                    ).toUpperCase();
                    const isPercentage =
                      normalizedType === "PERCENTAGE" ||
                      normalizedType === "PERCENT";

                    if (isPercentage) {
                      discountInclVat = Math.round(
                        subtotalInclVat * (appliedCoupon.amount / 100),
                      );
                    } else {
                      const effectiveVatMultiplier =
                        subtotalExVat > 0 ? subtotalInclVat / subtotalExVat : 1;
                      discountInclVat = Math.round(
                        discount * effectiveVatMultiplier,
                      );
                    }

                    if (discountInclVat > subtotalInclVat) {
                      discountInclVat = subtotalInclVat;
                    }
                  }

                  const finalTotalInclVat = Math.max(
                    0,
                    subtotalInclVat - discountInclVat,
                  );
                  const discountRatio =
                    subtotalInclVat > 0 ? discountInclVat / subtotalInclVat : 0;
                  const finalVat = Math.max(0, totalVat * (1 - discountRatio));

                  const vatLabel =
                    hasBooks && hasCourses
                      ? "Moms (6% & 25%)"
                      : hasBooks
                        ? "Moms (6%)"
                        : "Moms (25%)";

                  return (
                    <>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">
                          Delsumma (inkl. moms)
                        </span>
                        <span className="text-gray-900 whitespace-nowrap">
                          {Math.round(subtotalInclVat).toLocaleString("sv-SE")}{" "}
                          kr
                        </span>
                      </div>

                      {discountInclVat > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-[#93C560]">Rabatt</span>
                          <span className="text-[#93C560] whitespace-nowrap">
                            -{discountInclVat.toLocaleString("sv-SE")} kr
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs sm:text-sm pb-3 border-b border-gray-200">
                        <span className="text-gray-600">{vatLabel}</span>
                        <span className="text-gray-900 whitespace-nowrap">
                          {finalVat.toLocaleString("sv-SE", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{" "}
                          kr
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base sm:text-xl font-bold pt-2 sm:pt-3 p-3 sm:p-4 bg-gradient-to-r from-[#93C560]/10 to-[#7ab050]/10 rounded-lg">
                        <span className="text-[#014421]">Totalt</span>
                        <span className="text-[#014421] text-lg sm:text-2xl">
                          {Math.round(finalTotalInclVat).toLocaleString(
                            "sv-SE",
                          )}{" "}
                          kr
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-[#014421] to-[#116530] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:from-[#116530] hover:to-[#014421] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Gå till kassan
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
              </Link>

              <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">
                    {items.some((item) => item.type === "course")
                      ? "Dina kurser väntar på dig!"
                      : "Din e-bok väntar på dig!"}
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3">
                  Säker betalning med
                </p>
                <div className="flex justify-center items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 rounded-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Kort
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 rounded-lg">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Krypterat
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:hidden shadow-lg z-50">
        <div className="max-w-lg mx-auto">
          {(() => {
            const hasBooks = items.some((item) => item.type === "book");
            const hasCourses = items.some((item) => item.type === "course");

            const subtotalInclVat = items.reduce((sum, item) => {
              const vatMultiplier = item.type === "book" ? 1.06 : 1.25;
              return sum + item.price * item.quantity * vatMultiplier;
            }, 0);

            const subtotalExVat = items.reduce((sum, item) => {
              return sum + item.price * item.quantity;
            }, 0);

            let discountInclVat = 0;

            if (appliedCoupon && subtotalInclVat > 0) {
              const normalizedType = String(
                appliedCoupon.type || "",
              ).toUpperCase();
              const isPercentage =
                normalizedType === "PERCENTAGE" || normalizedType === "PERCENT";

              if (isPercentage) {
                discountInclVat = Math.round(
                  subtotalInclVat * (appliedCoupon.amount / 100),
                );
              } else {
                const effectiveVatMultiplier =
                  subtotalExVat > 0 ? subtotalInclVat / subtotalExVat : 1;
                discountInclVat = Math.round(discount * effectiveVatMultiplier);
              }


              if (discountInclVat > subtotalInclVat) {
                discountInclVat = subtotalInclVat;
              }
            }

            const finalTotalInclVat = Math.max(
              0,
              subtotalInclVat - discountInclVat,
            );

            return (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">
                    Totalt ({items.length}{" "}
                    {items.length === 1 ? "vara" : "varor"})
                  </p>
                  <p className="text-lg font-bold text-[#014421]">
                    {Math.round(finalTotalInclVat).toLocaleString("sv-SE")} kr
                  </p>
                </div>
                <Link
                  href="/checkout"
                  className="flex-1 bg-gradient-to-r from-[#014421] to-[#116530] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Shield className="w-4 h-4" />
                  Till kassan
                </Link>
              </div>
            );
          })()}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}
