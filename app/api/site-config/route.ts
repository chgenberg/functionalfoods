import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/site-config - Get current site configuration for frontend
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      siteName: 'Functional Foods',
      primaryColor: '#014421',
      secondaryColor: '#93C560',
      contactEmail: 'info@functionalfoods.se',
      maintenanceMode: false
    });
  }

  try {
    // Get all settings from database
    const settings = await prisma.siteSettings.findMany().catch(() => []);

    // Convert to frontend-friendly format
    const config = {
      siteName: settings.find(s => s.key === 'site.name')?.value || 'Functional Foods',
      primaryColor: settings.find(s => s.key === 'colors.primary')?.value || '#014421',
      secondaryColor: settings.find(s => s.key === 'colors.secondary')?.value || '#93C560',
      contactEmail: settings.find(s => s.key === 'site.email')?.value || 'info@functionalfoods.se',
      maintenanceMode: settings.find(s => s.key === 'site.maintenance')?.value === 'true',
      lastUpdated: settings.length > 0 ? Math.max(...settings.map(s => new Date(s.updatedAt).getTime())) : Date.now()
    };

    // Cache for 5 minutes
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Failed to get site configuration:', error);
    
    // Return defaults on error
    return NextResponse.json({
      siteName: 'Functional Foods',
      primaryColor: '#014421',
      secondaryColor: '#93C560', 
      contactEmail: 'info@functionalfoods.se',
      maintenanceMode: false
    });
  } finally {
    await prisma.$disconnect();
  }
} 