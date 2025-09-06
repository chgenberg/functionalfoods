import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Force cache invalidation
    const timestamp = Date.now();
    
    // Revalidate all paths
    revalidatePath('/', 'layout');
    revalidatePath('/api/recipes/random');
    revalidateTag('recipes');
    
    // Add headers to prevent any caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    headers.set('X-Cache-Timestamp', timestamp.toString());
    
    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Cache cleared and paths revalidated',
        timestamp,
        time: new Date().toISOString()
      }),
      { 
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Force refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 