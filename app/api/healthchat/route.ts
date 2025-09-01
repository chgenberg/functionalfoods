import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { resolveModel } from '@/app/lib/ai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Simple per-IP rate limiter (best-effort). For production multi-region, move to Upstash.
const RL_WINDOW_MS = 60_000;
const RL_MAX = 20; // 20 req/min per IP
const rlMap: Map<string, number[]> = new Map();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RL_WINDOW_MS;
  const arr = rlMap.get(ip) || [];
  const recent = arr.filter((t) => t > windowStart);
  if (recent.length >= RL_MAX) { rlMap.set(ip, recent); return true; }
  recent.push(now);
  rlMap.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json({ reply: "OpenAI not configured" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json({ reply: "Rate limit exceeded. Try again later." }, { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } });
    }

    const { messages } = await req.json();

    const systemPrompt = `\nYou are a digital health coach. \nFirst, ask for age, gender, and first name if you haven't already received it.\nThen, ask smart follow-up questions based on the user's problem and previous answers.\nWhen you have enough information, provide a concrete analysis, valuable lifestyle tips, and recommend a relevant test (e.g. Gut Microbiome, iron, vitamin D, etc) if appropriate.\nExplain why the test is important and how it relates to the user's initial problem. \nValue and education come first, sales are secondary and should be subtle.\nAlways answer in English.\n`;

    const gptMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000); // 25s timeout

    const gptResponse = await openai.chat.completions.create({
      model: resolveModel('gpt-5-mini'),
      messages: gptMessages,
      max_tokens: 800,
      timeout: 20_000 as any,
      signal: controller.signal as any,
    } as any).finally(() => clearTimeout(timeout));

    const reply = (gptResponse as any).choices?.[0]?.message?.content || "Something went wrong.";
    return NextResponse.json({ reply }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong on the server." }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}