"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Book, Microscope, Moon, Shield, Star, Zap } from "lucide-react";;
interface HeroSectionProps {
  onQuizStart: () => void;
}

export default function HeroSection({ onQuizStart }: HeroSectionProps) {
  const benefits = [
    { icon: "🧬", text: "Vetenskapligt baserat" },
    { icon: "💪", text: "Ökad energi" },
    { icon: "🛡️", text: "Stärkt immunförsvar" },
    { icon: "🧠", text: "Bättre fokus" },
    { icon: "😊", text: "Förbättrat humör" },
    { icon: "💤", text: "Bättre sömn" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 md:-top-40 -right-20 md:-right-40 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 md:-bottom-40 -left-20 md:-left-40 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full"
            initial={{
              x: Math.random() * 1000,
              y: Math.random() * 1000,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6 leading-tight">
              UPPTÄCK KRAFTEN I
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-bold">
                FUNCTIONAL FOODS
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 md:mb-8 leading-relaxed">
              Mat som medicin för kropp och själ
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onQuizStart}
                className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-6 md:px-8 py-4 md:py-5 rounded-full font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                                    Starta Hälsotest
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <Link
                href="/utbildning"
                className="bg-white border-2 border-gray-200 text-gray-700 px-6 md:px-8 py-4 md:py-5 rounded-full font-semibold text-base md:text-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
              >
                <Book className="w-4 h-4 md:w-5 md:h-5" />
                Våra kurser
              </Link>
            </div>

            {/* Benefits list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-gray-700 justify-center lg:justify-start bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm"
                >
                  <span className="text-xl md:text-2xl">{benefit.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content - Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/ulrika.png"
                  alt="Ulrika Davidsson"
                  width={600}
                  height={700}
                  className="rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl w-full h-auto"
                  priority
                />
              </motion.div>
              
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 max-w-[280px] md:max-w-xs"
              >
                <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-xl">
                    UD
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm md:text-base">Ulrika Davidsson</p>
                    <p className="text-xs md:text-sm text-gray-600">"Bästa kursen jag har gått - Lisa J"</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-gray-400/60 rounded-full flex justify-center">
          <div className="w-0.5 h-2 md:w-1 md:h-3 bg-gray-400/60 rounded-full mt-1.5 md:mt-2" />
        </div>
      </motion.div>
    </section>
  );
} 