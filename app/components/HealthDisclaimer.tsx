"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Heart,
  Lightbulb,
  Shield,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

interface HealthDisclaimerProps {
  variant?: "banner" | "card" | "inline";
  className?: string;
}

export default function HealthDisclaimer({
  variant = "banner",
  className = "",
}: HealthDisclaimerProps) {
  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6 ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#014421] mb-3 flex items-center gap-2">
              🏥 Viktigt om hälsorådgivning
            </h3>
            <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>
                  Detta program ersätter inte medicinsk rådgivning.
                </strong>{" "}
                Innehållet är utformat för allmän utbildning och ska inte
                användas för att diagnostisera eller behandla hälsoproblem.
              </p>
              <p>
                <strong>Konsultera alltid din läkare</strong> innan du gör
                större förändringar i din kost eller livsstil, särskilt om du
                har befintliga hälsoproblem eller tar mediciner.
              </p>
              <p className="text-blue-600">
                <strong>
                  <Lightbulb className="w-5 h-5 inline" /> Individuella resultat
                  kan variera
                </strong>{" "}
                - vi kan inte garantera specifika hälsoeffekter.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5 text-red-500" />
          <h4 className="font-semibold text-[#014421]">🏥 Hälsoinformation</h4>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Detta kursmaterial ersätter inte professionell medicinsk rådgivning.
          Konsultera din läkare vid hälsofrågor.{" "}
          <Link
            href="/anvandarvillkor"
            className="text-[#014421] hover:underline"
          >
            Läs våra villkor
          </Link>
        </p>
      </div>
    );
  }

  // Inline variant
  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-amber-500" />
      <span>
        🏥 Ersätter inte medicinsk rådgivning •{" "}
        <Link
          href="/anvandarvillkor"
          className="text-[#014421] hover:underline"
        >
          Läs villkor
        </Link>
      </span>
    </div>
  );
}
