"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HormoneFreeTest() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("Förbereder varukorgen...");

  useEffect(() => {
    const run = async () => {
      try {
        // 1) Lägg Hormonell Balans i varukorgen (exkl. moms)
        const item = {
          id: "hormonell-balans",
          name: "Hormonell Balans",
          price: 1836, // 2295 inkl. moms
          quantity: 1,
          type: "course" as const,
          image: "/Hormonell_balans/Bilder_v1/KAVRING_MED_FRÖN.JPG",
        };

        const cart = [item];
        localStorage.setItem("cart", JSON.stringify(cart));

        // 2) Validera och lägg 100%-kupongen (TEST123)
        setStatus("Validerar rabattkod...");
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "TEST123", items: cart }),
        });
        if (res.ok) {
          const data = await res.json();
          // Spara i samma format som CartContext för att aktivera rabatten direkt
          const coupon = {
            code: data.code,
            type: data.type,
            amount: data.amount,
            appliesTo: Array.isArray(data.appliesTo) ? data.appliesTo : "all",
          };
          localStorage.setItem("cart_coupon", JSON.stringify(coupon));
        }

        // 3) Skicka till checkout
        setStatus("Skickar till kassan...");
        router.replace("/checkout");
      } catch (e) {
        console.error(e);
        setStatus("Kunde inte förbereda varukorgen. Prova igen.");
      }
    };
    run();
  }, [router]);

  return (
    <main className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-gray-700">{status}</p>
        <p className="text-sm text-gray-500 mt-2">Testlänk för Hormonell Balans (100% rabatt).</p>
      </div>
    </main>
  );
}


