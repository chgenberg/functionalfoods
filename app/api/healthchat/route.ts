import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `
You are a digital health coach. 
First, ask for age, gender, and first name if you haven't already received it.
Then, ask smart follow-up questions based on the user's problem and previous answers.
When you have enough information, provide a concrete analysis, valuable lifestyle tips, and recommend a relevant test (e.g. Gut Microbiome, iron, vitamin D, etc) if appropriate.
Explain why the test is important and how it relates to the user's initial problem. 
Value and education come first, sales are secondary and should be subtle.
Always answer in English.
`;

    const gptMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Byt till "gpt-4" om du har tillgång
      messages: gptMessages,
      max_tokens: 400,
    });

    const reply = gptResponse.choices[0]?.message?.content || "Something went wrong.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong on the server." }, { status: 500 });
  }
}