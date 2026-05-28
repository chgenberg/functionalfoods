"use client";

import { useEffect } from "react";
import {
  MOTHERS_DAY_CAMPAIGN_ID,
  MOTHERS_DAY_CAMPAIGN_STORAGE_KEY,
} from "@/app/lib/campaigns/mothers-day";

const CAMPAIGN_CART = [
  {
    id: "brodboken-2026",
    name: "Baka Glutenfritt – E-bok av Ulrika Davidsson",
    price: 65.09,
    quantity: 1,
    type: "book",
    image: "/baka-glutenfritt-square.png",
  },
  {
    id: "sota-godsaker",
    name: "Söta Godsaker – E-bok av Ulrika Davidsson",
    price: 102.83,
    quantity: 1,
    type: "book",
    image: "/sota-godsaker-square.png",
  },
] as const;

export default function MothersDayCampaignPage() {
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(CAMPAIGN_CART));
      localStorage.removeItem("cart_coupon");
      sessionStorage.setItem(
        MOTHERS_DAY_CAMPAIGN_STORAGE_KEY,
        JSON.stringify({
          id: MOTHERS_DAY_CAMPAIGN_ID,
          source: "campaign-link",
          createdAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Failed to prepare Mother's Day campaign cart:", error);
    }

    const params = new URLSearchParams(window.location.search);
    params.set("campaign", MOTHERS_DAY_CAMPAIGN_ID);
    window.location.href = `/checkout?${params.toString()}`;
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-[#014421]/20 border-t-[#014421] animate-spin" />
        <h1 className="text-2xl font-semibold text-[#014421]">
          Förbereder ditt mors dag-erbjudande
        </h1>
        <p className="mt-2 text-gray-600">
          Baka Glutenfritt och Söta Godsaker läggs i kassan.
        </p>
      </div>
    </main>
  );
}
