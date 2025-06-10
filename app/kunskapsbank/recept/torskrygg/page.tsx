"use client";
import Image from 'next/image';

export default function TorskryggRecipe() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src="/torskrygg.jpg"
            alt="Torskrygg med ägghack och sparris"
            fill
            className="object-cover"
          />
        </div>

        <h1 className="text-4xl font-bold text-[#4B2E19] mb-4">Torskrygg med ägghack och sparris</h1>
        
        <div className="flex gap-4 text-gray-600 mb-8">
          <span>⏱️ Tillagningstid: 20 minuter</span>
          <span>👥 2 portioner</span>
        </div>

        <p className="text-lg text-gray-700 mb-8">
          Proteinrik fisk, antioxidantrika granatäpplekärnor och fibrer från sparris gör detta till en balanserad och hälsosam måltid.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-[#4B2E19] mb-4">Utvalda råvaror</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Torskrygg</li>
              <li>Grön sparris</li>
              <li>Granatäppelkärnor</li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#4B2E19] mt-8 mb-4">Näringsvärden</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Kolhydrater: 12 gram</li>
              <li>Fett: 17 gram</li>
              <li>Protein: 43 gram</li>
              <li>Energi: 380 kcal</li>
              <li>Fiber: 0 gram</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[#4B2E19] mb-4">Ingredienser</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>300 g torskrygg</li>
              <li>salt och svartpeppar</li>
              <li>2 st kokta ägg</li>
              <li>1 msk majonäs</li>
              <li>250 g grön sparris</li>
              <li>1 dl granatäppelkärnor</li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#4B2E19] mt-8 mb-4">Dekoration</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>1 st kokt ägg</li>
              <li>2 st färska dillkvistar</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-[#4B2E19] mb-4">Gör så här</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-4">
            <li>Sätt ugnen på 175 grader.</li>
            <li>Dela torskryggen i två bitar.</li>
            <li>Strö på salt och svartpeppar.</li>
            <li>Lägg i en ugnsform och ugnsbaka i 15 minuter.</li>
            <li>Skala och finhacka äggen och lägg i en skål tillsammans med majonnäs.</li>
            <li>Strö på salt och peppar.</li>
            <li>Koka sparris i lättsaltat vatten i 2 minuter.</li>
            <li>Häll av vattnet och lägg sparris på tallrikar.</li>
            <li>Lägg på torsk och ägghack.</li>
            <li>Strö över granatäpplekärnor.</li>
            <li>Skär äggen i klyftor och lägg vid sidan om.</li>
            <li>Dekorera med dillkvistar.</li>
          </ol>
        </div>
      </div>
    </main>
  );
} 