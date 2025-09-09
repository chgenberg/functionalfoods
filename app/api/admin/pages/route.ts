import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRateLimit, apiRateLimit } from '@/app/lib/rate-limit';
import { logInfo, logError } from '@/app/lib/monitoring';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/pages - Get page configuration
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ components: [] });
  }

  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check
      const { searchParams } = new URL(request.url);
      const pageId = searchParams.get('page') || 'homepage';

      // Try to get page configuration from database
      const pageConfig = await prisma.pageConfiguration.findUnique({
        where: { pageId }
      }).catch(() => null); // Ignore if table doesn't exist yet

      if (pageConfig) {
        return NextResponse.json({
          page: pageConfig.pageId,
          components: pageConfig.components,
          lastModified: pageConfig.updatedAt
        });
      }

      // Return default configuration if none exists
      const defaultConfigs: Record<string, any[]> = {
        homepage: [
          {
            id: 'hero-1',
            type: 'hero',
            props: {
              title: 'Functional Foods med Ulrika Davidsson',
              subtitle: 'Din personliga guide till hälsosam mat och välmående',
              backgroundImage: '/Ulrika_portratt/udavidssondesktop.png'
            }
          }
        ],
        about: [
          {
            id: 'about-hero-1',
            type: 'hero',
            props: {
              title: 'Om Functional Foods',
              subtitle: 'Vår mission är att göra hälsosam mat tillgänglig för alla'
            }
          }
        ]
      };

      return NextResponse.json({
        page: pageId,
        components: defaultConfigs[pageId] || [],
        lastModified: new Date().toISOString()
      });

    } catch (error) {
      logError('Failed to get page configuration', { error });
      return NextResponse.json({
        error: 'Failed to load page configuration'
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  });
}

/**
 * POST /api/admin/pages - Save page configuration
 */
export async function POST(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: false, error: 'Not available during build' });
  }

  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check
      const { page, components } = await request.json();

      if (!page || !Array.isArray(components)) {
        return NextResponse.json({
          error: 'Invalid page data'
        }, { status: 400 });
      }

      logInfo('Saving page configuration', { page, componentCount: components.length });

      // Try to save to database (create table if it doesn't exist)
      try {
        const pageConfig = await prisma.pageConfiguration.upsert({
          where: { pageId: page },
          update: {
            components: components,
            updatedAt: new Date()
          },
          create: {
            pageId: page,
            components: components
          }
        });

        logInfo('Page configuration saved successfully', { 
          page: pageConfig.pageId,
          componentCount: components.length 
        });

        return NextResponse.json({
          success: true,
          message: `Sidan "${page}" har sparats med ${components.length} komponenter`,
          pageId: pageConfig.pageId,
          lastModified: pageConfig.updatedAt
        });

      } catch (dbError) {
        // If database table doesn't exist, save to file system as fallback
        console.warn('Database save failed, using file fallback:', dbError);
        
        const fs = require('fs');
        const path = require('path');
        
        const configDir = path.join(process.cwd(), 'data', 'page-configs');
        const configFile = path.join(configDir, `${page}.json`);
        
        // Ensure directory exists
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        
        // Save configuration to file
        const config = {
          pageId: page,
          components,
          lastModified: new Date().toISOString(),
          version: '1.0'
        };
        
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        
        logInfo('Page configuration saved to file system', { 
          page,
          file: configFile,
          componentCount: components.length 
        });

        return NextResponse.json({
          success: true,
          message: `Sidan "${page}" har sparats (filsystem)`,
          pageId: page,
          storage: 'filesystem'
        });
      }

    } catch (error) {
      logError('Failed to save page configuration', { error });
      return NextResponse.json({
        error: 'Failed to save page configuration'
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  });
} 