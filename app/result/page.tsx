"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AIChatBox from "../components/AIChatBox";
import MicronutrientQuestionModal from "../components/MicronutrientQuestionModal";

// Färg för siluetten och chattbubblor
const bubbleColor = "#f3f4f6"; // Samma som siluetten/landningssidan
const bubbleAltColor = "#e5e7eb"; // Ljusgrå för varannan bubbla

// Lista på blockar i ordning och deras rubriker
const blocks = [
  { key: "riskProfile", title: "Your Risk Profile" },
  { key: "micronutrients", title: "Micronutrient Analysis" },
  { key: "redFlags", title: "Acute Red Flags – Seek Care Now" },
  { key: "scenarios", title: "Most Likely Scenarios" },
  { key: "holisticAdvices", title: "Holistic Health Advices" },
  { key: "timeline", title: "Recommended Timeline" },
  { key: "symptomTracker", title: "Symptom Tracker" },
  { key: "localExperts", title: "Local Experts / Clinics" },
  { key: "aiChatIntro", title: "Ask the Dietitian (AI Chat)" },
  { key: "references", title: "Scientific References" },
  { key: "pdfLink", title: "Download Your Report as PDF" },
];

const riskProfileLabels = {
  inflammation: "Inflammation",
  nutrient: "Nutrient",
  allergy: "Allergy",
  dysbiosis: "Dysbiosis",
  hormonal: "Hormonal Imbalance",
  metabolic: "Metabolic Health",
  gut: "Gut Health",
  immune: "Immune Function",
  gutBarrier: "Gut Barrier Integrity",
  oxidativeStress: "Oxidative Stress",
  detoxification: "Detoxification Capacity",
  cardiovascular: "Cardiovascular Risk",
  mental: "Mental Wellbeing",
  hydration: "Hydration",
  activity: "Physical Activity"
};

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [showMicronutrientPopup, setShowMicronutrientPopup] = useState(false);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) setResult(JSON.parse(decodeURIComponent(data)));
  }, [searchParams]);

  if (!result) return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#071625] flex flex-col items-center py-12">
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-widest text-white" style={{ letterSpacing: "0.15em" }}>
        YOUR PERSONAL HEALTH REPORT
      </h1>
      {/* Video container */}
      <div className="w-full max-w-4xl mb-10">
        <div className="relative">
          <video 
            autoPlay 
            loop 
            playsInline
            className="w-full rounded-2xl shadow-lg"
            ref={(el) => {
              if (el) {
                el.volume = 0.5; // Set initial volume to 50%
              }
            }}
          >
            <source src="/CG.mov" type="video/quicktime" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black bg-opacity-50 rounded-lg p-2">
            <button
              onClick={(e) => {
                const video = e.currentTarget.parentElement?.previousElementSibling as HTMLVideoElement;
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                const video = e.currentTarget.parentElement?.previousElementSibling as HTMLVideoElement;
                video.muted = !video.muted;
              }}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {blocks.map((block, i) => {
            const value = result[block.key];
            if (!value) return null;

            // Special rendering for AI chat
            if (block.key === "aiChatIntro") {
              return (
                <div key={block.key} className="flex justify-center w-full">
                  <div className="w-full flex flex-col items-center">
                    <div className="text-center text-lg font-semibold mb-4">
                      {typeof value === "string" ? value : ""}
                    </div>
                    <AIChatBox analysis={result} />
                  </div>
                </div>
              );
            }

            // Special rendering for Holistic Health Advices
            if (block.key === "holisticAdvices") {
              return (
                <div key={block.key} className="flex justify-center w-full">
                  <div className="rounded-3xl shadow-lg px-8 py-7 max-w-3xl w-full bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
                    <div className="font-bold mb-3 tracking-wide uppercase text-base text-green-900">
                      {block.title}
                    </div>
                    <HolisticAdvicesBlock value={value} />
                  </div>
                </div>
              );
            }

            // Special rendering for risk profile
            if (block.key === "riskProfile") {
              // Filtrera labels så att bara de som finns i resultatet visas
              const relevantKeys = Object.keys(value || {});
              const filteredLabels = Object.fromEntries(
                Object.entries(riskProfileLabels).filter(([key]) => relevantKeys.includes(key))
              );

              return (
                <div key={block.key} className="flex justify-center w-full">
                  <div className="rounded-3xl shadow-lg px-10 py-8 max-w-4xl w-full bg-white border border-gray-200 mb-8">
                    <div className="font-bold mb-2 tracking-wide uppercase text-2xl text-[#4B2E19] text-center">
                      {block.title}
                    </div>
                    <div className="text-xs text-gray-500 text-center mb-6">
                      Click on a profile for more information
                    </div>
                    <RiskProfileDashboard value={value} labels={filteredLabels} />
                  </div>
                </div>
              );
            }

            // Special rendering for micronutrients
            if (block.key === "micronutrients") {
              return (
                <div key={block.key} className="flex justify-center w-full">
                  <div className="rounded-3xl shadow-lg px-10 py-8 max-w-4xl w-full bg-white border border-gray-200 mb-8">
                    <div className="font-bold mb-2 tracking-wide uppercase text-2xl text-[#4B2E19] text-center">
                      {block.title}
                    </div>
                    <MicronutrientTable
                      data={value}
                      onStartAnalysis={() => setShowMicronutrientPopup(true)}
                    />
                  </div>
                </div>
              );
            }

            // Övriga block: chattbubblor ut mot kanterna
            const alignRight = i % 2 === 1;
            const bubbleBg = alignRight ? bubbleAltColor : bubbleColor;
            const textColor = "#222";

            return (
              <div
                key={block.key}
                className={`flex ${alignRight ? "justify-end" : "justify-start"} w-full`}
              >
                <div
                  className="rounded-3xl shadow-lg px-6 py-5 w-[90%] transition-all duration-300"
                  style={{
                    background: bubbleBg,
                    color: textColor,
                    borderTopLeftRadius: alignRight ? "2rem" : "0.5rem",
                    borderTopRightRadius: alignRight ? "0.5rem" : "2rem",
                    borderBottomLeftRadius: "2rem",
                    borderBottomRightRadius: "2rem",
                    marginLeft: alignRight ? "auto" : "0",
                    marginRight: alignRight ? "0" : "auto",
                  }}
                >
                  <div className="font-bold mb-2 tracking-wide uppercase text-sm" style={{ color: "#222" }}>
                    {block.title}
                  </div>
                  <ChatBlockContent blockKey={block.key} value={value} />
                </div>
              </div>
            );
          })}

          <div className="flex justify-center mt-10">
            <a
              href="/"
              className="px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300"
            >
              Back to Start
            </a>
          </div>
        </div>
      </div>
      {showMicronutrientPopup && (
        <MicronutrientQuestionModal onClose={() => setShowMicronutrientPopup(false)} />
      )}
    </div>
  );
}

