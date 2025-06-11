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
  { id: "head", label: "Huvud", x: 360, y: 100 },
  { id: "chest", label: "Bröst", x: 360, y: 280 },
  { id: "stomache", label: "Mage", x: 360, y: 400 },
  { id: "right-arm", label: "Höger arm", x: 230, y: 440 },
  { id: "left-arm", label: "Vänster arm", x: 490, y: 440 },
  { id: "genitals", label: "Underliv", x: 360, y: 520 },
  { id: "right-leg", label: "Höger ben", x: 310, y: 830 },
  { id: "left-leg", label: "Vänster ben", x: 410, y: 830 },
];

interface BodyMapProps {
  onSelect: (dotId: string | null) => void;
  selected: string | null;
}

export default function BodyMap({ onSelect, selected }: BodyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

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
    <div style={{ width: "100%", padding: "0" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: 320,
          aspectRatio: `${imageWidth} / ${imageHeight}`,
          margin: "0 auto",
          position: "relative",
          background: "transparent",
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
            background: "transparent",
          }}
        />
        {points.map((point) => (
          <div key={point.id}>
            {/* Main button - moved before pulse effect */}
            <button
              onClick={() => onSelect(point.id)}
              onMouseEnter={() => setHoveredPoint(point.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{
                position: "absolute",
                left: `${(point.x / imageWidth) * 100}%`,
                top: `${(point.y / imageHeight) * 100}%`,
                width: selected === point.id ? "24px" : "20px",
                height: selected === point.id ? "24px" : "20px",
                transform: hoveredPoint === point.id && selected !== point.id 
                  ? 'translate(-50%, -50%) scale(1.2)' 
                  : 'translate(-50%, -50%)',
                borderRadius: "50%",
                background: selected === point.id 
                  ? "var(--accent)"
                  : hoveredPoint === point.id 
                    ? "var(--accent)"
                    : "var(--text-light)",
                border: selected === point.id ? "2px solid rgba(255,255,255,0.9)" : "1px solid rgba(255,255,255,0.5)",
                boxShadow: selected === point.id 
                  ? "0 4px 12px rgba(11, 61, 26, 0.4), 0 0 20px rgba(11, 61, 26, 0.3)" 
                  : hoveredPoint === point.id
                    ? "0 3px 10px rgba(11,61,26,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                zIndex: selected === point.id ? 15 : 10,
                padding: 0,
              }}
              aria-label={point.label}
            />
            
            {/* Pulse effect for selected point - moved after button */}
            {selected === point.id && (
              <div
                style={{
                  position: "absolute",
                  left: `${(point.x / imageWidth) * 100}%`,
                  top: `${(point.y / imageHeight) * 100}%`,
                  width: "24px",
                  height: "24px",
                  transform: 'translate(-50%, -50%)',
                  borderRadius: "50%",
                  border: "2px solid rgba(34, 139, 34, 0.6)",
                  animation: "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
                  zIndex: 14,
                  pointerEvents: "none",
                }}
              />
            )}
            
            {/* Hover tooltip */}
            {hoveredPoint === point.id && (
              <div
                style={{
                  position: "absolute",
                  left: `${(point.x / imageWidth) * 100}%`,
                  top: `${(point.y / imageHeight) * 100}%`,
                  transform: 'translate(-50%, -150%)',
                  background: "rgba(0, 0, 0, 0.9)",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  zIndex: 20,
                  pointerEvents: "none",
                  animation: "fade-in 0.2s ease-out",
                }}
              >
                {point.label}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "4px solid rgba(0, 0, 0, 0.9)",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}