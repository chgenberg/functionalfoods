"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  Check, 
  BookOpen, 
  Sparkles, 
  Gift,
  ChefHat,
  Wine,
  Cookie,
  Leaf
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function JulbokPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    addItem({
      id: 'julbok-2025',
      name: 'Julbord – E-bok av Ulrika Davidsson',
      price: 55.66, // 59 kr inkl 6% moms = 55.66 kr exkl moms (59 / 1.06)
      quantity: 1,
      type: 'book',
      image: '/Julbok/Produktbild.png'
    });

    setAdded(true);
    
    setTimeout(() => {
      setIsAdding(false);
      router.push('/cart');
    }, 800);
  };

  const features = [
    { icon: ChefHat, text: 'Ett komplett hälsobaserat julbord' },
    { icon: BookOpen, text: '20+ näringsrika julrecept' },
    { icon: Wine, text: 'Juliga drinkar & tillbehör' },
    { icon: Cookie, text: 'Desserter & julefika' },
    { icon: Leaf, text: 'Naturligt glutenfria & sockerfria recept' },
    { icon: Sparkles, text: 'Functional foods som minskar uppblåsthet' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a1f14] via-[#102a1c] to-[#0a1f14] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-[#93C560]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-red-400/10 rounded-full blur-3xl" />
        
        {/* Snowflake-like decorations */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30 mb-4">
            <Gift className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm font-medium">Ny E-bok 2025</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Book Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center lg:justify-end order-1 lg:order-1"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-[#93C560]/20 to-yellow-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              {/* Book image */}
              <div className="relative">
                <div className={`transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <Image
                    src="/Julbok/Produktbild.png"
                    alt="Julbord – E-bok av Ulrika Davidsson"
                    width={400}
                    height={500}
                    className="rounded-2xl shadow-2xl shadow-black/50 transition-transform duration-500 group-hover:scale-[1.02]"
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                </div>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse w-[400px] h-[500px]" />
                )}
                
                {/* Price badge */}
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg transform rotate-12">
                  59 kr
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-2 lg:order-2 space-y-6"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Julbord
              <span className="block text-[#93C560] mt-2">E-bok av Ulrika Davidsson</span>
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed">
              Vill du uppleva ny god mat i jul? Då är Ulrikas nya jul-e-bok din perfekta guide. 
              Ulrika Davidsson har tagit fram helt nya julrecept som kombinerar klassiska smaker 
              med functional foods – för en jul som både smakar fantastiskt och får dig att 
              måriktigt bra.
            </p>

            <p className="text-gray-400 leading-relaxed">
              I E-boken får du ett komplett, hälsobaserat julbord som hjälper dig att hålla 
              blodsockret jämnt och energin stabil, utan att kompromissa med julkänslan eller 
              njutningen.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                >
                  <feature.icon className="w-5 h-5 text-[#93C560] flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="pt-6 space-y-4">
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                  added 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30 hover:shadow-red-500/50'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Tillagd i varukorgen!
                  </>
                ) : isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Lägger till...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Köp E-bok – 59 kr
                  </>
                )}
              </motion.button>

              <p className="text-gray-500 text-sm">
                E-boken skickas direkt till din e-post efter köp
              </p>
            </div>
          </motion.div>
        </div>

        {/* What's included section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Du får:
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Hälsobaserat julbord</h3>
              <p className="text-gray-400 text-sm">
                Lagat med functional foods som minskar uppblåsthet och energidippar
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-[#93C560]" />
              </div>
              <h3 className="text-white font-semibold mb-2">20+ goda recept</h3>
              <p className="text-gray-400 text-sm">
                Från klassiska julrätter till fika, desserter och juliga drinkar
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Glutenfritt & sockerfritt</h3>
              <p className="text-gray-400 text-sm">
                Många av recepten är naturligt glutenfria och sockerfria
              </p>
            </div>
          </div>
        </motion.div>

        {/* Author section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-3xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#93C560] to-[#014421] flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Om Ulrika Davidsson</h3>
              <p className="text-gray-400">
                Ulrika Davidsson är kostrådgivare, receptkreatör och bästsäljande författare till över 40 böcker. 
                Hennes online-kurser har hjälpt tiotusentals personer att finna en mer hållbar och hälsosam livsstil.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

