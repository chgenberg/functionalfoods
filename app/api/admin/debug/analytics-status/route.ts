import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/debug/analytics-status
 * Check analytics configuration status
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const gaSecret = process.env.GA4_API_SECRET;
    const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const metaAccessToken = process.env.META_ACCESS_TOKEN;

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check Google Analytics
    if (!gaId) {
      issues.push('NEXT_PUBLIC_GA_MEASUREMENT_ID is not set - Google Analytics will not work');
    } else if (!gaId.startsWith('G-')) {
      issues.push(`GA Measurement ID format looks incorrect: ${gaId.substring(0, 5)}... (should start with G-)`);
    }

    if (!gaSecret) {
      issues.push('GA4_API_SECRET is not set - Server-side purchase tracking will not work');
      recommendations.push('Get API Secret from GA4: Admin > Data Streams > Your stream > Measurement Protocol API secrets');
    }

    // Check Meta Pixel
    if (!metaPixelId) {
      issues.push('NEXT_PUBLIC_META_PIXEL_ID is not set - Meta/Facebook Pixel will not work');
    }

    if (!metaAccessToken) {
      recommendations.push('META_ACCESS_TOKEN not set - Server-side Conversions API disabled. Set this for better tracking accuracy.');
    }

    // Consent Mode info
    const consentInfo = {
      description: 'Consent Mode v2 is enabled',
      behavior: 'Users who reject cookies: GA4 uses behavioral modeling to estimate data',
      userActions: {
        acceptAll: 'Full tracking enabled',
        onlyNecessary: 'Cookieless tracking with modeling (limited data)',
        noAction: 'Cookieless tracking until banner interaction'
      }
    };

    return NextResponse.json({
      status: issues.length === 0 ? 'healthy' : 'issues_found',
      googleAnalytics: {
        configured: !!gaId,
        measurementId: gaId ? `${gaId.substring(0, 4)}...${gaId.substring(gaId.length - 4)}` : null,
        serverSideTracking: !!gaSecret,
        serverSideStatus: gaSecret ? 'enabled' : 'disabled (set GA4_API_SECRET)'
      },
      metaPixel: {
        configured: !!metaPixelId,
        pixelId: metaPixelId ? `${metaPixelId.substring(0, 4)}...` : null,
        conversionsApi: !!metaAccessToken ? 'enabled' : 'disabled'
      },
      consentMode: consentInfo,
      issues,
      recommendations,
      tips: [
        'GA4 Consent Mode v2 is active - Google will model data for users who reject cookies',
        'For accurate "First Visit" data, users must accept analytics cookies',
        'Server-side tracking (with GA4_API_SECRET) bypasses ad blockers for purchases',
        'Check GA4 > Admin > Data collection to enable "Google signals" for enhanced data',
        'In GA4, go to Settings > Data collection > Consent mode to verify modeling is enabled'
      ]
    });

  } catch (error) {
    console.error('Error checking analytics status:', error);
    return NextResponse.json(
      { error: 'Failed to check analytics status' },
      { status: 500 }
    );
  }
}

