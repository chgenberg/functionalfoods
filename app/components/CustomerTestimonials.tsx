"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  quote: string;
  image: string;
  imageRotation?: number; // Degrees to rotate the image
  imagePosition?: string; // CSS object-position value (e.g., "center top")
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Jennie",
    quote: "Något av det lättaste och godaste jag har testat.",
    image: "/Kundcitat/Jennie/Jennie-optimized.webp",
  },
  {
    id: 2,
    name: "Monica",
    quote: "Det bästa som man kan ge sig själv! Min värk i höfterna har helt försvunnit, jag har kommit igång med träningen och jag har ätit god och färgrik mat.",
    image: "/Kundcitat/Monica/Monica-bild-4-optimized.webp",
    imageRotation: 90, // Rotate 90 degrees clockwise
  },
  {
    id: 3,
    name: "Natalie",
    quote: "Största skillnaden är att jag känner mig mätt och inte alls uppblåst.",
    image: "/Kundcitat/Natalie /Natalie-optimized.webp",
  },
  {
    id: 4,
    name: "Zandra",
    quote: "Min mage har slutat krångla, jag har slutat snarka på nätterna och är väldigt mätt!",
    image: "/Kundcitat/Zandra/Zandra-Ostlin-bild-optimized.webp",
    imagePosition: "center 30%", // Show face better
  },
];

export default function CustomerTestimonials() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[#93C560] font-medium mb-3">
            Kundberättelser
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800">
            Vad våra kunder säger
          </h2>
        </motion.div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-gradient-to-b from-[#F9F7F2] to-white rounded-2xl p-6 transition-all duration-500 hover:shadow-xl hover:shadow-[#93C560]/10 border border-transparent hover:border-[#93C560]/20">
                {/* Quote icon */}
                <div className="absolute -top-3 -left-2 w-8 h-8 bg-[#93C560] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Portrait */}
                <div className="relative mx-auto mb-5">
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Animated ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #93C560 0%, #014421 100%)",
                        padding: "3px",
                      }}
                      animate={{
                        rotate: activeIndex === index ? 360 : 0,
                      }}
                      transition={{
                        duration: 8,
                        repeat: activeIndex === index ? Infinity : 0,
                        ease: "linear",
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-white" />
                    </motion.div>
                    
                    {/* Image container */}
                    <div className="absolute inset-1 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{
                          ...(testimonial.imageRotation && { transform: `rotate(${testimonial.imageRotation}deg) scale(1.2)` }),
                          ...(testimonial.imagePosition && { objectPosition: testimonial.imagePosition }),
                        }}
                        sizes="96px"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-center font-semibold text-gray-800 mb-3 text-lg">
                  {testimonial.name}
                </h3>

                {/* Quote */}
                <p className="text-center text-gray-600 text-sm leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Decorative line */}
                <div className="mt-5 mx-auto w-12 h-0.5 bg-gradient-to-r from-transparent via-[#93C560] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Horizontal scroll with cards */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px] snap-center"
              >
                <div className="bg-gradient-to-b from-[#F9F7F2] to-white rounded-2xl p-5 border border-[#93C560]/10 shadow-sm">
                  {/* Portrait */}
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #93C560 0%, #014421 100%)",
                        padding: "2px",
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-white" />
                    </div>
                    <div className="absolute inset-1 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        style={{
                          ...(testimonial.imageRotation && { transform: `rotate(${testimonial.imageRotation}deg) scale(1.2)` }),
                          ...(testimonial.imagePosition && { objectPosition: testimonial.imagePosition }),
                        }}
                        sizes="80px"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-center font-semibold text-gray-800 mb-2">
                    {testimonial.name}
                  </h3>

                  {/* Quote */}
                  <p className="text-center text-gray-600 text-sm leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-[#93C560]/30"
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

