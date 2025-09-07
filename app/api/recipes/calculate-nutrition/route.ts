import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Nutrition calculation is currently disabled' }, { status: 501 });
} 