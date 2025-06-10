"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DummyResultPage() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulera AI-analys
    const analyzeUserData = async () => {
      try {
        // Hämta kursinnehåll
        const [basicsResponse, flowResponse] = await Promise.all([
          fetch('/functionalbasics.txt'),
          fetch('/functionalflow.txt')
        ]);
        
        const basicsText = await basicsResponse.text();
        const flowText = await flowResponse.text();

        // Simulera AI-analys baserat på användarens svar
        // I verkligheten skulle detta komma från OpenAI API
        const mockUserSymptoms = {
          digestiveIssues: true,
          lowEnergy: true,
          inflammation: true,
          stressRelated: true
        };

        // Bestäm vilken kurs som passar bäst
        const recommendedCourse = mockUserSymptoms.digestiveIssues ? "flow" : "basics";
        
        // Skapa personlig analys
        const analysis = {
          primaryConcerns: mockUserSymptoms.digestiveIssues ? [
            "Obalanserad tarmflora",
            "Inflammatoriska processer i mage och tarm",
            "Låg energinivå kopplat till dålig näringsupptag",
            "Stress som påverkar matsmältningen"
          ] : [
            "Behov av bättre matvanor",
            "Låg energinivå",
            "Näringsbrister",
            "Obalanserat blodsocker"
          ],
          recommendedCourse,
          personalizedAdvice: {
            diet: recommendedCourse === "flow" ? [
              "Öka intaget av fermenterade livsmedel som kimchi och kefir",
              "Fokusera på antiinflammatoriska livsmedel som ingefära och gurkmeja",
              "Inkludera prebiotiska fibrer från lök, vitlök och havre",
              "Minska på gluten och mejeriprodukter under en testperiod"
            ] : [
              "Börja dagen med en proteinrik frukost",
              "Inkludera grönsaker i varje måltid",
              "Välj fullkorn istället för vitt bröd och pasta",
              "Ät regelbundet för stabilt blodsocker"
            ],
            lifestyle: [
              "Prioritera 7-8 timmars sömn per natt för optimal återhämtning",
              "Lägg till dagliga promenader för bättre matsmältning",
              "Praktisera djupandning före måltider för bättre matsmältning",
              "Skapa lugna måltidsstunder utan stress"
            ],
            supplements: recommendedCourse === "flow" ? [
              "Probiotika med minst 10 miljarder CFU",
              "L-glutamin för tarmläkning",
              "Digestiva enzymer vid behov",
              "Omega-3 för att minska inflammation"
            ] : [
              "D-vitamin 2000 IE dagligen",
              "B-komplex för energi",
              "Magnesium för bättre sömn",
              "Omega-3 för allmän hälsa"
            ]
          },
          matchScore: recommendedCourse === "flow" ? 94 : 88,
          courseHighlights: recommendedCourse === "flow" ? {
            recipes: "85 magvänliga recept",
            duration: "6 veckors program",
            focus: "Maghälsa & antiinflammation",
            bonus: "Personlig coaching med Ulrika"
          } : {
            recipes: "75 näringsrika recept",
            duration: "6 veckors grundkurs",
            focus: "Hälsosamma vanor & energi",
            bonus: "Veckovisa videolektioner"
          }
        };

        setAnalysisData(analysis);
      } catch (error) {
        console.error('Error loading course data:', error);
        // Fallback data om något går fel
        setAnalysisData({
          primaryConcerns: [
            "Obalanserad tarmflora",
            "Inflammatoriska processer",
            "Låg energinivå",
            "Näringsbrister"
          ],
          recommendedCourse: "flow",
          personalizedAdvice: {
            diet: [
              "Öka intaget av fermenterade livsmedel för tarmhälsan",
              "Fokusera på antiinflammatoriska livsmedel som bär och gröna bladgrönsaker",
              "Inkludera omega-3-rika källor som lax och valnötter",
              "Minska på processad mat och socker"
            ],
            lifestyle: [
              "Prioritera 7-8 timmars sömn per natt",
              "Lägg till dagliga promenader för bättre matsmältning",
              "Praktisera stresshantering genom meditation eller yoga",
              "Drick minst 2 liter vatten dagligen"
            ],
            supplements: [
              "Probiotika för tarmbalans",
              "D-vitamin för immunförsvaret",
              "Magnesium för energiproduktion",
              "Omega-3 för inflammation"
            ]
          },
          matchScore: 92
        });
      }
      
      setLoading(false);
    };

    analyzeUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyserar dina svar...</p>
        </div>
      </div>
    );
  }

  const isFlowRecommended = analysisData?.recommendedCourse === "flow";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8f5f0]">
      {/* Header med logo och meny */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Image
              src="/FunctionalLogo.png"
              alt="Functional Foods"
              width={120}
              height={48}
              className="object-contain"
            />
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/shop" className="text-gray-600 hover:text-gray-900 font-light transition-colors">
                SHOP
              </a>
              <a href="/om-oss" className="text-gray-600 hover:text-gray-900 font-light transition-colors">
                Om oss
              </a>
              <a href="/inspiration" className="text-gray-600 hover:text-gray-900 font-light transition-colors">
                Inspiration
              </a>
              <a href="/kontakt" className="text-gray-600 hover:text-gray-900 font-light transition-colors">
                Kontakta oss
              </a>
            </nav>
            {/* Mobilmeny-knapp */}
            <button className="md:hidden text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Avskiljande linje */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      {/* Hero video sektion */}
      <div className="bg-gradient-to-b from-white to-[#fafaf8] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <video 
              autoPlay 
              loop 
              muted
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            >
              <source src="/Ulrika.mp4" type="video/mp4" />
              Din webbläsare stöder inte videouppspelning.
            </video>
            
            {/* Overlay med play/pause kontroller */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={(e) => {
                  const video = e.currentTarget.closest('.relative')?.querySelector('video');
                  if (video) {
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }
                }}
                className="bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 rounded-full p-2 transition-all duration-200 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  const video = e.currentTarget.closest('.relative')?.querySelector('video');
                  if (video) {
                    video.muted = !video.muted;
                  }
                }}
                className="bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 rounded-full p-2 transition-all duration-200 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Huvudinnehåll */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Personlig hälsning */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-4">
            DIN PERSONLIGA HÄLSOANALYS
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Baserat på dina svar har vi identifierat områden där Functional Foods kan göra stor skillnad
          </p>
        </div>

        {/* Huvudbesvär */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600">✓</span>
            </span>
            Identifierade Fokusområden
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {analysisData.primaryConcerns.map((concern: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-700 font-light">{concern}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI-analys sektion */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6">AI-Powered Livsstilsanalys</h2>
          
          {/* Hälsoindikatorer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Energinivå</h3>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">65% av optimal nivå</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Sömnkvalitet</h3>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">70% av optimal nivå</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Stressnivå</h3>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">45% av optimal nivå</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Matvanor</h3>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">60% av optimal nivå</p>
            </div>
          </div>

          {/* Detaljerad analys */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-800">Nuvarande Mönster</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Oregelbunden måltidsrytm påverkar energinivåer</p>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Högt intag av processade kolhydrater</p>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Otillräcklig vattenintag under dagen</p>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Stress påverkar matsmältningen</p>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-800">Rekommenderade Åtgärder</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Implementera regelbundna måltider</p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Öka intaget av gröna bladgrönsaker</p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Drick 2-3 liter vatten dagligen</p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p className="text-sm text-gray-600">Praktisera stresshantering</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Närringsanalys */}
          <div className="mt-8">
            <h3 className="text-lg font-light text-gray-800 mb-4">Närringsanalys</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Protein</h4>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-red-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">75% av rekommenderat</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Fiber</h4>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-orange-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">45% av rekommenderat</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Omega-3</h4>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">30% av rekommenderat</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Vitamin D</h4>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">40% av rekommenderat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rekommenderad kurs */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-8 border border-green-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-gray-800">
              Perfekt Matchning För Dig
            </h2>
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-light">
              {analysisData.matchScore}% match
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {isFlowRecommended ? "Functional Flow" : "Functional Basics"}
            </h3>
            <p className="text-gray-600 mb-4">
              {isFlowRecommended 
                ? "En 6-veckorskurs specialdesignad för dig som vill förbättra din maghälsa, minska inflammation och skapa naturligt flöde i vardagen. Perfekt för dina identifierade behov kring tarmbalans och energinivåer."
                : "En grundkurs som ger dig alla verktyg för att använda mat som medicin. Perfekt för dig som vill bygga hälsosamma vanor och förstå hur functional foods kan transformera din hälsa."}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {analysisData.courseHighlights && Object.entries(analysisData.courseHighlights).map(([key, value]) => {
                const colors = {
                  recipes: "bg-green-100 text-green-700",
                  duration: "bg-blue-100 text-blue-700",
                  focus: "bg-purple-100 text-purple-700",
                  bonus: "bg-yellow-100 text-yellow-700"
                };
                return (
                  <span key={key} className={`${colors[key as keyof typeof colors]} px-3 py-1 rounded-full text-sm`}>
                    {value as string}
                  </span>
                );
              })}
            </div>
            
            {/* Exempel på recept */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Exempel på recept i kursen:</h4>
              <p className="text-sm text-gray-600">
                {isFlowRecommended 
                  ? "Linssoppa med gurkmeja, Fermenterad rödkålssallad, Laxgratäng med broccoli, Chiapudding med bär, Ugnsomelett med keso"
                  : "Pokébowl med kyckling, Havrefrallor med morötter, Laxburgare med grönsaksröra, Vegetarisk currygryta, Bananplättar med bär"}
              </p>
            </div>

            {/* Kursfördelar */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-700">Veckovisa videolektioner</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-700">Inköpslistor & mealprep</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-700">Community & support</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-700">Näringsläramoduler</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Specialpris just nu:</span> {isFlowRecommended ? "1.836 kr" : "2.295 kr"} 
                <span className="text-green-600 ml-2">(ord. pris 2.295 kr)</span>
              </p>
            </div>

            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Gå till kurssidan →
            </button>
          </div>
        </div>

        {/* Personliga råd */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Kostråd */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🥗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Kostråd</h3>
            <ul className="space-y-2">
              {analysisData.personalizedAdvice.diet.map((advice: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {advice}
                </li>
              ))}
            </ul>
          </div>

          {/* Livsstilsråd */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🧘‍♀️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Livsstil</h3>
            <ul className="space-y-2">
              {analysisData.personalizedAdvice.lifestyle.map((advice: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {advice}
                </li>
              ))}
            </ul>
          </div>

          {/* Tillskott */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tillskott</h3>
            <ul className="space-y-2">
              {analysisData.personalizedAdvice.supplements.map((advice: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Kundrecensioner */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Vad säger våra kursdeltagare?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-3">
                "Min mage har slutat krångla efter bara 3 veckor! Jag har mer energi och känner mig piggare hela dagen."
              </p>
              <p className="text-sm font-semibold text-gray-700">- Maria, 42 år</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-3">
                "Functional Flow har förändrat mitt liv! Inflammationen är borta och jag sover så mycket bättre."
              </p>
              <p className="text-sm font-semibold text-gray-700">- Johan, 38 år</p>
            </div>
          </div>
        </div>

        {/* Nästa steg */}
        <div className="bg-gradient-to-r from-[#f8f5f0] to-[#f0e8d8] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Din resa mot bättre hälsa börjar här
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Baserat på din analys är {isFlowRecommended ? "Functional Flow" : "Functional Basics"} den perfekta kursen för dig. 
            Med över {isFlowRecommended ? "85" : "75"} recept, veckovisa videolektioner och personlig support får du alla verktyg du behöver.
          </p>
          
          {/* Garanti */}
          <div className="bg-white rounded-lg p-6 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">100% Nöjd-kund-garanti</h3>
            <p className="text-sm text-gray-600">
              Vi är så säkra på att du kommer älska kursen att vi erbjuder full återbetalning inom 14 dagar om du inte är nöjd.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg transform hover:scale-105">
              Ja, jag vill börja nu! →
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition-colors">
              Jag vill veta mer först
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Ingen bindningstid • Livstidsaccess • Börja direkt
          </p>
        </div>

        {/* Tillbaka-knapp */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="text-gray-500 hover:text-gray-700 underline"
          >
            ← Tillbaka till start
          </a>
        </div>
      </div>
    </div>
  );
} 