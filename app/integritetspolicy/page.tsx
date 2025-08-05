import React from 'react';

export default function IntegritetspolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Integritetspolicy för functionalfoods.se
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Din integritet är viktig för oss och vi vill alltid vara öppna med hur vi behandlar dina
              personuppgifter för att du ska känna dig trygg när du lämnar dina uppgifter till oss. I
              denna integritetsskyddspolicy hittar du information om hur vi behandlar dina
              personuppgifter som på något sätt är kopplade till functionalfoods.se och produkter
              och tjänster som tillhandahålls via webbplatsen. Detta för att säkerställa att vi
              hanterar personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR, General
              Data Protection Regulation). Här finns även information om cookies.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Vad är personuppgifter?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Personuppgifter är information om en identifierad eller identifierbar fysisk person. En
                identifierbar fysisk person är en person som kan identifieras direkt eller indirekt, via
                ett namn, ett personnummer, platsdata, en IP-adress eller en eller flera faktorer som
                är specifika för fysiska, fysiologiska, genetiska, mentala, ekonomiska, kulturella eller
                sociala identiteten hos den fysiska personen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Vem ansvarar för dina personuppgifter?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Ulrikas Kickstart AB (org. nr 559051-3387) är personuppgiftsansvarig för de
                personuppgifter som du lämnar på denna sajt. Har du frågor om hur vi behandlar
                dina personuppgifter är du alltid välkommen att kontakta oss via e-post på{' '}
                <a href="mailto:info@functionalfoods.se" className="text-primary hover:underline">
                  info@functionalfoods.se
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Personuppgifter som vi samlar in från dig
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vi kan samla in olika typer av personuppgifter om dig som besökare i samband med
                att du besöker våra webbsidor, anmäler dig till vårt nyhetsbrev, deltar på våra event,
                köper produkter och medlemskap, svarar på enkäter eller vid andra kontakter med
                oss.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Kategorier av personuppgifter vi samlar in
              </h3>
              
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Personuppgifter</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                Den personliga informationen du tillhandahåller via vår webbplats är dels data som
                du aktivt ger oss. Det kan handla om uppgifter som du skickar till oss via ett
                kontaktformulär, en anmälan för ett event, en online chat, eller liknande funktioner på
                hemsidan, och då fyller i ditt namn, din e-postadress, ditt telefonnummer eller
                liknande uppgifter.
              </p>

              <h4 className="text-lg font-semibold text-gray-800 mb-2">Webbaktivitet</h4>
              <p className="text-gray-700 leading-relaxed">
                Vi samlar själva in uppgifter om hur du som besökare använder webbplatsen, och i
                samband med det sparas din IP-adress, din ungefärliga position, information om
                dina webbläsarinställningar och hur ditt operativsystem använder sidorna. Denna
                information behandlas med stöd av en intresseavvägning och används för att
                utveckla webbplatsens funktioner och innehåll.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Varför vi behandlar dina personuppgifter
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vi använder dina personuppgifter för olika ändamål. Den information du själv lämnar
                till oss eller som vi samlar in kan användas för att:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Kontakta dig via e-post eller telefonnummer (om du fyller i det i kontaktformuläret)</li>
                <li>Förbättra vår hemsida</li>
                <li>Förbättra vår kundservice</li>
                <li>Information och marknadsföring kring våra tjänster och produkter</li>
              </ul>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Vilka personuppgifter vi använder beror på ändamålet. Nedan följer våra olika
                ändamål för personuppgiftsbehandling:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">WEBBESÖKARE:</h4>
                <p className="text-gray-700">
                  Enhetsinformation som t ex IP-adress och språkinställningar för att du ska få så 
                  bra upplevelse som möjligt vid ditt besök på functionalfoods.se.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">KUND/MEDLEM:</h4>
                <p className="text-gray-700">
                  Vi samlar in den information vi behöver för att kunna fullgöra våra åtaganden 
                  gentemot dig. Exempelvis för att kunna leverera produkter men också för att 
                  kunna fullgöra skyldigheter enligt myndighetskrav.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Hur vi delar dina personuppgifter
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Vi delar inga uppgifter med tredje part annat än vi är skyldiga till enligt lag såvida du
                inte särskilt tillfrågats och godkänt att vi delar den. Det skulle exempelvis kunna röra
                sig om att dela information med en samarbetspartner till oss.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Rättslig grund, lagring och gallring av personuppgifter
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                I och med att du lämnar uppgifter till oss så ger du din tillåtelse till att vi registrerar
                och lagrar uppgifterna samt enbart behandlar de angivna personuppgifterna för
                angivna ändamål. Som legal grund för behandling kommer vi att hänvisa till
                uppfyllande av avtal, berättigat intresse eller samtycke. Om vi använder oss av
                berättigat intresse som grund, kommer det endast att göras i de syften som angetts
                ovan.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Observera att du närsomhelst kan återkalla ditt samtycke genom att kontakta oss.
                Behandlingen sker enligt gällande lagstiftning och innebär att personuppgifter inte
                bevaras under en längre tid än vad som är nödvändigt med hänsyn till ändamålen
                med behandlingen. Vid all hantering av personuppgifter iakttas alltid hög säkerhet
                och sekretess.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Dina rättigheter
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Om du vill få insyn i din personuppgiftsbehandling har du rätt att begära att få tillgång
                till dina uppgifter. Om vi mottar en begäran om tillgång kan vi komma att fråga om
                ytterligare uppgifter för att säkerställa att vi lämnar ut uppgifterna till rätt person. Du
                har också alltid rätt att begära att dina personuppgifter rättas. Vi kommer alltid att
                radera dina uppgifter i den utsträckning som krävs enligt tillämplig lag och vi kommer
                självklart alltid göra vårt bästa för att tillmötesgå din begäran om radering. Du har
                också rätt att invända mot vår behandling (till exempel den behandling som baseras
                på våra berättigade intressen) eller begära att få de uppgifter som du har lämnat till
                oss överförda till en annan personuppgiftsansvarig (så kallad dataportabilitet).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Dina personuppgifter får inte behandlas för direktmarknadsföring eller profilering om
                du motsätter dig sådan behandling. Du har också rätt att när som helst återkalla ett
                lämnat samtycke, t ex det samtycke som du som privatperson lämnar när du börjar
                prenumerera på vårt nyhetsbrev.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vi strävar efter att all den information som vi behandlar ska vara korrekt. Detta gäller
                givetvis även de personuppgifter vi samlar in. För den händelse någon uppgift visar
                sig felaktig sker rättelse utan dröjsmål. Du har givetvis rätt att ta del av de uppgifter
                som vi registrerat om dig. Om du vill ta del av dessa uppgifter eller har andra frågor
                rörande vår behandling av personuppgifter ber vi dig kontakta oss via uppgifterna
                längst ner. Du har rätten att återkalla ditt samtycke till behandling av personuppgifter
                och att förbjuda användningen av din personliga information för direkt
                marknadsföring.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Du kan när som helst avbryta din prenumeration på vårt nyhetsbrev genom att följa
                anvisningarna längst ner i varje nyhetsbrev.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Du har också rätten att lämna eventuella klagomål om behandling av dina
                personuppgifter till den nationella tillsynsmyndigheten Datainspektionen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                IT-leverantörer
              </h2>
              <p className="text-gray-700 leading-relaxed">
                För att tekniskt kunna behandla dina personuppgifter kommer de att överföras till de
                IT-leverantörer som tillhandahåller våra plattformar. I dessa fall har vi ställt krav på
                leverantören för att försäkra oss om att de hanterar uppgifterna på ett bra och säkert
                sätt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Informationsskydd
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Vi vidtar nödvändiga säkerhetsåtgärder för att skydda dina personliga uppgifter. Vi
                använder oss av kryptering på vår hemsida. Endast medarbetare som ska uträtta ett
                specifikt jobb (t.ex. fakturering eller kundservice), får tillgång till personligt
                identifierbar information. De datorer/servrar som används för att lagra personligt
                identifierbar information lagras i en säker miljö hos en betrodd partner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                E-handelssäkerhet
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Vi är de enda som äger informationen som samlas in på den här webbplatsen. Din
                personligt identifierbara information kommer inte att säljas, utbytas, överföras eller
                delas vidare till något annat företag, i något syfte, utan ditt samtycke, förutom då så
                krävs för att uppfylla en begäran och/eller överföring, t.ex. för att skicka en
                beställning.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Externa aktörer
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Ulrikas Kickstart AB är inte ansvariga för externa aktörers egen behandling av
                personuppgifter. Vi har däremot möjlighet att ställa krav på hur dessa organisationer
                ska bedriva sin verksamhet när de gör så på uppdrag av Ulrikas Kickstart AB.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Klagomål och tillsynsmyndighet
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Om du anser att vi har hanterat dina personuppgifter på ett felaktigt sätt har du rätt
                att framställa klagomål till Datainspektionen som är tillsynsmyndighet för
                personuppgiftsbehandling.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Länkar till tredje part
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Vi kan publicera eller erbjuda information eller produkter från tredje part på vår
                hemsida. Dessa tredje parts webbplatser har sina egna, oberoende sekretessregler. 
                Vi tar inget ansvar för innehållet och aktiviteterna på dessa länkade webbplatser.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Ändringar i denna integritetspolicy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Vi förbehåller oss rätten att uppdatera eller ändra denna policy när som helst och du
                bör regelbundet besöka denna webbplats för att få den senaste versionen.
              </p>
            </section>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-gray-700 mb-2"><strong>Publicerad:</strong> 2024-11-01</p>
              <p className="text-gray-700"><strong>Senast uppdaterad:</strong> 2025-02-21</p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Hur kontaktar ni oss?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Om du har några frågor angående denna integritetspolicy, vår behandling av
                personuppgifter eller vill kontakta oss angående dina personuppgifter så hör du av
                dig till oss och ber att få komma i kontakt med den hos oss som är
                dataskyddsansvarig (DPO).
              </p>
              <p className="text-gray-700 leading-relaxed">
                Kontakta oss via e-post{' '}
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