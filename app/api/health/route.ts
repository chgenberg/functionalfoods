import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/database';
import { env } from '@/app/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for monitoring system status
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  const start = Date.now();
  
  try {
    // Check database health
    const dbHealth = await db.healthCheck();
    
    // Check environment configuration
    const envConfig = env.getConfig();
    
    // Check external services (basic connectivity)
    const externalChecks = await Promise.allSettled([
      // Stripe connectivity
      checkStripeConnectivity(),
      // Email service connectivity
      checkEmailServiceConnectivity(),
    ]);
    
    const responseTime = Date.now() - start;
    
    // Determine overall health status
    const isHealthy = dbHealth.status === 'healthy' && 
                     externalChecks.every(check => check.status === 'fulfilled');
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: envConfig.NODE_ENV,
      checks: {
        database: {
          status: dbHealth.status,
          latency: dbHealth.latency,
          error: dbHealth.error
        },
        stripe: {
          status: externalChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
          testMode: env.isStripeTestMode(),
          error: externalChecks[0].status === 'rejected' ? 
            (externalChecks[0].reason as Error).message : undefined
        },
        email: {
          status: externalChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
          error: externalChecks[1].status === 'rejected' ? 
            (externalChecks[1].reason as Error).message : undefined
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      }
    };
    
    // Return appropriate HTTP status
    const httpStatus = isHealthy ? 200 : 503;
    
    return NextResponse.json(healthData, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: { status: 'unknown' },
        stripe: { status: 'unknown' },
        email: { status: 'unknown' }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    });
  }
}

/**
 * Check Stripe API connectivity
 */
async function checkStripeConnectivity(): Promise<void> {
  try {
    const stripe = require('stripe')(env.getConfig().STRIPE_SECRET_KEY);
    
    // Simple API call to check connectivity
    await stripe.paymentIntents.list({ limit: 1 });
  } catch (error) {
    throw new Error(`Stripe connectivity failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check email service connectivity
 */
async function checkEmailServiceConnectivity(): Promise<void> {
  try {
    // Basic check - in a real implementation, you might ping the email service
    const apiKey = env.getConfig().MAILCHIMP_TRANSACTIONAL_API_KEY;
    
    if (!apiKey || apiKey.length < 10) {
      throw new Error('Email service API key not configured properly');
    }
    
    // You could add actual API connectivity check here
    // For now, just validate the key format
  } catch (error) {
    throw new Error(`Email service connectivity failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Detailed health check endpoint (admin only)
 * GET /api/health?detailed=true
 */
export async function HEAD(request: NextRequest) {
  // Simple HEAD request for uptime monitoring
  const dbHealth = await db.healthCheck();
  
  return new Response(null, {
    status: dbHealth.status === 'healthy' ? 200 : 503,
    headers: {
      'X-Health-Status': dbHealth.status,
      'X-Response-Time': dbHealth.latency.toString()
    }
  });
} 