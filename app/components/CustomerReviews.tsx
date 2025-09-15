'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  image: string;
  text: string;
  rating: number;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Zandra Östlin",
    image: "/Kundcitat/Zandra/Zandra-Ostlin-bild-optimized.webp",
    text: "Min mage har slutat krångla efter att jag började med functional foods. Känner mig piggare och har mer energi genom hela dagen!",
    rating: 5
  },
  {
    id: 2,
    name: "Jennie",
    image: "/Kundcitat/Jennie/Jennie-optimized.webp",
    text: "Något av det lättaste och godaste jag har testat! Recepten är enkla att följa och resultaten märks verkligen.",
    rating: 5
  },
  {
    id: 3,
    name: "Monica",
    image: "/Kundcitat/Monica/Monica-bild-5-optimized.webp",
    text: "Fantastisk kurs! Jag har lärt mig så mycket om hur maten påverkar min hälsa. Rekommenderar verkligen!",
    rating: 5
  },
  {
    id: 4,
    name: "Natalie Salerian",
    image: "/Kundcitat/Natalie /Natalie-optimized.webp",
    text: "Största skillnaden är att jag känner mig mätt och inte alls uppblåst. Functional foods har förändrat mitt sätt att äta!",
    rating: 5
  }
];

export default function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vad våra kunder säger
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tusentals nöjda kunder har redan upptäckt kraften i functional foods
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center p-8 md:p-12"
              >
                {/* Image */}
                <div className="mb-6 md:mb-0 md:mr-12 flex-shrink-0">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-xl">
                    <Image
                      src={reviews[currentIndex].image}
                      alt={reviews[currentIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  {/* Stars */}
                  <div className="flex justify-center md:justify-start mb-4">
                    {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-[#93C560] text-[#93C560]"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="mb-6">
                    <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                      "{reviews[currentIndex].text}"
                    </p>
                  </blockquote>

                  {/* Name */}
                  <cite className="not-italic">
                    <p className="font-semibold text-gray-900 text-lg">
                      {reviews[currentIndex].name}
                    </p>
                    <p className="text-sm text-gray-500">Kurskund</p>
                  </cite>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 text-gray-600 hover:text-primary"
            aria-label="Föregående recension"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 text-gray-600 hover:text-primary"
            aria-label="Nästa recension"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 gap-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Gå till recension ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">4.9/5</p>
            <p className="text-sm text-gray-600">Genomsnittligt betyg</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-300" />
          <div>
            <p className="text-3xl font-bold text-primary">2000+</p>
            <p className="text-sm text-gray-600">Nöjda kunder</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-300" />
          <div>
            <p className="text-3xl font-bold text-primary">98%</p>
            <p className="text-sm text-gray-600">Rekommenderar oss</p>
          </div>
        </div>
      </div>
    </section>
  );
} 