"use client";
import { useState } from "react";

const micronutrientQuestions = [
  // Block A – Diet Intake
  { block: "Diet", question: "How often do you eat dark green leafy vegetables (e.g., spinach, kale)?", options: ["Daily", "A few times/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you eat vitamin C-rich fruits (citrus, kiwi, berries)?", options: ["Daily", "A few times/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you drink milk, yogurt, or fortified plant-based drinks?", options: ["Daily", "A few times/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you eat fatty fish or seafood (salmon, herring, mackerel)?", options: ["≥2 times/week", "Once/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you eat red meat or organ meats?", options: ["≥2 times/week", "Once/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you eat legumes, nuts, or seeds?", options: ["Daily", "A few times/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you eat whole grain products (whole grain bread, oats)?", options: ["Daily", "A few times/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you use iodized salt when cooking?", options: ["Always", "Sometimes", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you eat mushrooms or fortified cereals (vitamin D sources)?", options: ["≥2 times/week", "Once/week", "Rarely", "Never"], points: [3,2,1,0] },
  { block: "Diet", question: "How often do you drink sweetened energy drinks or fortified 'vitamin drinks'?", options: ["Daily", "A few times/week", "Rarely", "Never"], points: [0,1,2,3] },
  { block: "Diet", question: "Do you follow a vegetarian or vegan diet?", options: ["Yes, always", "Yes, mostly", "No"], points: [0,1,3] },
  { block: "Diet", question: "In the past year, have you had an unintentional weight change (>5% of body weight)?", options: ["Weight loss", "Weight gain", "No major change"], points: [0,1,3] },

  // Block B – Symptoms & Clinical Signs
  { block: "Symptoms", question: "Do you often feel tired or fatigued without a clear reason?", options: ["Yes", "Sometimes", "No"], points: [0,1,3] },
  { block: "Symptoms", question: "Do you have mouth sores or cracks at the corners of your mouth that heal slowly?", options: ["Yes", "Sometimes", "No"], points: [0,1,3] },
  { block: "Symptoms", question: "Have you noticed hair loss, brittle nails, or dry skin?", options: ["Yes", "Sometimes", "No"], points: [0,1,3] },
  { block: "Symptoms", question: "Do you get muscle cramps or tingling/numbness in your legs or arms?", options: ["Often", "Sometimes", "Rarely", "Never"], points: [0,1,2,3] },
  { block: "Symptoms", question: "Have you experienced night blindness or impaired night vision?", options: ["Yes", "No"], points: [0,3] },
  { block: "Symptoms", question: "Do you suffer from recurrent infections (e.g., ≥4 infections/year)?", options: ["Yes", "Not sure", "No"], points: [0,1,3] },
  { block: "Symptoms", question: "Do you have spoon-shaped or very brittle nails?", options: ["Yes", "No"], points: [0,3] },

  // Block C – Lifestyle & Medical Background
  { block: "Lifestyle", question: "Do you use sunscreen SPF ≥ 30 on your body almost every day year-round?", options: ["Yes", "Sometimes", "No"], points: [0,1,3] },
  { block: "Lifestyle", question: "How many hours per day do you spend outdoors in direct sunlight on average?", options: ["<15 min", "15–30 min", ">30 min"], points: [0,2,3] },
  { block: "Lifestyle", question: "Do you take proton pump inhibitors (e.g., omeprazole) more than twice a week?", options: ["Yes", "No"], points: [0,3] },
  { block: "Lifestyle", question: "Have you been diagnosed with celiac disease, Crohn's, or ulcerative colitis?", options: ["Yes", "No"], points: [0,3] },
  { block: "Lifestyle", question: "How many alcoholic drinks do you consume per week on average?", options: ["0", "1–7", "8–14", ">14"], points: [3,2,1,0] },
  { block: "Lifestyle", question: "Are you currently pregnant or breastfeeding?", options: ["Pregnant", "Breastfeeding", "No"], points: [0,1,3] },

  // Block D – Supplements & Demographics
  { block: "Supplements", question: "Do you take a multivitamin/mineral supplement at least 5 days/week?", options: ["Yes", "Sometimes", "No"], points: [3,1,0] },
  { block: "Supplements", question: "Do you regularly take single-nutrient supplements (e.g., only iron, only vitamin D)?", options: ["Yes", "No"], points: [3,0] },
  { block: "Supplements", question: "When was your last blood test including ferritin, B12, or vitamin D?", options: ["<6 months", "6–12 months", ">12 months", "Never"], points: [3,2,1,0] },
  { block: "Supplements", question: "Age group", options: ["<18", "18–35", "36–55", ">55 years"], points: [1,3,2,1] },
  { block: "Supplements", question: "Biological sex", options: ["Female", "Male", "Other"], points: [2,2,2] },
];

const blockWeights: Record<string, number> = {
  Diet: 0.4,
  Symptoms: 0.3,
  Lifestyle: 0.2,
  Supplements: 0.1,
};

// Helper för färger
const colorMap: Record<string, string> = {
  green: "bg-green-300",
  yellow: "bg-yellow-300",
  red: "bg-red-400",
  gray: "bg-gray-200"
};

function NutrientHeatmap({ matrix }: { matrix: any }) {
  if (!matrix) return null;
  const nutrients = Object.keys(matrix);
  const columns = ["Diet", "Symptoms", "Lifestyle", "Blood test"];

  return (
    <div className="mb-6 w-full">
      <h2 className="text-lg font-bold text-[#4B2E19] mb-2">Nutrient Risk Heatmap</h2>
      <table className="min-w-full text-sm border border-gray-300 rounded">
        <thead>
          <tr>
            <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-800">Nutrient</th>
            {columns.map(col => (
              <th key={col} className="px-2 py-1 border-b bg-gray-100 text-center text-gray-800">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nutrients.map(nutrient => (
            <tr key={nutrient}>
              <td className="px-2 py-1 border-b font-medium text-gray-900">{nutrient}</td>
              {columns.map(col => {
                const cell = matrix[nutrient][col] || { score: "-", color: "gray" };
                return (
                  <td
                    key={col}
                    className={`px-2 py-1 border-b text-center font-bold ${colorMap[cell.color] || "bg-gray-100"}`}
                  >
                    {cell.score}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-600 mt-2">
        <span className="inline-block w-4 h-4 bg-green-300 mr-1 align-middle" /> Low risk
        <span className="inline-block w-4 h-4 bg-yellow-300 mx-2 align-middle" /> Moderate risk
        <span className="inline-block w-4 h-4 bg-red-400 mx-2 align-middle" /> High risk
      </div>
    </div>
  );
}

export default function MicronutrientQuestionModal({ onClose }: { onClose: () => void }) {
  // === Email/privacy state ===
  const [email, setEmail] = useState("");
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [emailStepDone, setEmailStepDone] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState<{ answer: string; points: number }[]>(
    Array(micronutrientQuestions.length).fill({ answer: "", points: 0 })
  );
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPopup, setLoadingPopup] = useState({ visible: false, step: 0 });
  const [error, setError] = useState<string | null>(null);

  // Loading bar messages
  const loadingMessages = [
    "Analyzing your micronutrient levels...",
    "Calculating nutritional status...",
    "Preparing your personalized report...",
    "Almost ready..."
  ];
  const loadingDurations = [3000, 3000, 3000, 1000];

  async function handleFinish() {
    setLoading(true);
    setLoadingPopup({ visible: true, step: 0 });

    // Animate loading bar steps
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingPopup(lp => ({ ...lp, step: i }));
      await new Promise(res => setTimeout(res, loadingDurations[i]));
    }

    // Calculate block scores
    const blockScores: Record<string, number> = {};
    micronutrientQuestions.forEach((q, i) => {
      blockScores[q.block] = (blockScores[q.block] || 0) + answers[i].points;
    });

    // Calculate total weighted score
    const totalScore = Object.entries(blockScores).reduce(
      (sum, [block, score]) => sum + score * (blockWeights[block] || 0),
      0
    );

    try {
      const response = await fetch("/api/micronutrient-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: micronutrientQuestions.map((q, i) => ({
            block: q.block,
            question: q.question,
            answer: answers[i].answer,
            points: answers[i].points
          })),
          blockScores,
          totalScore
        }),
      });

      const data = await response.json();
      if (data.result) {
        setAnalysisResult({ ...data.result, blockScores, totalScore });
      } else {
        setError("Could not generate analysis.");
      }
    } catch (error) {
      setError("Could not generate analysis.");
    } finally {
      setLoading(false);
      setLoadingPopup({ visible: false, step: 0 });
    }
  }

  function handleNext() {
    if (active < micronutrientQuestions.length - 1) {
      setActive(active + 1);
    } else {
      handleFinish();
    }
  }

  function handleBack() {
    if (active > 0) setActive(active - 1);
  }

  // === Email step popup ===
  if (!emailStepDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full min-h-[320px] shadow-2xl flex flex-col items-center relative">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Before you start</h2>
          <label className="w-full mb-4">
            <span className="block text-gray-700 font-medium mb-1">Your email address</span>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2E19] bg-[#f3f4f6] text-gray-800 shadow transition-all duration-300"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={privacyChecked}
              onChange={e => setPrivacyChecked(e.target.checked)}
            />
            <span className="text-gray-700 text-sm">I agree with the privacy policy</span>
          </label>
          <div className="text-xs text-gray-500 mb-4 text-center">
            We hate SPAM and will never share your information to a 3rd party.
          </div>
          {emailError && <div className="text-red-600 text-sm mb-2">{emailError}</div>}
          <button
            className="px-6 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
                setEmailError("Please enter a valid email address.");
                return;
              }
              if (!privacyChecked) {
                setEmailError("You must agree with the privacy policy.");
                return;
              }
              setEmailError("");
              setEmailStepDone(true);
            }}
            disabled={!email || !privacyChecked}
          >
            Start
          </button>
          <button
            type="button"
            className="absolute right-4 top-4 text-2xl font-bold text-[#4B2E19] hover:text-[#6B3F23] transition shadow-md"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // === Loading popup ===
  if (loadingPopup.visible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-3xl px-10 py-10 flex flex-col items-center shadow-2xl min-w-[320px] relative">
          <div className="w-full h-3 bg-gray-200 rounded-full mb-8 overflow-hidden relative">
            <div
              className="h-3 rounded-full transition-all duration-700"
              style={{
                width: `${((loadingPopup.step + 1) / loadingMessages.length) * 100}%`,
                background: "linear-gradient(90deg, #4B2E19 60%, #6B3F23 100%)",
                boxShadow: "0 0 8px #4B2E19aa"
              }}
            />
            <div
              className="absolute top-0 -mt-1 w-5 h-5 rounded-full border-4 border-white"
              style={{
                left: `calc(${((loadingPopup.step + 1) / loadingMessages.length) * 100}% - 10px)`,
                background: "#4B2E19",
                transition: "left 0.7s cubic-bezier(.4,2,.6,1)"
              }}
            />
          </div>
          <div className="text-xl font-bold text-[#4B2E19] mb-2 animate-pulse">
            {loadingMessages[loadingPopup.step]}
          </div>
          <div className="text-sm text-gray-500">
            Please wait while we process your information...
          </div>
        </div>
      </div>
    );
  }

  // === Results popup ===
  if (analysisResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl flex flex-col items-center relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            className="absolute right-4 top-4 text-2xl font-bold text-[#4B2E19] hover:text-[#6B3F23] transition shadow-md"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          
          <h1 className="text-2xl font-extrabold mb-6 text-center text-[#4B2E19]">
            MICRONUTRIENT ANALYSIS RESULTS
          </h1>

          {/* Block Scores Table */}
          <div className="mb-6 w-full">
            <h2 className="text-lg font-bold text-[#4B2E19] mb-2">Block Scores</h2>
            <table className="min-w-full text-sm border border-gray-300 rounded mb-4">
              <thead>
                <tr>
                  <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-800">Block</th>
                  <th className="px-2 py-1 border-b bg-gray-100 text-left text-gray-800">Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analysisResult.blockScores || {})
                  .filter(([block]) => block !== "Total Risk Index")
                  .map(([block, score]) => (
                    <tr key={block}>
                      <td className="px-2 py-1 border-b font-medium text-gray-900">{block}</td>
                      <td className="px-2 py-1 border-b text-gray-900">
                        {typeof score === "number" ? score.toFixed(1) : String(score)}
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td className="px-2 py-1 border-b font-bold text-gray-900">Total (weighted)</td>
                  <td className="px-2 py-1 border-b font-bold text-gray-900">
                    {typeof analysisResult.totalScore === "number" 
                      ? analysisResult.totalScore.toFixed(1)
                      : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Lägg in förklaringen här! */}
            <div className="mb-4 w-full">
              <div className="text-sm text-gray-700">
                <strong>What do these scores mean?</strong><br />
                <ul className="list-disc ml-6">
                  <li>
                    <strong>Diet:</strong> Higher scores indicate a more balanced and nutrient-rich diet. Lower scores may suggest dietary gaps.
                  </li>
                  <li>
                    <strong>Symptoms:</strong> Lower scores mean more symptoms related to possible deficiencies. Higher scores mean fewer symptoms.
                  </li>
                  <li>
                    <strong>Lifestyle:</strong> Higher scores reflect healthier lifestyle factors (e.g., sun exposure, no chronic diseases).
                  </li>
                  <li>
                    <strong>Supplements:</strong> Higher scores mean regular use of supplements or recent blood tests.
                  </li>
                  <li>
                    <strong>Total (weighted):</strong> This is a combined risk index, where each block is weighted by its importance. Lower total scores indicate higher risk of deficiency.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Expert Analysis */}
          <div className="mb-6 w-full">
            <h2 className="text-lg font-bold text-[#4B2E19] mb-2">Expert Analysis</h2>
            <div className="text-gray-900 whitespace-pre-line">{analysisResult.analysis}</div>
          </div>

          {/* Recommended Tests */}
          <div className="mb-6 w-full">
            <h2 className="text-lg font-bold text-[#4B2E19] mb-2">Recommended Health Tests</h2>
            <ul className="list-disc ml-6 text-gray-900">
              {analysisResult.recommendedTests?.map((test: string, i: number) => (
                <li key={i}>{test}</li>
              ))}
            </ul>
          </div>

          {/* References */}
          <div className="mb-6 w-full">
            <h2 className="text-lg font-bold text-[#4B2E19] mb-2">References</h2>
            <ul className="list-disc ml-6 text-gray-900">
              {analysisResult.references?.map((ref: string, i: number) => (
                <li key={i}>{ref}</li>
              ))}
            </ul>
          </div>

          {/* Nutrient Heatmap */}
          {analysisResult.nutrientMatrix && (
            <NutrientHeatmap matrix={analysisResult.nutrientMatrix} />
          )}

          {analysisResult.percentiles && (
            <div className="mb-4 w-full">
              <h2 className="text-md font-bold text-[#4B2E19] mb-1">Percentile Comparison</h2>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {Object.entries(analysisResult.percentiles).map(([block, percentile]) => (
                  <li key={block}>
                    <strong>{block}:</strong> {percentile}th percentile
                  </li>
                ))}
              </ul>
              <div className="text-xs text-gray-500 mt-1">
                Percentiles are estimated compared to the general Western population, adjusted for age and sex where possible.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === Question flow ===
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full h-[480px] shadow-2xl flex flex-col items-center justify-center relative overflow-y-auto">
        <button
          type="button"
          className="absolute right-4 top-4 text-2xl font-bold text-[#4B2E19] hover:text-[#6B3F23] transition shadow-md"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="w-full mb-6">
          <div className="w-full h-3 bg-gray-200 rounded-full relative overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-700"
              style={{
                width: `${((active + 1) / micronutrientQuestions.length) * 100}%`,
                background: "linear-gradient(90deg, #4B2E19 60%, #6B3F23 100%)",
                boxShadow: "0 0 8px #4B2E19aa"
              }}
            />
          </div>
          <div className="text-xs text-center text-[#4B2E19] mt-1 font-semibold">
            {active + 1} / {micronutrientQuestions.length} answered
          </div>
        </div>

        <div className="mb-6 text-lg font-semibold text-gray-900 text-center">
          {micronutrientQuestions[active].question}
        </div>

        <div className="flex flex-col gap-2 w-full">
          {micronutrientQuestions[active].options.map((option, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-lg border border-gray-300 bg-[#f3f4f6] text-gray-800 shadow hover:bg-[#e5e7eb] transition ${
                answers[active].answer === option ? "ring-2 ring-[#4B2E19]" : ""
              }`}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[active] = { 
                  answer: option, 
                  points: micronutrientQuestions[active].points[idx] 
                };
                setAnswers(newAnswers);
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex w-full justify-between mt-8">
          <button
            className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 shadow transition-all duration-300"
            onClick={handleBack}
            disabled={active === 0}
          >
            Back
          </button>
          <button
            className="px-4 py-2 rounded-full bg-[#4B2E19] text-white font-semibold hover:bg-[#6B3F23] shadow transition-all duration-300"
            onClick={handleNext}
            disabled={!answers[active].answer || loading}
          >
            {active < micronutrientQuestions.length - 1 ? "Next" : loading ? "Analyzing..." : "Finish"}
          </button>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}

        <div
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter") {
              handleNext();
            }
          }}
        >
          {/* Frågeinnehåll */}
        </div>
      </div>
    </div>
  );
}