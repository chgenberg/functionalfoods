import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cookie-policy</h1>
      <p className="text-gray-600 mb-8">Senast uppdaterad: 10 juni 2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Vad är cookies?</h2>
        <p>Små textfiler som sparas i din webbläsare och gör att webbplatsen kommer ihåg dina inställningar, ger säker inloggning och hjälper oss att förstå hur sidan används.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Hur vi använder cookies</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Kategori</th>
                <th className="border p-2">Syfte</th>
                <th className="border p-2">Exempel på cookies*</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Nödvändiga</td>
                <td className="border p-2">Drift, inloggning, säkerhet</td>
                <td className="border p-2">wordpress_logged_in_, wfwaf-authcookie, __stripe_mid</td>
              </tr>
              <tr>
                <td className="border p-2">Funktionella</td>
                <td className="border p-2">Sparar val (språk etc.)</td>
                <td className="border p-2">wp-settings-time</td>
              </tr>
              <tr>
                <td className="border p-2">Statistik</td>
                <td className="border p-2">Trafikanalys</td>
                <td className="border p-2">_ga, _gid (Google Analytics)</td>
              </tr>
              <tr>
                <td className="border p-2">Marknadsföring</td>
                <td className="border p-2">Personalisera annonser</td>
                <td className="border p-2">_fbp (Meta/FB Pixel)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-gray-600">* Aktuell lista kan variera – se vårt cookie-hanterings-verktyg för uppdaterad information.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Samtycke & hantering</h2>
        <p>När du besöker sidan visas en banner där du kan:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Acceptera alla cookies</li>
          <li>Neka icke-nödvändiga cookies</li>
          <li>Ändra inställningar när som helst via länken "Cookie-inställningar" i sidfoten.</li>
        </ul>
        <p className="mt-2">Du kan även radera eller blockera cookies i din webbläsares inställningar.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Tredjepartscookies</h2>
        <p>Google Analytics och Meta Pixel kan sätta cookies som överför data utanför EU/EES. Sådan överföring sker med standardavtalsklausuler.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Ändringar</h2>
        <p>Vi uppdaterar listan vid behov. Datumet längst upp anger senaste revision.</p>
      </section>
    </div>
  );
} 