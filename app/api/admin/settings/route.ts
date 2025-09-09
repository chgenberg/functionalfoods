import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Simple settings API using file storage as fallback
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ settings: {} });
  }

  try {
    // Return default settings for now
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
    
    // Try to load from file system
    try {
      const fs = require('fs');
      const path = require('path');
      const settingsFile = path.join(process.cwd(), 'data', 'admin-settings.json');
      
      if (fs.existsSync(settingsFile)) {
        const fileSettings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        return NextResponse.json({ settings: { ...defaultSettings, ...fileSettings } });
      }
    } catch (fileError) {
      console.warn('Could not load settings from file:', fileError);
    }

    return NextResponse.json({ settings: defaultSettings });

  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({
      error: 'Failed to load settings'
    }, { status: 500 });
  }
}

/**
 * Save settings to file system
 */
export async function POST(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: false, error: 'Not available during build' });
  }

  try {
    const { settings } = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({
        error: 'Invalid settings data'
      }, { status: 400 });
    }

    // Save to file system as fallback
    const fs = require('fs');
    const path = require('path');
    
    const dataDir = path.join(process.cwd(), 'data');
    const settingsFile = path.join(dataDir, 'admin-settings.json');
    
    // Ensure directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save settings
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    
    console.log('✅ Settings saved to file system:', Object.keys(settings).length, 'settings');

    return NextResponse.json({
      success: true,
      message: `${Object.keys(settings).length} inställningar sparade`,
      storage: 'filesystem'
    });

  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({
      error: 'Failed to save settings'
    }, { status: 500 });
  }
} 