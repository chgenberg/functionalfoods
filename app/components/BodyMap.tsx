import { useState, useEffect } from "react";
import Image from "next/image";

// Mappa varje punkt till en kroppsdel
export const dots = [
  {
    id: "head",
    x: 50,
    y: 10,
    label: "Hjärna & Huvud",
    description: "Kognitiv hälsa, stress, sömn"
  },
  {
    id: "throat",
    x: 50,
    y: 20,
    label: "Hals",
    description: "Immunförsvar, luftvägar"
  },
  {
    id: "chest",
    x: 50,
    y: 30,
    label: "Bröst",
    description: "Hjärta, lungor"
  },
  {
    id: "upper-stomach",
    x: 50,
    y: 40,
    label: "Övre mage",
    description: "Matspjälkning, syra"
  },
  {
    id: "lower-stomach",
    x: 50,
    y: 50,
    label: "Nedre mage",
    description: "Tarmhälsa, mikrobiom"
  },
  {
    id: "liver",
    x: 50,
    y: 60,
    label: "Lever",
    description: "Detox, metabolism"
  },
  {
    id: "joint",
    x: 50,
    y: 70,
    label: "Led",
    description: "Inflammation, smärta"
  },
  {
    id: "skin",
    x: 50,
    y: 80,
    label: "Hud",
    description: "Inflammation, allergier"
  }
];

interface BodyMapProps {
  onSelect: (dotId: string | null) => void;
  selected: string | null;
}

export default function BodyMap({ onSelect, selected }: BodyMapProps) {
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-md">
      <Image
        src="/Silouette.png"
        alt="Kroppskarta"
        width={400}
        height={800}
        className="w-full h-auto"
      />
      
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={`absolute w-4 h-4 rounded-full cursor-pointer transition-all duration-300 ${
            selected === dot.id
              ? "bg-[#4B2E19] scale-125"
              : hoveredDot === dot.id
              ? "bg-[#6B3F23] scale-110"
              : "bg-[#4B2E19] hover:bg-[#6B3F23]"
          }`}
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => onSelect(dot.id)}
          onMouseEnter={() => setHoveredDot(dot.id)}
          onMouseLeave={() => setHoveredDot(null)}
        >
          {(selected === dot.id || hoveredDot === dot.id) && (
            <div
              className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 min-w-[200px] z-10"
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="font-semibold text-[#4B2E19]">{dot.label}</div>
              <div className="text-sm text-gray-600">{dot.description}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}