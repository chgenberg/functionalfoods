import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ulrika Davidssons skrivstil och tonalitet
const ULRIKA_STYLE_PROMPT = `
Du är Ulrika Davidsson, en erfaren kostrådgivare och hälsoexpert som skriver böcker om funktionell kost och hälsa. 
Din skrivstil kännetecknas av:

- Varmt, personligt och inkluderande språk
- Vetenskapligt grundad information presenterad på ett lättförståeligt sätt
- Praktiska tips och handlingsbara råd
- Holistiskt synsätt på hälsa - kropp, själ och miljö
- Inspirerande och motiverande ton
- Svensk terminologi och kulturella referenser
- Balans mellan expertis och tillgänglighet
- Fokus på långsiktig hälsa och livsstilsförändringar
- Entuasiasm för naturlig healing och functional foods

Skriv alltid på svenska och använd en vänlig, professionell men personlig ton.
`;

interface GenerateBookRequest {
  title: string;
  topic: string;
  chapters: number;
  currentChapter?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateBookRequest = await request.json();
    const { title, topic, chapters, currentChapter = 1 } = body;

    if (!title || !topic || !chapters) {
      return NextResponse.json(
        { error: "Titel, ämne och antal kapitel krävs" },
        { status: 400 }
      );
    }

    // Generera innehållsförteckning först om det är första kapitlet
    if (currentChapter === 1) {
      const tocPrompt = `
      ${ULRIKA_STYLE_PROMPT}
      
      Skapa en innehållsförteckning för en bok med titeln "${title}" som handlar om ${topic}. 
      Boken ska ha ${chapters} kapitel. 
      
      Format: Lista endast kapiteltitlarna, ett per rad, numrerade 1-${chapters}.
      Gör titlarna engagerande och relevanta för ämnet.
      `;

      const tocCompletion = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [{ role: "user", content: tocPrompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const tableOfContents = tocCompletion.choices[0]?.message?.content || "";
      
      return NextResponse.json({
        type: "table_of_contents",
        content: tableOfContents,
        currentChapter: 1,
        totalChapters: chapters
      });
    }

    // Generera specifikt kapitel
    const chapterPrompt = `
    ${ULRIKA_STYLE_PROMPT}
    
    Skriv kapitel ${currentChapter} för boken "${title}" som handlar om ${topic}.
    Detta är kapitel ${currentChapter} av totalt ${chapters} kapitel.
    
    Kapitlet ska vara:
    - Cirka 1500-2000 ord långt
    - Välstrukturerat med underrubriker
    - Innehålla praktiska råd och tips
    - Ha en tydlig röd tråd
    - Passa in i den övergripande bokstrukturen
    - Inkludera relevanta exempel och cases
    
    Börja kapitlet med en kort introduktion och avsluta med en sammanfattning eller reflektion.
    Använd ditt expertområde inom funktionell kost och hälsa.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{ role: "user", content: chapterPrompt }],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const chapterContent = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      type: "chapter",
      content: chapterContent,
      currentChapter,
      totalChapters: chapters,
      isComplete: currentChapter === chapters
    });

  } catch (error) {
    console.error("Fel vid bokgenerering:", error);
    return NextResponse.json(
      { error: "Kunde inte generera bok" },
      { status: 500 }
    );
  }
} 