"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Book } from "lucide-react";
import Image from "next/image";

const courses = [
  {
    name: "Functional Basics",
    image: "/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg",
    href: "/utbildning/functional-basics",
    description:
      "Vill du använda maten som ditt främsta verktyg för bättre hälsa och ett längre liv? Kursen ger dig kunskap, recept och måltidsplaner som stärker ditt immunförsvar.",
    mobileDescription:
      "Använd maten som verktyg för bättre hälsa. Kunskap, recept och måltidsplaner som stärker immunförsvaret.",
  },
  {
    name: "Gut Health / Flow",
    image: "/Kurser_bilder/Functional_Gut Health.jpg",
    href: "/utbildning/functional-flow",
    description:
      "Vill du skapa en hållbar vardag där din kropp samarbetar med dig? En 6-veckorskurs med fokus på maghälsa, antiinflammatorisk kost och naturligt flöde.",
    mobileDescription:
      "Skapa hållbar vardag med fokus på maghälsa, antiinflammatorisk kost och naturligt flöde.",
  },
  {
    name: "Insulin Balance / Energy",
    image: "/Kurser_bilder/Functional_insulin balance.jpg",
    href: "/utbildning/functional-energy",
    description:
      "Lär dig stabilisera blodsockret och få jämn energi hela dagen. Perfekt för dig som vill bromsa en utveckling mot typ 2-diabetes.",
    mobileDescription:
      "Stabilisera blodsockret och få jämn energi. Perfekt för dig i riskzonen för typ 2-diabetes.",
  },
  {
    name: "Hormonell Balans",
    image: "/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif",
    href: "/utbildning/hormonell-balans",
    description:
      "För dig som vill få koll på dina hormoner! Med rätt kost och coachning kan symptom vid PMS, förklimakteriet eller klimakteriet minskas.",
    mobileDescription:
      "Få koll på hormonerna! Minska symptom vid PMS, förklimakteriet eller klimakteriet.",
  },
];

export default function HomeCoursesSection() {
  return (
    <section className="py-12 md:py-20 px-4 bg-#F9F7F2">
      <div className="max-w-7xl mx-auto">
        {/* Mobile */}
        <div className="lg:hidden">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#112A12] mb-2">
              ERBJUDANDE: alla våra program för 995kr
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Välj det program som passar dig
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {courses.map((course, index) => (
              <Link key={index} href={course.href} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex h-28 sm:h-32">
                  <div className="relative w-28 sm:w-32 flex-shrink-0">
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 group-hover:text-[#014421] transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">
                      {course.mobileDescription}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#014421]">
                      Läs mer
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/utbildning"
              className="inline-flex items-center gap-2 bg-[#FF7e70] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#ff6b5a] transition-all shadow-lg"
            >
              <Book className="w-4 h-4" />
              Läs mer om programmen
            </Link>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="text-center mb-12">
            <h2 className="text-4xl xl:text-5xl font-bold text-[#ff6b5a] mb-4">
              Just nu får du alla våra program för 995kr
            </h2>
            <p className="text-xl text-gray-600">
              Ordinariepris 1295kr. Erbjudandet gäller hela augusti.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
            {courses.map((course, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 30,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12)",
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  boxShadow: [
                    "0 25px 50px -12px rgba(0, 0, 0, 0.12)",
                    "0 25px 50px -12px rgba(1, 68, 33, 0.12)",
                    "0 25px 50px -12px rgba(0, 0, 0, 0.12)",
                  ],
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 * index,
                  boxShadow: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5 * index,
                  },
                }}
                className="group rounded-2xl"
              >
                <Link href={course.href} className="block h-full">
                  <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl h-full">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={course.image}
                        alt={course.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="25vw"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#014421] transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {course.description}
                      </p>

                      <span className="inline-flex items-center gap-2 bg-[#014421] text-white px-5 py-2.5 rounded-full text-sm font-semibold group-hover:bg-[#013318] transition-all shadow-lg group-hover:shadow-xl">
                        Läs mer
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/utbildning"
              className="inline-flex items-center gap-3 bg-[#FF7e70] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#ff6b5a] transition-all shadow-lg hover:shadow-xl"
            >
              <Book className="w-5 h-5" />
              Läs mer om våra program
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
