import { NextResponse } from 'next/server';

/**
 * Simple health check endpoint for Railway
 * Returns OK immediately without checking external services
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

export async function HEAD() {
  return new Response(null, { 
    status: 200,
    headers: {
      'X-Health-Status': 'ok'
    }
  });
} 