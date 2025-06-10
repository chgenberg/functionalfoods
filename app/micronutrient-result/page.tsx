"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface NutrientStatus {
  nutrient: string;
  status: "Low" | "Normal" | "High";
  description: string;
  foodSources: string;
}

export default function MicronutrientResult() {
  const searchParams = useSearchParams();
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [recommendedTests, setRecommendedTests] = useState([]);
  
  const data = searchParams.get("data");
  const result = data ? JSON.parse(decodeURIComponent(data)) : null;

  useEffect(() => {
    async function fetchRecommended() {
      // Hämta GPT:s rekommendationer från analysen/resultatet
      const gptRecommended = result?.recommendedTests || []; // eller var du nu har GPT:s lista
      if (!gptRecommended.length) return;

      const res = await fetch("/api/recommend-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gptRecommended }),
      });
      const data = await res.json();
      setRecommendedTests(data.recommendedTests || []);
    }
    fetchRecommended();
  }, [result]);

  if (!result) return <div>No data available</div>;

  const nutrients: NutrientStatus[] = result.nutrients || [];

  return (
    <div className="min-h-screen bg-[#071625] flex flex-col items-center py-12">
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-widest text-white" style={{ letterSpacing: "0.15em" }}>
        Your Micronutrient Status
      </h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nutrients.map((nutrient) => (
          <div
            key={nutrient.nutrient}
            className={`bg-white rounded-2xl p-6 shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-105 ${
              selectedNutrient === nutrient.nutrient ? "ring-4 ring-[#4B2E19]" : ""
            }`}
            onClick={() => setSelectedNutrient(nutrient.nutrient)}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#4B2E19]">{nutrient.nutrient}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                nutrient.status === "Low" ? "bg-red-100 text-red-700" :
                nutrient.status === "High" ? "bg-green-100 text-green-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {nutrient.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{nutrient.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[#4B2E19] mb-2">Recommended Food Sources:</h4>
              <p className="text-gray-600 text-sm">{nutrient.foodSources}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedNutrient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#4B2E19]">
                {selectedNutrient} Details
              </h2>
              <button
                onClick={() => setSelectedNutrient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {nutrients.find(n => n.nutrient === selectedNutrient) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#4B2E19] mb-2">Status</h3>
                  <p className="text-gray-600">
                    {nutrients.find(n => n.nutrient === selectedNutrient)?.status}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[#4B2E19] mb-2">Description</h3>
                  <p className="text-gray-600">
                    {nutrients.find(n => n.nutrient === selectedNutrient)?.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[#4B2E19] mb-2">Recommended Food Sources</h3>
                  <p className="text-gray-600">
                    {nutrients.find(n => n.nutrient === selectedNutrient)?.foodSources}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {recommendedTests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2">Recommended Health Tests</h2>
          <ul>
            {recommendedTests.map(test => (
              <li key={test.gptName} className="mb-4">
                <div className="font-semibold">{test.name || test.gptName}</div>
                <div className="text-sm text-gray-700">{test.description}</div>
                {test.source_url && (
                  <a href={test.source_url} className="text-blue-600 underline text-sm" target="_blank" rel="noopener noreferrer">
                    Läs mer / Köp testet
                  </a>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {`Recommended because your answers indicate a risk of ${test.gptName.toLowerCase()} deficiency.`}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}