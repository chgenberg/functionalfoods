import React from "react";

// Mappa varje punkt till en kroppsdel
export const dots = [
  { id: "dot-1",  label: "Left brain",           cx: 535.26, cy: 98.89 },
  { id: "dot-2",  label: "Right brain",          cx: 477.14, cy: 99.90 },
  { id: "dot-3",  label: "Left Eye",             cx: 536.59, cy: 143.47 },
  { id: "dot-4",  label: "Right Eye",            cx: 475.92, cy: 145.00 },
  { id: "dot-5",  label: "Right Ear",            cx: 438.86, cy: 157.66 },
  { id: "dot-6",  label: "Left Ear",             cx: 574.96, cy: 159.03 },
  { id: "dot-7",  label: "Nose Bridge",          cx: 506.00, cy: 167.71 },
  { id: "dot-8",  label: "Chin",                 cx: 507.00, cy: 206.26 },
  { id: "dot-9",  label: "Throat",               cx: 506.91, cy: 262.91 },
  { id: "dot-10", label: "Left Collarbone",      cx: 587.04, cy: 294.11 },
  { id: "dot-11", label: "Right Collarbone",     cx: 420.12, cy: 295.39 },
  { id: "dot-12", label: "Right Shoulder Joint", cx: 349.88, cy: 344.61 },
  { id: "dot-13", label: "Left Shoulder Joint",  cx: 664.92, cy: 347.55 },
  { id: "dot-14", label: "Right Lung",           cx: 441.19, cy: 406.81 },
  { id: "dot-15", label: "Left Lung",            cx: 577.15, cy: 408.96 },
  { id: "dot-16", label: "Heart",                cx: 519.00, cy: 427.00 },
  { id: "dot-17", label: "Stomach",              cx: 568.00, cy: 555.74 },
  { id: "dot-18", label: "Right Elbow",          cx: 294.77, cy: 578.34 },
  { id: "dot-19", label: "Left Elbow",           cx: 720.45, cy: 579.60 },
  { id: "dot-20", label: "Small Intestine",      cx: 520.80, cy: 685.77 },
  { id: "dot-21", label: "Large Intestine",      cx: 427.45, cy: 689.08 },
  { id: "dot-22", label: "Reproductive System",  cx: 508.04, cy: 787.02 },
  { id: "dot-23", label: "Right hand",           cx: 243.03, cy: 794.25 },
  { id: "dot-24", label: "Left hand",            cx: 768.44, cy: 797.96 },
  { id: "dot-25", label: "Left Sciatic Nerve",   cx: 623.93, cy: 806.36 },
  { id: "dot-26", label: "Right Sciatic Nerve",  cx: 386.96, cy: 807.02 },
  { id: "dot-27", label: "Right Knee",           cx: 411.45, cy: 1072.83 },
  { id: "dot-28", label: "Left Knee",            cx: 601.55, cy: 1072.92 },
  { id: "dot-29", label: "Left Wrist",           cx: 604.22, cy: 1367.00 },
  { id: "dot-30", label: "Right Wrist",          cx: 407.59, cy: 1368.20 },
  { id: "dot-31", label: "Left Foot",            cx: 628.70, cy: 1449.72 },
  { id: "dot-32", label: "Right Foot",           cx: 381.80, cy: 1451.97 },
];

type BodyMapProps = {
  onSelect: (id: string) => void;
  selected: string | null;
};

export default function BodyMap({ onSelect, selected }: BodyMapProps) {
  return (
    <div
      style={{
        position: "relative",
        width: 300,
        height: 450,
        margin: "0 auto",
      }}
    >
      {/* Siluettbilden */}
      <img
        src="/Silouette.png"
        alt="Body silhouette"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none", // så att prickarna är klickbara
        }}
      />

      {/* Prickarna */}
      <svg
        width="300"
        height="450"
        viewBox="0 0 1024 1536"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      >
        <g id="dots" fill="#FFFFFF">
          {dots.map(dot => (
            <circle
              key={dot.id}
              className={`dot${selected === dot.id ? " active" : ""}`}
              cx={dot.cx}
              cy={dot.cy}
              r={20}
              onClick={() => onSelect(dot.id)}
              style={{
                cursor: "pointer",
                fill: selected === dot.id ? "#f97316" : "#fff",
                filter: selected === dot.id ? "drop-shadow(0 0 7px #f97316)" : "none",
                transition: "all .15s"
              }}
              title={dot.label}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}