function MicronutrientTable({ data, onStartAnalysis }: { data: any, onStartAnalysis: () => void }) {
  // Om data är en sträng (GPT:s fallback)
  if (typeof data === "string") {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="italic text-gray-800">{data.replace("[Click here to do a basic analysis.]", "")}</div>
        <div className="chat-bubble flex flex-col items-center">
          <button
            className="mt-4 px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300"
            onClick={onStartAnalysis}
          >
            CLICK HERE TO DO A COMPLETE MICRONUTRIENT ANALYSIS
          </button>
        </div>
      </div>
    );
  }

  // Om data är ett objekt med näringsämnen
  if (data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length > 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border border-gray-300 rounded">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-900">Nutrient</th>
              <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-900">Status</th>
              <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([nutrient, info]: any) => (
              <tr 
                key={nutrient} 
                className={info.status === "deficient" ? "bg-red-50" : info.status === "low" ? "bg-yellow-50" : ""}
              >
                <td className="px-2 py-1 border-b font-medium text-gray-900">{capitalize(nutrient)}</td>
                <td className="px-2 py-1 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    info.status === "deficient" ? "bg-red-200 text-red-900" :
                    info.status === "low" ? "bg-yellow-200 text-yellow-900" :
                    "bg-green-200 text-green-900"
                  }`}>
                    {info.status}
                  </span>
                </td>
                <td className="px-2 py-1 border-b text-gray-900">{info.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 chat-bubble flex flex-col items-center">
          <button
            className="px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300"
            onClick={onStartAnalysis}
          >
            CLICK HERE TO DO A COMPLETE MICRONUTRIENT ANALYSIS
          </button>
        </div>
      </div>
    );
  }

  // Om data är array eller tomt, visa fallback
  return (
    <div className="italic text-gray-900">
      Based on your current description, it is difficult to assess potential micronutrient deficiencies.
      <div className="chat-bubble flex flex-col items-center">
        <button
          className="mt-4 px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300"
          onClick={onStartAnalysis}
        >
          CLICK HERE TO DO A COMPLETE MICRONUTRIENT ANALYSIS
        </button>
      </div>
    </div>
  );
}

function ChatBlockContent({ blockKey, value }: { blockKey: string; value: any }) {
  if (blockKey === "riskProfile" && typeof value === "object") {
    const riskProfileLabels = {
      inflammation: "Inflammation",
      nutrient: "Nutrient",
      allergy: "Allergy",
      dysbiosis: "Dysbiosis",
      hormonal: "Hormonal Imbalance",
      metabolic: "Metabolic Health",
      immune: "Immune Function",
      gutBarrier: "Gut Barrier Integrity",
      oxidativeStress: "Oxidative Stress",
      detoxification: "Detoxification Capacity",
      cardiovascular: "Cardiovascular Risk",
      mental: "Mental Wellbeing",
      hydration: "Hydration",
      activity: "Physical Activity"
    };

    // Färgfunktion
    function getColor(status: string) {
      if (!status || status === "" || status === "unknown") return "bg-gray-300";
      if (status.toLowerCase().includes("low")) return "bg-green-400";
      if (status.toLowerCase().includes("medium")) return "bg-yellow-400";
      if (status.toLowerCase().includes("high")) return "bg-red-500";
      return "bg-gray-300";
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Object.entries(riskProfileLabels).map(([key, label]) => (
          <div key={key} className="flex flex-col items-center text-center px-2">
            <div
              className={`w-10 h-10 rounded-full mb-2 ${getColor(value[key])} border-2 border-gray-200 flex items-center justify-center`}
            />
            <span className="text-xs font-semibold mb-1">{label}</span>
            <span className="text-[11px] text-gray-600">
              {typeof value[key] === "string" && !["low", "medium", "high", ""].includes(value[key].toLowerCase())
                ? value[key]
                : value[key] && ["low", "medium", "high"].includes(value[key].toLowerCase())
                  ? value[key].charAt(0).toUpperCase() + value[key].slice(1)
                  : "Unknown"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (blockKey === "micronutrients") {
    return <MicronutrientTable data={value} onStartAnalysis={() => setShowMicronutrientPopup(true)} />;
  }

  // Checklist: array of {label, done}
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    "label" in value[0] &&
    "done" in value[0]
  ) {
    return (
      <ul className="ml-2">
        {value.map((item: any, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <input type="checkbox" checked={!!item.done} readOnly className="accent-green-500" />
            <span className={item.done ? "line-through text-gray-400" : ""}>{item.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Array of strings
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc ml-6">
        {value.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  // PDF link as button
  if (blockKey === "pdfLink" && typeof value === "string") {
    return (
      <a
        href={value}
        className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow transition-all duration-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download PDF
      </a>
    );
  }

  // Default: plain text, preserve line breaks
  return <div className="whitespace-pre-line">{String(value)}</div>;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function HolisticAdvicesBlock({ value }: { value: any }) {
  // Om GPT returnerar checklistan separat i value, t.ex. { advices: "...", checklist: [...] }
  if (typeof value === "object" && value.advices && value.checklist) {
    return (
      <>
        <div className="mb-4 whitespace-pre-line text-base text-gray-900">{value.advices}</div>
        <div className="font-semibold mt-4 mb-2 text-green-800">Step-by-step Checklist</div>
        <ul className="list-disc ml-6 text-gray-900">
          {value.checklist.map((item: any, i: number) => (
            <li key={i} className="mb-1">{item}</li>
          ))}
        </ul>
      </>
    );
  }
  // Om GPT returnerar allt som en sträng
  return <div className="whitespace-pre-line text-base text-gray-900">{value}</div>;
}

function RiskProfileDashboard({ value, labels }: { value: any, labels: any }) {
  const [open, setOpen] = useState<string | null>(null);

  function getColor(status: string) {
    if (!status || status === "" || status === "unknown") return "bg-gray-300";
    if (status.toLowerCase().includes("low")) return "bg-green-400";
    if (status.toLowerCase().includes("medium")) return "bg-yellow-400";
    if (status.toLowerCase().includes("high")) return "bg-red-500";
    return "bg-gray-300";
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Object.entries(labels).map(([key, label]) => (
          <button
            key={key}
            className="flex flex-col items-center focus:outline-none group"
            onClick={() => setOpen(key)}
            tabIndex={0}
            aria-label={`Show more about ${label}`}
          >
            <div
              className={`w-12 h-12 rounded-full mb-2 border-2 border-gray-200 flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${getColor(value[key])}`}
            />
            <span className="text-xs font-semibold text-[#4B2E19]">{label}</span>
          </button>
        ))}
      </div>
      {/* Popup/modal för beskrivning */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
            <button
              className="absolute right-4 top-4 text-2xl font-bold text-[#4B2E19] hover:text-[#6B3F23] transition"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="text-lg font-bold text-[#4B2E19] mb-2">
              {labels[open]}
            </div>
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2 ${
                getColor(value[open])
              } text-white`}>
                {value[open] && ["low", "medium", "high"].includes(value[open].toLowerCase())
                  ? value[open].charAt(0).toUpperCase() + value[open].slice(1)
                  : "Unknown"}
              </span>
            </div>
            <div className="text-gray-800 whitespace-pre-line">
              {typeof value[open] === "string" && !["low", "medium", "high", ""].includes(value[open].toLowerCase())
                ? value[open]
                : "No further information."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function colorizeText(text: string) {
  return text
    .replace(/(High risk|Critical|Red flag)/gi, match =>
      `<span class="text-red-600 font-bold">${match}</span>`
    );
}