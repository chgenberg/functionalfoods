import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const buildTime = new Date().toISOString();
    const buildId = `build-${Date.now()}`;
    
    console.log('🔄 Force refresh requested at:', buildTime);
    
    // Clear any potential server-side caches
    if (global.gc) {
      global.gc();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cache refresh forced',
      buildTime,
      buildId,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      railway: !!process.env.RAILWAY_ENVIRONMENT
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Force-Refresh': buildTime
      }
    });
  } catch (error) {
    console.error('❌ Error in force refresh:', error);
    return NextResponse.json({
      success: false,
      error: 'Force refresh failed',
      timestamp: Date.now()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }
} 