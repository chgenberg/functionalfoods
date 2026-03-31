"use client";

import { motion } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import { CheckCircle, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface BookShowcaseSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  href: string;
  buttonText?: string;
  reverse?: boolean;
  productId: string;
  productPrice: string;
  highlights: {
    title: string;
    text: string;
    icon?: React.ElementType;
  }[];
}

export default function BookShowcaseSection({
  title,
  subtitle,
  description,
  image,
  reverse = false,
  productId,
  productPrice,
  highlights,
}: BookShowcaseSectionProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const numericPrice = Number(
      productPrice.replace(" kr", "").replace(",", "."),
    );
    const priceExVat = +(numericPrice / 1.06).toFixed(2);

    addItem({
      id: productId,
      name: `${title} – E-bok av Ulrika Davidsson`,
      price: priceExVat,
      quantity: 1,
      type: "book",
      image,
    });
  };

  return (
    <section className="py-14 md:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-center justify-items-center">
          {/* Left content */}
          <motion.div
            className={`space-y-6 ${reverse ? "md:order-2" : "md:order-1"} max-w-[480px] w-full`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div>
              {subtitle && (
                <h2 className="text-4xl md:text-4xl lg:text-6xl font-light text-gray-800 mb-2">
                  {subtitle}
                </h2>
              )}
              <h2 className="text-4xl md:text-4xl lg:text-6xl font-bold text-primary">
                {title}
              </h2>
              <p className="text-lg md:text-base lg:text-lg text-gray-600 mt-4">
                {description}
              </p>
            </div>

            <div className="space-y-4">
              {highlights.map((item, index) => {
                const Icon = item.icon || CheckCircle;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                className="group relative bg-primary hover:bg-green-700  text-white px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center gap-3 shadow-lg hover:shadow-xl inline-flex"
              >
                <span>{productPrice}kr – Lägg i varukorgen</span>
                <ShoppingCart className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right image */}
          <motion.div
            className={`${reverse ? "lg:order-1" : "lg:order-2"} flex justify-center`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative group w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] xl:w-[520px] xl:h-[520px]">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-red-300/20 to-primary/20 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity" />

              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl transform translate-x-2 translate-y-2" />

                <div className="relative w-full h-full overflow-hidden rounded-3xl bg-white p-1">
                  <div className="relative w-full h-full overflow-hidden rounded-[22px] bg-gradient-to-br from-primary via-green-600 to-primary p-[2px]">
                    <div className="relative w-full h-full overflow-hidden rounded-[20px] bg-white">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                    </div>
                  </div>
                </div>

                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
