import React from 'react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Cookie Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                När du besöker functionalfoods.se lagrar vi s.k. "cookies" för att göra din
                upplevelse av webbplatsen bättre, men också för att samla statistik som gör att vi blir
                bättre på att utveckla den. På denna webbplats har du möjlighet att samtycka till att
                cookies sparas på din dator eller annan enhet vid besök på webbplatsen. Utan ditt
                samtycke till lagring av grundläggande cookies kan vi inte erbjuda dig en webbplats
                som fungerar som avsett. Utöver dessa grundläggande cookies förekommer det
                cookies från tredje part som du måste samtycka till att lagra om du vill ha tillgång till
                vissa andra funktioner.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Du kan alltid avböja och återkalla samtycke till lagring av cookies på vår webbplats. 
                Om du avböjer samtycke kan det innebära att webbplatsen inte fungerar som det är 
                tänkt. Om du samtycker till att lagra cookies när du besöker oss på webben kan du 
                vara säker på att vi anonymiserar eventuella IP-adresser vi samlar in som statistiskt 
                underlag.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Många cookies är direkt nödvändiga för att sajter ska kunna fungera, andra används 
                för att spara dina valda preferenser som besökare, föra besöksstatistik och för 
                marknadsföringsändamål.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                På functionalfoods.se används följande typer av cookies:
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Sessionscookies
                  </h3>
                  <p className="text-gray-700">
                    Tillfälliga cookies som upphör när du stänger din webbläsare eller enhet.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Varaktiga cookies
                  </h3>
                  <p className="text-gray-700">
                    Cookies som ligger kvar på din dator tills du tar bort dem eller de löper ut.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Förstapartscookies
                  </h3>
                  <p className="text-gray-700">
                    Cookies som är satta av den webbplatsen du besöker.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Tredjepartscookies
                  </h3>
                  <p className="text-gray-700">
                    Cookies som satta av olika tredjepartssidor. Dessa används för att rikta
                    marknadsföring och föra statistik. Exempel är Facebook Pixel och Google Analytics.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Så här hanterar du cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Du kan när som helst ändra dina cookie-inställningar genom att:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Använda cookie-bannern som visas när du besöker webbplatsen</li>
                <li>Ändra inställningarna i din webbläsare</li>
                <li>Kontakta oss på info@functionalfoods.se</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Observera att om du väljer att blockera alla cookies kan vissa funktioner på 
                webbplatsen sluta fungera korrekt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Mer information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                För mer detaljerad information om hur vi behandlar dina personuppgifter, 
                läs vår fullständiga{' '}
                <a href="/integritetspolicy" className="text-primary hover:underline">
                  integritetspolicy
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Kontakt
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Har du frågor om vår användning av cookies? Kontakta oss gärna på{' '}
                <a href="mailto:info@functionalfoods.se" className="text-primary hover:underline">
                  info@functionalfoods.se
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 