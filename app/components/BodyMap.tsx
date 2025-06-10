import { useRef, useEffect, useState } from "react";

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

const imageWidth = 720;
const imageHeight = 1080;
const originalCircleSize = 23;
const overlayButtonSize = 28;
const offset = (overlayButtonSize - originalCircleSize) / 2;

const points = [
  { id: "head", label: "Head", x: 360, y: 100 },
  { id: "chest", label: "Chest", x: 360, y: 280 },
  { id: "stomache", label: "Stomache", x: 360, y: 400 },
  { id: "right-arm", label: "Right arm", x: 230, y: 440 },
  { id: "left-arm", label: "Left arm", x: 490, y: 440 },
  { id: "genitals", label: "Genitals", x: 360, y: 520 },
  { id: "right-leg", label: "Right leg", x: 310, y: 830 },
  { id: "left-leg", label: "Left leg", x: 410, y: 830 },
];

interface BodyMapProps {
  onSelect: (dotId: string | null) => void;
  selected: string | null;
}

export default function BodyMap({ onSelect, selected }: BodyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setScale(width / imageWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ width: "100%", padding: "0.5rem 0" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: 320,
          aspectRatio: `${imageWidth} / ${imageHeight}`,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <img
          src="/Body_map.png"
          alt="Kroppskarta"
          width={imageWidth}
          height={imageHeight}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "contain",
          }}
        />
        {points.map((point) => (
          <button
            key={point.id}
            onClick={() => onSelect(point.id)}
            style={{
              position: "absolute",
              left: `${(point.x / imageWidth) * 100}%`,
              top: `${(point.y / imageHeight) * 100}%`,
              width: "24px",
              height: "24px",
              transform: 'translate(-50%, -50%)',
              borderRadius: "50%",
              background: selected === point.id ? "#4B2E19" : "#8B2323",
              border: selected === point.id ? "2px solid #fff" : "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              cursor: "pointer",
              transition: "all 0.2s",
              zIndex: 10,
              padding: 0,
            }}
            aria-label={point.label}
            onMouseEnter={(e) => {
              if (selected !== point.id) {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%)';
            }}
          />
        ))}
      </div>
    </div>
  );
}