import { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowLeft, FiAlertTriangle, FiInfo, FiShield } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'AI Policy - Ulrika Functional Foods',
  description: 'Information om hur vi använder artificiell intelligens (AI) på vår webbplats och ansvarsfriskrivning för AI-genererat innehåll.',
};

export default function AIPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#014421] hover:text-[#116530] transition-colors mb-6"
          >
            <FiArrowLeft className="w-4 h-4" />
            Tillbaka till startsidan
          </Link>
          
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiShield className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">AI Policy</h1>
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Denna sida förklarar hur vi använder artificiell intelligens (AI) på Ulrika Functional Foods webbplats 
              och våra ansvarsfriskrivningar gällande AI-genererat innehåll.
            </p>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Viktigt meddelande</h2>
              <p className="text-amber-700">
                AI-genererat innehåll på denna webbplats är endast avsett för informationsändamål och ska inte 
                ersätta professionell medicinsk rådgivning, diagnos eller behandling. Konsultera alltid en 
                kvalificerad vårdgivare för medicinska frågor.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Where we use AI */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FiInfo className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Var vi använder AI</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hälsoquiz och Resultat</h3>
                <p className="text-gray-700">
                  Vårt hälsoquiz använder AI för att analysera dina svar och generera personliga rekommendationer. 
                  Resultaten är baserade på algoritmer och ska ses som allmän vägledning, inte medicinsk rådgivning.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ulrika AI-assistent (Chatbot)</h3>
                <p className="text-gray-700">
                  Vår AI-assistent hjälper till att svara på frågor om functional foods och hälsa. Svaren genereras 
                  automatiskt och kan innehålla felaktigheter. Använd informationen som utgångspunkt för vidare 
                  research och konsultera alltid vårdpersonal för medicinska beslut.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innehållsgenerering</h3>
                <p className="text-gray-700">
                  Vissa texter, artiklar och rekommendationer på webbplatsen kan vara helt eller delvis AI-genererade. 
                  Detta innehåll granskas men kan innehålla faktafel eller föråldrad information.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ansvarsfriskrivning</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Medicinsk rådgivning:</strong> AI-genererat innehåll på denna webbplats utgör inte medicinsk 
                rådgivning och ska inte användas som grund för medicinska beslut. Konsultera alltid en läkare eller 
                annan kvalificerad vårdgivare innan du gör förändringar i din kost, träning eller hälsorutiner.
              </p>
              
              <p>
                <strong>Noggrannhet:</strong> Vi strävar efter att tillhandahålla korrekt information, men kan inte 
                garantera att AI-genererat innehåll är felfritt, komplett eller aktuellt. Information kan ändras 
                utan förvarning.
              </p>
              
              <p>
                <strong>Individuella skillnader:</strong> AI-rekommendationer baseras på generella algoritmer och 
                tar inte hänsyn till dina unika medicinska förhållanden, allergier eller andra individuella faktorer.
              </p>
              
              <p>
                <strong>Begränsat ansvar:</strong> Ulrika Functional Foods frånsäker sig allt ansvar för eventuella 
                skador eller negativa konsekvenser som kan uppstå från användning av AI-genererat innehåll på denna 
                webbplats.
              </p>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rekommendationer för användning</h2>
            
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#014421] rounded-full mt-2 flex-shrink-0"></div>
                <span>Använd AI-genererat innehåll som utgångspunkt för vidare research</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#014421] rounded-full mt-2 flex-shrink-0"></div>
                <span>Verifiera information genom pålitliga källor och vetenskaplig litteratur</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#014421] rounded-full mt-2 flex-shrink-0"></div>
                <span>Konsultera vårdpersonal innan du gör betydande förändringar i din hälsorutin</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#014421] rounded-full mt-2 flex-shrink-0"></div>
                <span>Rapportera eventuella felaktigheter eller problem till oss</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakta oss</h2>
            <p className="text-gray-700 mb-4">
              Har du frågor om vår AI-policy eller vill rapportera problem med AI-genererat innehåll?
            </p>
            <Link 
              href="/kontakt/formular" 
              className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#116530] transition-colors"
            >
              Kontakta oss
            </Link>
          </div>
        </div>

        {/* Last updated */}
        <div className="mt-12 text-center text-sm text-gray-500">
          Senast uppdaterad: {new Date().toLocaleDateString('sv-SE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
} 