import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRateLimit, apiRateLimit } from '@/app/lib/rate-limit';
import { withAdminAuth } from '@/app/lib/admin-auth';
import { logInfo, logError } from '@/app/lib/monitoring';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/settings - Get all site settings
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ settings: {} });
  }

  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check

      // Get all settings from database
      const settings = await prisma.siteSettings.findMany().catch(() => []);

      // Convert to key-value object
      const settingsMap = settings.reduce((acc, setting) => {
        let value = setting.value;
        
        // Parse based on type
        if (setting.type === 'boolean') {
          value = setting.value === 'true';
        } else if (setting.type === 'number') {
          value = parseFloat(setting.value);
        } else if (setting.type === 'json') {
          try {
            value = JSON.parse(setting.value);
          } catch {
            value = setting.value;
          }
        }
        
        acc[setting.key] = {
          value,
          type: setting.type,
          description: setting.description,
          updatedAt: setting.updatedAt
        };
        
        return acc;
      }, {} as Record<string, any>);

      // Add default settings if none exist
      if (Object.keys(settingsMap).length === 0) {
        const defaultSettings = {
          'site.name': {
            value: 'Functional Foods',
            type: 'text',
            description: 'Webbplatsens namn'
          },
          'site.email': {
            value: 'info@functionalfoods.se',
            type: 'text', 
            description: 'Primär kontakt-email'
          },
          'site.maintenance': {
            value: false,
            type: 'boolean',
            description: 'Underhållsläge aktiverat'
          },
          'colors.primary': {
            value: '#014421',
            type: 'text',
            description: 'Primär färg'
          },
          'colors.secondary': {
            value: '#93C560',
            type: 'text',
            description: 'Sekundär färg'
          }
        };
        
        return NextResponse.json({ settings: defaultSettings });
      }

      return NextResponse.json({ settings: settingsMap });

    } catch (error) {
      logError('Failed to get site settings', { error });
      return NextResponse.json({
        error: 'Failed to load settings'
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  });
}

/**
 * POST /api/admin/settings - Update site settings
 */
export async function POST(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: false, error: 'Not available during build' });
  }

  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check
      const { settings } = await request.json();

      if (!settings || typeof settings !== 'object') {
        return NextResponse.json({
          error: 'Invalid settings data'
        }, { status: 400 });
      }

      logInfo('Updating site settings', { settingsCount: Object.keys(settings).length });

      const updatedSettings = [];

      // Save each setting to database
      for (const [key, settingData] of Object.entries(settings)) {
        const { value, type = 'text', description = '' } = settingData as any;
        
        // Convert value to string for storage
        let stringValue = value;
        if (type === 'boolean') {
          stringValue = value.toString();
        } else if (type === 'number') {
          stringValue = value.toString();
        } else if (type === 'json') {
          stringValue = JSON.stringify(value);
        }

        try {
          const savedSetting = await prisma.siteSettings.upsert({
            where: { key },
            update: {
              value: stringValue,
              type,
              description,
              updatedAt: new Date()
            },
            create: {
              key,
              value: stringValue,
              type,
              description
            }
          });

          updatedSettings.push(savedSetting);
        } catch (dbError) {
          console.error(`Failed to save setting ${key}:`, dbError);
        }
      }

      logInfo('Site settings updated successfully', { 
        updatedCount: updatedSettings.length,
        keys: updatedSettings.map(s => s.key)
      });

      // Trigger any necessary cache invalidation or rebuilds here
      // For example, if you change colors, you might want to regenerate CSS

      return NextResponse.json({
        success: true,
        message: `${updatedSettings.length} inställningar uppdaterade`,
        updatedSettings: updatedSettings.map(s => ({
          key: s.key,
          value: s.value,
          type: s.type
        }))
      });

    } catch (error) {
      logError('Failed to update site settings', { error });
      return NextResponse.json({
        error: 'Failed to update settings'
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  });
} 