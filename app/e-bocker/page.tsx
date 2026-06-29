"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Tag, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function EBockerPage() {
  const { addItem } = useCart();

  const ebooks = [
    {
      id: "grill-sommarmat",
      title: "Grill- & Sommarmat",
      description:
        "Ulrika har samlat sina bästa recept för sommarens alla måltider i en inspirerande e-bok fylld med grillfavoriter, fräscha sallader, picknickmat, goda tapasrätter, mocktails och smakrika tillbehör.",
      href: "/e-bocker/grill-sommarmat",
      image: "/grill-sommarmat-samlingssida.png",
      price: "149 kr",
      format: "PDF",
      highlights: [
        "Gör sommarens grillkvällar både enkla och njutbara",
        "En komplett grillguide i e-boksformat",
        "Recept skapade med fokus på balans, näring och njutning",
      ],
    },
    {
      id: "halsosamma-frukostar",
      title: "Hälsosamma Frukostar",
      description:
        "Starta dagen med energi, mättnad och näring. I e-boken Hälsosamma Frukostar har Ulrika samlat sina bästa recept för dig som vill äta goda, balanserade och näringsrika frukostar utan krångel.",
      href: "/e-bocker/halsosamma-frukostar",
      image: "/halsosamma-frukostar-samlingssida.png",
      price: "99 kr",
      format: "PDF",
      highlights: [
        "Ger en mer näringsrik start på dagen",
        "Bidrar till bättre mättnad och stabil energi",
        "Innehåller naturliga och proteinrika råvaror",
      ],
    },
    {
      id: "sota-godsaker",
      title: "Söta Godsaker",
      description:
        "Ulrika har samlat sina mest älskade bakverk i en inspirerande e-bok fylld av sockerfria och glutenfria favoriter. Här får du över 50 recept på allt från kakor och muffins till bullar, pajer och desserter. Alla skapade för att ge maximal smak utan onödigt socker eller gluten.",
      href: "/e-bocker/sota-godsaker",
      image: "/sota-godsaker-samlingssida.png",
      price: "109 kr",
      format: "PDF",
      highlights: [
        "Fria från gluten och vitt socker",
        "Ett bättre näringsmässigt innehåll",
        "Enkla att lyckas med i hemmaköket",
      ],
    },
    {
      id: "brodboken-2026",
      title: "Baka Glutenfritt",
      description:
        "Ulrikas mest omtyckta glutenfria brödrecept samlade i en e-bok. Här får du näringsrika, mättande och riktigt goda recept som är enkla att baka och passar lika bra till frukost som till middag och fest.",
      href: "/brodboken",
      image: "/baka-glutenfritt.png",
      price: "69 kr",
      format: "PDF",
      highlights: [
        "Glutenfria brödrecept",
        "Näringsrika och mättande alternativ",
        "Passar till både vardag och fest",
      ],
    },
    {
      id: "paskbuffe",
      title: "Påskbuffé",
      description:
        "Fira påsken med smakrika, näringsrika och hälsosamma alternativ! Ulrika har samlat 50 enkla och inspirerande recept som passar perfekt till påskbordet – från frukost och lunch till middag och sötsaker.",
      href: "/e-bocker/paskbuffe",
      image: "/paskbuffe-samlingssida.png",
      price: "99 kr",
      format: "PDF",
      highlights: [
        "50 festliga recept för hela påskbordet",
        "Smarta tips för påskens utmaningar",
        "Näringsrika rätter som hela familjen älskar",
      ],
    },
  ];

  const handleBuyNow = (ebook: {
    id: string;
    title: string;
    image: string;
    price: string;
  }) => {
    const numericPrice = Number(
      ebook.price.replace(" kr", "").replace(",", "."),
    );
    const priceExVat = +(numericPrice / 1.06).toFixed(2);

    addItem({
      id: ebook.id,
      name: `${ebook.title} – E-bok av Ulrika Davidsson`,
      price: priceExVat,
      quantity: 1,
      type: "book",
      image: ebook.image,
    });
  };

  return (
    <main className="min-h-screen bg-[#0C281A]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-0">
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Alla E-böcker
          </h1>
          <p className="mt-3 md:mt-4 text-white max-w-2xl mx-auto">
            Här hittar du våra digitala e-böcker med recept, inspiration och
            kunskap inom Functional Foods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 md:h-60 w-full overflow-hidden">
                <Link
                  href={ebook.href}
                  className="absolute inset-0 z-10"
                  aria-label={ebook.title}
                />
                <Image
                  src={ebook.image}
                  alt={ebook.title}
                  fill
                  priority
                  loading="eager"
                  decoding="async"
                  quality={60}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                <div className="absolute left-4 bottom-4 flex items-center gap-3 text-white">
                  <div className="flex items-center gap-2 rounded-full bg-[#004422]/65 backdrop-blur-sm px-3 shadow-md">
                    <BookOpen className="w-4 h-4" />
                    <span>{ebook.format}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#004422]/65 backdrop-blur-sm px-3 shadow-md">
                    <Tag className="w-4 h-4" />
                    <span>{ebook.price}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {ebook.title}
                </h2>

                <ul className="mt-4 space-y-2 text-gray-700 text-sm">
                  {ebook.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 w-4 h-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={ebook.href}
                    className="inline-flex w-auto flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-white transition-colors"
                  >
                    Läs mer
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleBuyNow(ebook)}
                    className="inline-flex w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FF7E70] hover:bg-[#660D22] text-white transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Lägg till
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 md:mt-16 mb-8 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Functional Foods boken
          </h1>
          <p className="mt-3 md:mt-4 text-white max-w-2xl mx-auto">
            I Ulrika Davidssons bok får du lära dig om den smarta maten som ökar
            din energi, boostar ditt immunförsvar, ger en lugnare mage och gör
            att du tappar i vikt.
          </p>
          <div className="mt-6">
            <Link
              href="https://www.functionalfoods.se/boken"
              className="inline-flex w-auto flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FF7E70] hover:bg-[#660D22] text-white transition-colors"
            >
              Läs mer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative h-[160px] sm:h-[220px] md:h-[320px] lg:h-[480px] w-full overflow-hidden">
          <Image
            src="/boken-banner.png"
            alt="Functional Foods boken"
            fill
            priority
            className="object-cover object-[50%_center]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </section>
    </main>
  );
}
