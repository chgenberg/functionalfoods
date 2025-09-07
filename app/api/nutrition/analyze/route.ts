import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Nutrition analysis is currently disabled' }, { status: 501 });
} 