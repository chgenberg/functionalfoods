import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';
import { AnalysisResult } from '@/app/types';
import { prisma } from '@/app/lib/database';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}

// Använd miljövariabeln för API-nyckeln
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

function getUserIdFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded.userId as string;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bodyPart, description, answers } = await req.json();

    // Hämta användare från token (om inloggad)
    const authorization = req.headers.get('authorization');
    let userId = null;
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      userId = getUserIdFromToken(token);
    }

    // Mock analysis function - returns realistic results based on input
    const generateMockAnalysis = (bodyPart: string, description: string, answers: string[]): AnalysisResult => {
      const bodyPartAnalysis: Record<string, any> = {
        huvud: {
          summary: "Du upplever huvudvärk som kan vara relaterad till stress, dehydrering eller spänning i nacke och axlar. Din beskrivning tyder på att det kan finnas livsstilsfaktorer som påverkar dina besvär.",
          recommendations: [
            "Drick mer vatten - minst 2-3 liter per dag",
            "Implementera stresshanteringstekniker som meditation eller djupandning",
            "Kontrollera din sömnkvalitet och sträva efter 7-8 timmar per natt",
            "Överväg magnesiumtillskott för muskelavslappning"
          ],
          functionalFoods: [
            "Ingefära - naturlig smärtlindring och antiinflammatorisk",
            "Mörk choklad (70%+) - innehåller magnesium",
            "Mandlar och valnötter - rika på magnesium",
            "Fet fisk - omega-3 för att minska inflammation",
            "Körsbär - naturligt melatonin för bättre sömn"
          ],
          lifestyleChanges: [
            "Gör regelbundna pauser från skärmarbete",
            "Stretcha nacke och axlar dagligen",
            "Undvik för mycket koffein, särskilt på eftermiddagen",
            "Skapa en avslappnande kvällsrutin"
          ]
        },
        mage: {
          summary: "Dina magbesvär kan vara relaterade till stress, kosthållning eller tarmhälsa. Symtomen tyder på att din matsmältning kan förbättras genom kostförändringar och stresshantering.",
          recommendations: [
            "Inkludera mer probiotika i din kost för bättre tarmhälsa",
            "Ät långsammare och tugga maten ordentligt",
            "Undvik mat som utlöser besvär",
            "Överväg att föra en matdagbok"
          ],
          functionalFoods: [
            "Fermenterade livsmedel (kimchi, kefir, surkål)",
            "Ingefära - lugnar magen och hjälper matsmältningen",
            "Kamomillte - antiinflammatorisk och lugnande",
            "Havregryn - innehåller lösliga fibrer",
            "Bananer - lätta att smälta och innehåller kalium"
          ],
          lifestyleChanges: [
            "Ät mindre måltider oftare",
            "Undvik att äta sent på kvällen",
            "Minska stress genom meditation eller yoga",
            "Drick vatten mellan måltider, inte under"
          ]
        },
        rygg: {
          summary: "Dina ryggbesvär kan bero på hållning, muskelspänningar eller brist på rörlighet. En kombination av stärkande övningar och antiinflammatorisk kost kan hjälpa.",
          recommendations: [
            "Stärk dina kärnmuskler med riktade övningar",
            "Förbättra din ergonomi på arbetsplatsen",
            "Inkludera antiinflammatoriska livsmedel i kosten",
            "Sträck ut regelbundet under dagen"
          ],
          functionalFoods: [
            "Körsbär - naturliga antiinflammatoriska egenskaper",
            "Fet fisk - omega-3 för att minska inflammation",
            "Kurkuma - kraftfull antiinflammatorisk krydda",
            "Gröna bladgrönsaker - rika på magnesium",
            "Bär - antioxidanter som bekämpar inflammation"
          ],
          lifestyleChanges: [
            "Gör dagliga stretchingövningar",
            "Använd ergonomiska hjälpmedel",
            "Ta regelbundna rörelsepausen",
            "Sov på en stödjande madrass"
          ]
        }
      };

      // Get analysis for specific body part or use general analysis
      const analysis = bodyPartAnalysis[bodyPart] || bodyPartAnalysis.huvud;
      
      // Customize based on description and answers
      if (description.toLowerCase().includes('stress')) {
        analysis.recommendations.unshift("Prioritera stresshantering - detta verkar vara en viktig faktor");
        analysis.lifestyleChanges.unshift("Implementera daglig meditation eller mindfulness");
      }
      
      if (description.toLowerCase().includes('sömn')) {
        analysis.recommendations.push("Förbättra din sömnhygien");
        analysis.functionalFoods.push("Kamomillte - främjar avslappning och sömn");
      }

      return analysis;
    };

    const analysisResult = generateMockAnalysis(bodyPart, description, answers);

    // Spara symptomanalys i databasen om användaren är inloggad
    if (userId) {
      try {
        await prisma.symptomAnalysis.create({
          data: {
            userId,
            bodyPart,
            description,
            analysis: analysisResult as any
          }
        });
      } catch (dbError) {
        console.error('Failed to save symptom analysis to database:', dbError);
        // Fortsätt ändå, returnera resultatet även om DB-sparningen misslyckades
      }
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: 'Failed to analyze responses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}