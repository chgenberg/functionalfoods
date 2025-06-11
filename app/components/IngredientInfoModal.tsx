"use client";
import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface IngredientInfoModalProps {
  ingredient: string;
  onClose: () => void;
}

export default function IngredientInfoModal({ ingredient, onClose }: IngredientInfoModalProps) {
  const [info, setInfo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      setLoading(true);
      setError(null);
      setInfo("");
      try {
        const res = await fetch("/api/healthchat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "user", text: `Hur fungerar ${ingredient} enligt Functional Foods-principen? Svara kortfattat och pedagogiskt på svenska.` }
            ]
          })
        });
        const data = await res.json();
        setInfo(data.reply || "Ingen information hittades.");
      } catch (e) {
        setError("Kunde inte hämta information om råvaran.");
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, [ingredient]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-accent transition-colors"
          aria-label="Stäng"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-primary mb-4 uppercase">{ingredient}</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="text-text-secondary">Hämtar information...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="text-text-secondary text-lg leading-relaxed whitespace-pre-line animate-fade-in">
            {info}
          </div>
        )}
      </div>
    </div>
  );
} 