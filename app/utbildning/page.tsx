"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock, TrendingUp } from "lucide-react";

export default function UtbildningPage() {
  const courses = [
    {
      id: "basics",
      title: "Functional Basics - Mat för ett glutenfritt liv",
      description:
        "Lär dig att laga god, näringsrik och naturligt glutenfri mat utan att det blir krångligt",
      href: "/utbildning/functional-basics",
      image:
        "/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg",
      duration: "6 veckor",
      level: "Nybörjare",
      highlights: [
        "För dig som reagerar på gluten",
        "Upptäck nya råvaror, smaker och glutenfria alternativ",
        "Kunskap, inspiration, recept och måltidsplaner",
      ],
    },
    {
      id: "flow",
      title: "Functional Gut Health/Flow",
      description:
        "Fördjupning med fokus på maghälsa, antiinflammation och naturligt flöde i vardagen.",
      href: "/utbildning/functional-flow",
      image: "/Kurser_bilder/Functional_Gut Health.jpg",
      duration: "6 veckor",
      level: "Fortsättning",
      highlights: [
        "Maghälsa & mikrobiom",
        "Antiinflammatorisk kost",
        "Vanor som håller över tid",
      ],
    },
    {
      id: "energy",
      title: "Functional Insulin balance/Energy",
      description:
        "För dig som vill stabilisera blodsockret och få jämn energi. Perfekt vid prediabetes eller energidippar.",
      href: "/utbildning/functional-energy",
      image: "/Kurser_bilder/Functional_insulin balance.jpg",
      duration: "6 veckor",
      level: "Alla nivåer",
      highlights: [
        "Stabilt blodsocker",
        "Jämn energi hela dagen",
        "Minska sötsug och trötthet",
      ],
    },
    {
      id: "hormone",
      title: "Hormonell Balans",
      description:
        "För dig som vill få koll på dina hormoner. Kombinera rätt kost och coachning för hormonell balans.",
      href: "/utbildning/hormonell-balans",
      image: "/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif",
      duration: "6 veckor",
      level: "Alla nivåer",
      highlights: [
        "Hormonell balans",
        "Antiinflammatorisk kost",
        "Gruppcoaching",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-0">
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Alla program
          </h1>
          <p className="mt-3 md:mt-4 text-gray-600 max-w-2xl mx-auto">
            Välj det program som passar dig bäst. Oavsett om du vill komma igång
            eller fördjupa dig – här hittar du vägen framåt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              className={`group relative overflow-hidden rounded-2xl border ${course.isFree ? "border-[#014421] ring-2 ring-[#014421]/20" : "border-gray-100"} bg-white shadow-sm hover:shadow-lg transition-shadow`}
            >
              {/* Free badge */}
              {course.isFree && (
                <div className="absolute top-4 right-4 z-20 bg-[#014421] text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
                  GRATIS!
                </div>
              )}
              <div className="relative h-48 md:h-60 w-full overflow-hidden">
                {/* Make image clickable to course page */}
                <Link
                  href={course.href}
                  className="absolute inset-0 z-10"
                  aria-label={course.title}
                />
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  priority
                  loading="eager"
                  decoding="async"
                  quality={60}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  unoptimized={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-4 flex items-center gap-3 text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {course.title}
                </h2>
                <p className="mt-2 text-gray-600">{course.description}</p>

                <ul className="mt-4 space-y-2 text-gray-700 text-sm">
                  {course.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 w-4 h-4 text-primary" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  <Link
                    href={course.href}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${course.isFree ? "bg-[#014421] hover:bg-[#116530]" : "bg-primary hover:bg-secondary"} text-white transition-colors`}
                  >
                    {course.isFree ? "Starta gratis" : "Läs mer"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 md:mt-16 mb-8 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Fler program av Ulrika
          </h1>
          <p className="mt-3 md:mt-4 text-gray-900 max-w-2xl mx-auto">
            Kurser med inspirerande recept fyllda med matglädje och praktiska
            verktyg för att nå just dina personliga hälsomål.
          </p>
          <div className="mt-6">
            <Link
              href="https://ulrikadavidsson.se/ga-ner-i-vikt/kursutbud/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-auto flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FF7E70] hover:bg-[#660D22] text-white transition-colors"
            >
              Se kursutbudet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative h-[160px] sm:h-[220px] md:h-[320px] lg:h-[480px] w-full overflow-hidden">
          <Image
            src="/fler-kurser-banner.png"
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
