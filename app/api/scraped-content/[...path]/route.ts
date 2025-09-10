import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Fallback content for common documents
const getFallbackContent = (filename: string) => {
  const fallbacks: Record<string, string> = {
    "functional-foods-3-steg-till-ett-friskare-liv.txt": `
Här är tre enkla steg för att komma igång med Functional Foods:

**1. Börja med grunderna**
Fokusera på näringsrika, naturliga livsmedel som ger kroppen de byggstenar den behöver.

**2. Planera dina måltider**  
Förbered dig för veckan genom att planera måltider och handla smart.

**3. Var konsekvent**
Små förändringar över tid ger stora resultat. Håll dig till dina nya vanor.

Genom att följa dessa steg kommer du att märka positiva förändringar i din energi, hälsa och välmående.`,
    
    "functional-foods-topplista.txt": `
Här är några av de bästa functional foods att inkludera i din kost:

**Grönsaker:**
• Grönkål och spenat (rika på järn och folsyra)
• Broccoli och blomkål (antioxidanter)  
• Rödbetor (nitrater för blodcirkulation)

**Proteiner:**
• Lax och fet fisk (omega-3)
• Ägg (komplett protein)
• Baljväxter (fiber och protein)

**Fetter:**
• Avokado (enkelomättade fetter)
• Nötter och frön (E-vitamin och magnesium)
• Olivolja (antiinflammatoriska egenskaper)

Dessa livsmedel ger inte bara näring utan har också specifika hälsofördelar.`,
    
    "periodisk-fasta-ger-klarhet-och-energi.txt": `
Periodisk fasta, särskilt 16:8-metoden, kan ge flera hälsofördelar:

**Fördelar:**
• Förbättrad insulinkänslighet
• Ökad mental klarhet
• Bättre energinivåer
• Förenklad måltidsplanering

**Så här gör du:**
• Ät inom en 8-timmarsperiod (t.ex. 12:00-20:00)
• Fasta i 16 timmar (inklusive sömn)
• Drick vatten, te eller kaffe under fasteperioden

**Tips:**
• Börja gradvis
• Lyssna på din kropp
• Anpassa efter dina behov

Kom ihåg att periodisk fasta inte passar alla, så konsultera gärna en vårdgivare först.`,
    
    "reflektion-vecka-3.txt": `
Nu har du kommit halvvägs i din resa med Functional Foods! Det är dags att reflektera över dina framsteg.

**Frågor att fundera över:**

• Vilka förändringar märker du i din energi?
• Hur känns det att äta mer näringsrik mat?
• Vilka recept har blivit dina favoriter?
• Vad har varit mest utmanande hittills?

**Dina framsteg:**
• Du har lärt dig grunderna i functional foods
• Du har provat nya, näringsrika recept
• Du har börjat bygga hälsosamma vanor

**Nästa steg:**
• Fortsätt med dina nya vanor
• Experimentera med fler recept
• Lyssna på din kropp och anpassa efter behov

Kom ihåg att varje liten förändring räknas. Du gör fantastiskt!`,

    "maldokument-styrelsemote-1.txt": `
Välkommen till att sätta upp dina hälsomål!

**Dina hälsomål för kursen:**

1. **Energimål:** Vad vill du uppnå gällande din energi?
   - Mer stabil energi under dagen
   - Bättre morgonenergi
   - Mindre eftermiddagstråkighet

2. **Kostmål:** Vilka kostvanor vill du utveckla?
   - Äta mer grönsaker
   - Minska socker och processat
   - Planera måltider bättre

3. **Välmående:** Hur vill du må?
   - Bättre sömn
   - Mindre stress
   - Förbättrad matsmältning

**Skriv ner dina mål och kom tillbaka till dem regelbundet för att följa dina framsteg.**`,

    "motivation-och-reflektion.txt": `
**Håll motivationen uppe**

Att förändra kostvanor kan vara utmanande. Här är tips för att hålla motivationen:

**När det känns svårt:**
• Kom ihåg varför du startade
• Fokusera på små framsteg
• Var snäll mot dig själv
• Planera för framgång

**Fira dina framsteg:**
• Mer energi under dagen
• Bättre sömn på natten
• Klarare hud
• Förbättrad matsmältning

**Kom ihåg:**
Förändring tar tid. Var tålmodig och konsekvent. Varje hälsosam måltid är ett steg framåt.

Du gör fantastiskt! Fortsätt så här.`,

    "benbuljong.txt": `
**Benbuljong - Naturens egen superfood**

Benbuljong är rik på kollagen, mineraler och aminosyror som stödjer:

**Hälsofördelar:**
• Stärker leder och ben
• Förbättrar hudhälsa
• Stödjer matsmältningen
• Ger viktiga mineraler

**Så här gör du:**
1. Använd ben från gräsmatade djur
2. Koka på låg värme i 12-24 timmar
3. Tillsätt äppelcidervinäger för att dra ut mineraler
4. Krydda med salt, peppar och örter

**Tips:**
• Frys i portioner
• Använd som bas i soppa
• Drick som varm dryck
• Perfekt när du känner dig krasslig

En kopp benbuljong om dagen kan göra stor skillnad för din hälsa!`,

    "drycker.txt": `
**Hälsosamma dryckesval**

Vad du dricker är lika viktigt som vad du äter:

**Bästa alternativen:**
• **Vatten** - kroppens viktigaste behov
• **Örtte** - antioxidanter utan koffein  
• **Grönt te** - metabolism och antioxidanter
• **Benbuljong** - näringsrik och mättande
• **Kombucha** - probiotika för tarmhälsan

**Begränsa:**
• Socker-drycker
• Alkohol
• För mycket kaffe
• Konstgjorda sötningsmedel

**Tips:**
• Börja dagen med ett stort glas vatten
• Smaksätt vatten med citron eller gurka
• Byt ut en kaffe mot örtte
• Drick vatten före måltider

Rätt dryckesval stödjer din hälsoresa!`,

    "superpulver.txt": `
**Superpulver för extra näring**

Superpulver kan vara ett bra komplement till din kost:

**Populära alternativ:**
• **Spirulina** - Rik på protein och B-vitaminer
• **Chlorella** - Detox och antioxidanter
• **Maca** - Energi och hormonbalans
• **Matcha** - Antioxidanter och mild koffein
• **Collagenpulver** - Hud, hår och leder

**Så här använder du dem:**
• Blanda i smoothies
• Rör i yoghurt eller havregröt
• Tillsätt i pannkakor eller muffins
• Gör en näringsrik latte

**Tips:**
• Börja med små mängder
• Välj ekologiska och rena produkter
• Kombinera med mat för bättre upptag
• Lyssna på din kropp

Superpulver är ett enkelt sätt att höja näringsvärdet i din mat!`,

    "fragor-och-svar.txt": `
**Vanliga frågor om Functional Foods**

**Vad är functional foods?**
Functional foods är näringsrika livsmedel som ger specifika hälsofördelar utöver grundläggande näring.

**Hur snabbt märker jag skillnad?**
Många märker förbättringar inom 1-2 veckor, men långsiktiga förändringar tar ofta 4-6 veckor.

**Kan jag äta ute och hålla mig till konceptet?**
Ja! Välj grillad fisk/kött, extra grönsaker, och undvik friterat och socker.

**Vad gör jag om jag blir sugen på socker?**
Ät protein och fett först, drick vatten, och ha nyttiga snacks tillgängliga.

**Behöver jag kosttillskott?**
En välbalanserad functional foods-kost ger det mesta, men vissa tillskott kan vara bra.

**Passar detta för hela familjen?**
Ja! Functional foods är hälsosamt för alla åldrar, anpassa bara portionerna.`,

    "dags-att-komma-igang.txt": `
**Dags att komma igång med din hälsoresa!**

Grattis till att du har tagit det första steget mot bättre hälsa!

**Vad du kan förvänta dig:**
• Mer stabil energi under dagen
• Bättre sömn och återhämtning
• Förbättrad matsmältning
• Klarare hud och starkare hår
• Bättre humör och mental klarhet

**Dina första steg:**
1. **Planera** - Titta igenom veckans kostschema
2. **Handla** - Använd inköpslistorna
3. **Förbered** - Laga mat i förväg när det går
4. **Var tålmodig** - Förändring tar tid

**Kom ihåg:**
• Det är okej att göra misstag
• Små steg leder till stora förändringar  
• Du har allt du behöver för att lyckas
• Vi finns här för att stödja dig

Lycka till på din resa mot bättre hälsa!`,

    "att-valja-ratt-kolhydrater.txt": `
**Att välja rätt kolhydrater**

Alla kolhydrater är inte skapade lika. Här lär du dig välja de bästa:

**Bra kolhydrater:**
• **Grönsaker** - Spenat, broccoli, paprika
• **Rotfrukter** - Sötpotatis, morötter, rödbetor
• **Baljväxter** - Linser, kikärtor, svarta bönor
• **Quinoa och bovete** - Glutenfria spannmål
• **Bär** - Blåbär, hallon, jordgubbar

**Undvik eller begränsa:**
• Vitt bröd och pasta
• Socker och godis
• Läsk och söta drycker
• Processade snacks
• Vita ris

**Tips för bättre blodsockerkontroll:**
• Ät kolhydrater med protein och fett
• Välj färgglada grönsaker
• Ät bär istället för andra frukter
• Testa 16:8 fasta för bättre insulinkänslighet

Rätt kolhydrater ger långvarig energi utan blodsockertoppar!`,

    "att-valja-ratt-proteiner.txt": `
**Att välja rätt proteiner**

Protein är viktigt för muskler, hormoner och mättnadskänsla:

**Högkvalitativa proteiner:**
• **Fisk och skaldjur** - Lax, makrill, räkor
• **Kött** - Gräsmatat nöt, lamm, vilt
• **Fågel** - Kyckling, kalkon (ekologisk)
• **Ägg** - Från frigående höns
• **Vegetariska** - Linser, quinoa, hampfrön

**Mängd per måltid:**
• 20-30g protein per måltid
• Ungefär handflatstorleken kött/fisk
• 2-3 ägg eller 1 dl linser

**Tips:**
• Variera proteinkällorna
• Ät protein till varje måltid
• Välj ekologiskt när möjligt
• Kombinera vegetariska proteiner

**Fördelar:**
• Stabil energi
• Bättre mättnadskänsla
• Starkare muskler
• Bättre återhämtning

Rätt protein hjälper kroppen att fungera optimalt!`,

    "ersattningsguide-for-kolhydrater.txt": `
**Ersättningsguide för kolhydrater**

Byt ut tunga kolhydrater mot näringsrika alternativ:

**Istället för pasta:**
• Zucchininudlar (spiraliserad zucchini)
• Shirataki-nudlar (konjacrot)
• Spaghetti squash
• Kelp-nudlar

**Istället för ris:**
• Blomkålsris
• Broccoli-ris  
• Quinoa (i mindre mängder)
• Hackade champinjoner

**Istället för potatis:**
• Rostad blomkål
• Sötpotatis (måttligt)
• Rostad rädisa
• Palsternacka

**Istället för bröd:**
• Salladsblad som wrap
• Portobello-svamp
• Aubergine-skivor
• Kokosmjöl-pannkakor

**Tips:**
• Experimentera med olika alternativ
• Krydda väl för bättre smak
• Kombinera med goda fetter
• Var kreativ i köket

Dessa byten minskar kolhydratintaget utan att offra smak!`,

    "functional-foods-som-livsstil.txt": `
**Functional Foods som livsstil**

Att göra functional foods till en livsstil handlar om långsiktiga förändringar:

**Grundprinciper:**
• **80/20-regeln** - Ät nyttigt 80% av tiden
• **Planering** - Förbered måltider i förväg
• **Flexibilitet** - Anpassa efter livssituation
• **Glädje** - Njut av maten du äter

**Långsiktiga strategier:**
• Hitta recept du älskar
• Involvera familj och vänner
• Lär dig laga mat från grunden
• Fokusera på hur du mår, inte bara vikt

**När livet kommer emellan:**
• Ha enkla go-to-måltider
• Håll nyttiga snacks hemma
• Gör ditt bästa, var inte perfekt
• Kom tillbaka på spåret nästa måltid

**Fördelar på lång sikt:**
• Stabil vikt utan diet
• Mer energi och bättre hälsa
• Starkare immunförsvar
• Bättre åldrande

Functional foods är inte en diet - det är ett sätt att leva!`
  };

  const title = filename.replace('.txt', '').replace(/-/g, ' ');
  
  return fallbacks[filename] || `
Detta dokument är för närvarande inte tillgängligt, men här är några allmänna råd:

**${title.charAt(0).toUpperCase() + title.slice(1)}**

Vi arbetar på att göra detta innehåll tillgängligt. Under tiden kan du:

• Fortsätta följa ditt kostschema
• Fokusera på näringsrika, naturliga livsmedel  
• Planera dina måltider i förväg
• Lyssna på din kropp och dess behov

För mer information, besök vår kunskapsbank eller kontakta oss via info@functionalfoods.se.`;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = join(process.cwd(), 'public', 'scraped_content_basic', filePath);
    
    try {
      const content = await readFile(fullPath, 'utf-8');
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (fileError) {
      // File not found, return fallback content
      console.log(`📄 File not found: ${filePath}, returning fallback content`);
      const fallbackContent = getFallbackContent(filePath);
      
      return new NextResponse(fallbackContent, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=1800' // Shorter cache for fallback
        }
      });
    }
  } catch (error) {
    console.error('Error in scraped-content API:', error);
    const filePath = params.path?.join('/') || 'unknown';
    const fallbackContent = getFallbackContent(filePath);
    
    return new NextResponse(fallbackContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
} 