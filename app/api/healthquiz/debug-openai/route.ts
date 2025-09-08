import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
  const model = process.env.OPENAI_MODEL || process.env.NEXT_PUBLIC_OPENAI_CHAT_MODEL || 'gpt-4o-mini';
  return NextResponse.json({ hasKey, model });
} 