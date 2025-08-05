import React from 'react';

export default function PersonuppgifterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Hantering av Personuppgifter
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Vad är personuppgifter?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Personuppgifter är all information som kan kopplas till dig som person. Det kan vara:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Namn och kontaktuppgifter</li>
                <li>E-postadress och telefonnummer</li>
                <li>IP-adress och teknisk information</li>
                <li>Köphistorik och preferenser</li>
                <li>Användaraktivitet på webbplatsen</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Hur vi samlar in dina uppgifter
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Direkt från dig
                  </h3>
                  <ul className="text-gray-700 text-sm">
                    <li>• Kontaktformulär</li>
                    <li>• Registrering av konto</li>
                    <li>• Köp av kurser</li>
                    <li>• Nyhetsbrevsprenumeration</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Automatiskt
                  </h3>
                  <ul className="text-gray-700 text-sm">
                    <li>• Cookies och webbläsardata</li>
                    <li>• IP-adress och platsdata</li>
                    <li>• Användningsstatistik</li>
                    <li>• Teknisk information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Varför vi behandlar dina uppgifter
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Fullgöra avtal</h3>
                  <p className="text-gray-700 text-sm">
                    Leverera kurser, skicka kvitton, hantera kundservice
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Förbättra tjänster</h3>
                  <p className="text-gray-700 text-sm">
                    Analysera användning, utveckla nya funktioner, personalisera upplevelsen
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Marknadsföring</h3>
                  <p className="text-gray-700 text-sm">
                    Skicka nyhetsbrev, relevanta erbjudanden (endast med ditt samtycke)
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Rättsliga krav</h3>
                  <p className="text-gray-700 text-sm">
                    Bokföring, skattedeklaration, andra lagstadgade skyldigheter
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Dina rättigheter enligt GDPR
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Rätt till information</h3>
                  <p className="text-blue-700 text-sm">
                    Få veta vilka uppgifter vi har om dig och hur vi använder dem
                  </p>
                </div>

                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-semibold text-secondary mb-2">Rätt till rättelse</h3>
                  <p className="text-secondary text-sm">
                    Begära att felaktiga uppgifter korrigeras
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Rätt till radering</h3>
                  <p className="text-red-700 text-sm">
                    Begära att dina uppgifter raderas ("rätten att bli glömd")
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Rätt till portabilitet</h3>
                  <p className="text-purple-700 text-sm">
                    Få ut dina uppgifter i ett strukturerat format
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Rätt att invända</h3>
                  <p className="text-yellow-700 text-sm">
                    Säga nej till viss behandling av dina uppgifter
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Rätt till begränsning</h3>
                  <p className="text-gray-700 text-sm">
                    Begära att behandlingen av dina uppgifter begränsas
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Så länge sparar vi dina uppgifter
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Kontouppgifter:</strong> Så länge ditt konto är aktivt + 24 månader</li>
                  <li><strong>Köphistorik:</strong> 7 år (bokföringslagen)</li>
                  <li><strong>Nyhetsbrev:</strong> Tills du avregistrerar dig</li>
                  <li><strong>Webbstatistik:</strong> 26 månader (Google Analytics)</li>
                  <li><strong>Supportärenden:</strong> 3 år efter avslutad kontakt</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Säkerhet och skydd
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vi vidtar omfattande säkerhetsåtgärder för att skydda dina personuppgifter:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>SSL-kryptering för all dataöverföring</li>
                <li>Säkra servrar hos betrodda leverantörer</li>
                <li>Begränsad åtkomst - endast behörig personal</li>
                <li>Regelbundna säkerhetsuppdateringar</li>
                <li>Backup och återställningsrutiner</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Så utövar du dina rättigheter
              </h2>
              <div className="bg-primary/10 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Vill du utöva någon av dina rättigheter eller har frågor om hur vi hanterar 
                  dina personuppgifter? Kontakta oss på:
                </p>
                <div className="text-center">
                  <a 
                    href="mailto:info@functionalfoods.se" 
                    className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@functionalfoods.se
                  </a>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Klagomål och tillsyn
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Om du är missnöjd med hur vi hanterar dina personuppgifter har du rätt att 
                lämna klagomål till Datainspektionen (tidigare Integritetsskyddsmyndigheten). 
                Du hittar mer information på{' '}
                <a href="https://www.datainspektionen.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  www.datainspektionen.se
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 