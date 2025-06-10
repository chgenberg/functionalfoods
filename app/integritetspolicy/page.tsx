import React from 'react';

export default function Integritetspolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Integritetspolicy</h1>
      <p className="text-gray-600 mb-8">Senast uppdaterad: 10 juni 2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Inledning</h2>
        <p>Din integritet är viktig för oss. I denna policy beskriver vi hur vi samlar in, använder, lagrar och skyddar dina personuppgifter när du besöker eller handlar på functionalfoods.se.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Personuppgiftsansvarig</h2>
        <p>Ulrikas Kickstart AB, org.nr 559051-3387, Odengatan 106 lgh 1603, 113 22 Stockholm, är personuppgiftsansvarig. Har du frågor når du oss på info@functionalfoods.se.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Vilka uppgifter vi behandlar</h2>
        <ul className="list-disc pl-6">
          <li>Identitets- och kontaktuppgifter (namn, mejl, telefon, ev. personnummer)</li>
          <li>Kontouppgifter (användarnamn, lösenord)</li>
          <li>Betalnings- och transaktionsdata (Swish- eller kortbetalning via Stripe; kortnummer lagras aldrig hos oss)</li>
          <li>Tekniska data (IP-adress, enhet, webbläsare, cookie-ID)</li>
          <li>Kommunikation och supportärenden</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Ändamål & rättslig grund</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Ändamål</th>
                <th className="border p-2">Exempel</th>
                <th className="border p-2">Rättslig grund</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Fullgöra avtal</td>
                <td className="border p-2">Leverera kursmaterial, skicka kvitto</td>
                <td className="border p-2">Avtalsuppfyllelse</td>
              </tr>
              <tr>
                <td className="border p-2">Marknadsföring</td>
                <td className="border p-2">Nyhetsbrev, erbjudanden</td>
                <td className="border p-2">Samtycke (kan återkallas)</td>
              </tr>
              <tr>
                <td className="border p-2">Webbstatistik & säkerhet</td>
                <td className="border p-2">Analysera trafik, förhindra bedrägerier</td>
                <td className="border p-2">Berättigat intresse</td>
              </tr>
              <tr>
                <td className="border p-2">Bokföring & rättsliga krav</td>
                <td className="border p-2">Spara transaktionsdata</td>
                <td className="border p-2">Rättslig förpliktelse</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Lagringstid</h2>
        <p>Vi sparar uppgifterna så länge det behövs för ändamålet eller så länge lag kräver (ex. bokföringslagen: 7 år). Kontodata raderas 24 månader efter att ditt senaste kursmedlemskap löpt ut.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Delning & överföringar</h2>
        <ul className="list-disc pl-6">
          <li>Betalningar: Stripe (USA/EES) och Swish (Getswish AB, SE).</li>
          <li>Analys & marknadsföring: Google Analytics, Meta (Facebook) Pixel. Överföringar utanför EU/EES sker med standardavtalsklausuler.</li>
          <li>Övriga IT-leverantörer: Webbhotell, e-post, CRM. Alla har databehandlaravtal.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Dina rättigheter</h2>
        <p>Tillgång, rättelse, radering, begränsning, dataportabilitet, invändning och återkallande av samtycke. Klagomål lämnas till Integritetsskyddsmyndigheten (IMY).</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Säkerhet</h2>
        <p>SSL-kryptering, starka lösenord, principen om minsta åtkomst, regelbunden backup.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Ändringar</h2>
        <p>Vi kan uppdatera policyn. Ny version publiceras här med nytt datum.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Kontakt</h2>
        <p>E-post: info@functionalfoods.se | Post: Ulrikas Kickstart AB, Odengatan 106 lgh 1603, 113 22 Stockholm.</p>
      </section>
    </div>
  );
} 