import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Läs in kursinformation
async function getCourseInfo() {
  try {
    const [basicsResponse, flowResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/functionalbasics.txt`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/functionalflow.txt`)
    ]);
    
    const basicsText = await basicsResponse.text();
    const flowText = await flowResponse.text();
    
    return { basicsText, flowText };
  } catch (error) {
    console.error('Error loading course info:', error);
    return { basicsText: '', flowText: '' };
  }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Hämta kursinformation
    const { basicsText, flowText } = await getCourseInfo();
    
    const systemPrompt = `Du är Ulrika AI:sson, en vänlig och kunnig AI-assistent för Functional Foods. 
    
Du har djup kunskap om:
- Functional foods och hur mat kan användas som medicin
- Hälsa, nutrition och välmående
- Recept och matlagning för optimal hälsa
- Longevity och livsstilsfaktorer
- Våra kurser: Functional Basics och Functional Flow

Kursinformation:
Functional Basics: ${basicsText.substring(0, 500)}...
Functional Flow: ${flowText.substring(0, 500)}...

Regler:
1. Svara ALLTID på svenska
2. Var vänlig, professionell och hjälpsam
3. Ge konkreta och praktiska råd
4. Om någon frågar om något som INTE handlar om hälsa, functional foods, nutrition, recept eller longevity, svara vänligt att du är specialiserad på dessa områden och hänvisa till hej@functionalfoods.se för andra frågor
5. Håll svaren koncisa (max 300 tokens) och avsluta aldrig mitt i en mening
6. Rekommendera gärna våra kurser när det är relevant
7. Använd emojis sparsamt men effektivt för att göra konversationen mer personlig`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || "Ursäkta, jag kunde inte generera ett svar just nu.";

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { message: "Ursäkta, något gick fel. Försök igen senare eller kontakta oss på hej@functionalfoods.se" },
      { status: 500 }
    );
  }
} 