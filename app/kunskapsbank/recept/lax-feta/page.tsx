"use client";
import Image from 'next/image';

export default function LaxFetaRecipe() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src="/lax_feta.jpg"
            alt="Lax med fetaost och rostade rotfrukter"
            fill
            className="object-cover"
          />
        </div>

        <h1 className="text-4xl font-bold text-[#4B2E19] mb-4">Lax med fetaost och rostade rotfrukter</h1>
        
        <div className="flex gap-4 text-gray-600 mb-8">
          <span>⏱️ Tillagningstid: 30 minuter</span>
          <span>👥 4 portioner</span>
        </div>

        <p className="text-lg text-gray-700 mb-8">
          Rätten erbjuder omega-3, antioxidanter och fibrer, vilket gör den både hälsosam och mättande. Perfekt för en balanserad middag!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-[#4B2E19] mb-4">Utvalda råvaror</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Laxfilé</li>
              <li>Pumpafrön</li>
              <li>Brysselkål</li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#4B2E19] mt-8 mb-4">Näringsvärden</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Kolhydrater: 28 gram</li>
              <li>Fett: 30 gram</li>
              <li>Protein: 37 gram</li>
              <li>Energi: 549 kcal</li>
              <li>Fiber: 6 gram</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[#4B2E19] mb-4">Ingredienser</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>600 g laxfilé</li>
              <li>salt och svartpeppar</li>
              <li>100 g fetaost</li>
              <li>3 msk pumpafrön</li>
              <li>1 krm örtagårdskrydda</li>
              <li>1 st sötpotatis</li>
              <li>1 st palsternacka</li>
              <li>250 g brysselkål</li>
              <li>2 tsk olivolja</li>
              <li>2 msk färsk timjan</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-[#4B2E19] mb-4">Gör så här</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-4">
            <li>Sätt ugnen på 200 grader.</li>
            <li>Lägg laxfilén på en ugnsplåt med bakplåtspapper.</li>
            <li>Strö på salt och peppar.</li>
            <li>Smula över osten och strö på pumpafrön.</li>
            <li>Strö på örtagårdskrydda.</li>
            <li>Skala och skär sötpotatis och palsternacka i mindre bitar och lägg i en skål.</li>
            <li>Dela brysselkålen och blanda ner med olivolja och kryddor.</li>
            <li>Lägg blandningen runt laxen och gratinera i 20 minuter.</li>
            <li>Strö på lite färsk timjan.</li>
          </ol>
        </div>
      </div>
    </main>
  );
} 