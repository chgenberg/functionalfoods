import React from 'react';

export default function AnvandarvillkorPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Användarvillkor
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Hur betalar jag för min kurs?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                När du köper en kurs från vår hemsida kan du välja att betala med Swish eller kortbetalning. 
                All betalning förutom Swish hanteras via vår externa betallösning Stripe. När ditt köp har 
                gått igenom hos Stripe får du en bekräftelse på detta i din mailkorg.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Mitt konto
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                När du gjort ditt första köp hos oss får du inloggningsuppgifter via email. Där hittar 
                länken till ditt konto som ligger på vår hemsida. Det är här du loggar in till ditt 
                kursmaterial. I inloggat läge kan du byta till ett eget lösenord under Mina Sidor – 
                Kontouppgifter. Mailadressen är alltid den du uppgav i ditt köp. Ska du köpa ny kurs 
                rekommenderar vi att du är inloggad om du har ett konto sedan tidigare.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                På Mitt konto kan du se de köp du gjort samt de kurser du har tillgång till. Du har 
                tillgång till kursmaterialet 365 dagar från det att köpet har genomförts.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kvitton på dina köp hittar du under rubriken kontodetaljer/mina köp.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Använd ditt Friskvårdsbidrag
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Det går utmärkt att använda ditt friskvårdsbidrag för våra kurser. Om din arbetsgivare 
                accepterar att du köper din kurs direkt på vår hemsida så är det viktigt att du sparar 
                kvittot på ditt köp från oss som du sedan ger till din arbetsgivare. Vill din arbetsgivare 
                att ditt personnummer ska vara synligt på kvittot så ange detta vid köpet, det är inget 
                som krävs från vår sida. Denna typ av information sparas inte i våra system med hänsyn 
                till GDPR.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                🎓 Kursspecifika villkor
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">📚 Kursinnehåll och uppdateringar</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Vi förbehåller oss rätten att uppdatera och förbättra kursinnehållet för att säkerställa 
                    högsta kvalitet. Sådana uppdateringar påverkar inte dina rättigheter som kund.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">⚡ Tekniska problem</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Vid tekniska problem som påverkar din kursupplevelse erbjuder vi kostnadsfri support. 
                    Kontakta oss på info@functionalfoods.se så hjälper vi dig inom 24 timmar.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">🏥 Hälsorådgivning och ansvar</h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Våra kurser ersätter inte medicinsk rådgivning.</strong> Innehållet är utformat för 
                    allmän utbildning. Konsultera alltid din läkare innan du gör större förändringar i din 
                    kost eller livsstil. Vi ansvarar inte för hälsokonsekvenser av att följa våra råd.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Resultat och förväntningar</h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Individuella resultat kan variera.</strong> Vi kan inte garantera specifika 
                    hälsoeffekter eller viktförlust. Våra kurser ger dig verktyg och kunskap, men ditt 
                    engagemang och individuella förutsättningar påverkar resultatet.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                🔄 Ångerrätt
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Att bli kund hos Functional Foods innebär att du som kund ska känna dig trygg med 
                ditt köp. Som privatkund har du rätt till 14 dagars ångerrätt. Din ångerrätt börjar gälla 
                från det att du mottagit din bokningsbekräftelse till en kurs eller leverans av produkt. 
                Din ångerrätt upphör att gälla efter 14 dagar alternativt när du tagit del av 
                kursen/medlemskapet om detta sker innan de 14 dagarna. För att nyttja ångerrätten, 
                vänligen kontakta oss inom 14 dagar alternativt innan du påbörjar kursen/tar del av 
                materialet.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Återbetalning/kreditering sker i första hand alltid till det ursprungliga betalsättet, 
                vilket normalt sker inom 10 arbetsdagar från det att vi mottagit din förfrågan om att 
                nyttja ångerrätt.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Kontakta vår kundsupport om du har frågor:{' '}
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