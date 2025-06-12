import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from '@vercel/blob';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ULRIKA_STYLE_PROMPT = `
Du är Ulrika Davidsson, en erfaren kostrådgivare och hälsoexpert som skriver blogginlägg om funktionell kost och hälsa. 
Din skrivstil kännetecknas av:
- Varmt, personligt och inkluderande språk
- Vetenskapligt grundad information presenterad på ett lättförståeligt sätt
- Praktiska tips och handlingsbara råd ("testa detta", "mitt bästa tips")
- Inspirerande och motiverande ton
- Svensk terminologi
- Fokus på långsiktig hälsa och livsstilsförändringar
- Entusiasm för naturlig healing och functional foods
- Alltid på svenska.

Svara ALLTID med enbart ett JSON-objekt, utan extra text eller markdown.
`;

interface GenerateArticleRequest {
  topic: string;
  keywords?: string;
}

// Funktion för att få en slumpmässig tid på dagen (mellan 08:00 och 18:00)
const getRandomTime = () => {
  const hour = Math.floor(Math.random() * 10) + 8; // 8-17
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return { hour, minute, second };
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateArticleRequest = await request.json();
    const { topic, keywords } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Ämne för artikeln krävs" },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Inget administratörskonto hittades för att tilldela som författare." },
        { status: 500 }
      );
    }

    const articlePrompt = `
    ${ULRIKA_STYLE_PROMPT}
    
    Skapa ett blogginlägg om "${topic}".
    Om nyckelord är angivna, väv in dem naturligt. Nyckelord: ${keywords || 'inga specifika angivna'}.

    Ditt svar måste vara ett JSON-objekt med följande struktur:
    {
      "title": "En engagerande och SEO-vänlig titel (max 60 tecken)",
      "slug": "en-url-vanlig-slug-for-artikeln",
      "content": "Hela artikeltexten i Markdown-format. Använd ## för H2-rubriker. Ca 500-800 ord.",
      "metaTitle": "En SEO-optimerad metatitel (max 60 tecken)",
      "metaDesc": "En lockande och SEO-vänlig metabeskrivning (max 160 tecken)",
      "imagePrompt": "En kort, beskrivande prompt för DALL-E 3 att skapa en fotorealistisk bild som representerar artikeln. T.ex. 'En färgstark och hälsosam salladsskål på ett rustikt träbord, fotograferad uppifrån'."
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{ role: "user", content: articlePrompt }],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.8,
    });

    const responseString = completion.choices[0]?.message?.content;
    if (!responseString) {
        throw new Error("Fick inget svar från OpenAI");
    }

    const articleData = JSON.parse(responseString);

    // Generera bild med DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: articleData.imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) {
        throw new Error("Kunde inte generera bild med DALL-E 3 eller hitta bild-URL i svaret.");
    }

    // Ladda ner bilden från OpenAI och ladda upp till Vercel Blob
    const imageFetch = await fetch(imageUrl);
    const imageBlob = await imageFetch.blob();
    const blob = await put(`${articleData.slug}-${Date.now()}.png`, imageBlob, {
      access: 'public',
    });

    // Schemalägg publicering (slumpmässig dag och tid inom nästa vecka)
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + Math.floor(Math.random() * 7)); // 0-6 dagar framåt
    const { hour, minute, second } = getRandomTime();
    scheduledAt.setUTCHours(hour, minute, second, 0);

    // Spara i databasen
    const newBlogPost = await prisma.blogPost.create({
        data: {
            title: articleData.title,
            slug: articleData.slug,
            content: articleData.content,
            imageUrl: blob.url,
            imageAlt: articleData.imagePrompt, // Använder prompten som alt-text
            metaTitle: articleData.metaTitle,
            metaDesc: articleData.metaDesc,
            status: 'scheduled',
            scheduledAt: scheduledAt,
            authorId: adminUser.id,
        }
    });

    return NextResponse.json(newBlogPost);

  } catch (error) {
    console.error("Fel vid artikelgenerering:", error);
    let errorMessage = "Kunde inte generera artikel";
    let errorDetails: any = {};

    if (error instanceof SyntaxError) { // JSON parse error
        errorMessage = "Kunde inte tolka svaret från OpenAI.";
        errorDetails = { details: error.message };
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, ...errorDetails },
      { status: 500 }
    );
  }
} 