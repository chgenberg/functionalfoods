import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to check Stripe webhook configuration
 * Access at: /api/debug/stripe-webhook
 */
export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: [] as any[]
  };

  // 1. Check Stripe API Keys
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  diagnostics.checks.push({
    name: 'STRIPE_SECRET_KEY',
    status: stripeSecretKey ? '✅ SET' : '❌ MISSING',
    mode: stripeSecretKey?.startsWith('sk_live') ? 'LIVE' : stripeSecretKey?.startsWith('sk_test') ? 'TEST' : 'UNKNOWN',
    prefix: stripeSecretKey ? stripeSecretKey.substring(0, 10) + '...' : 'N/A'
  });

  diagnostics.checks.push({
    name: 'STRIPE_PUBLISHABLE_KEY',
    status: stripePublishableKey ? '✅ SET' : '❌ MISSING',
    mode: stripePublishableKey?.startsWith('pk_live') ? 'LIVE' : stripePublishableKey?.startsWith('pk_test') ? 'TEST' : 'UNKNOWN',
    prefix: stripePublishableKey ? stripePublishableKey.substring(0, 10) + '...' : 'N/A'
  });

  diagnostics.checks.push({
    name: 'STRIPE_WEBHOOK_SECRET',
    status: stripeWebhookSecret ? '✅ SET' : '❌ MISSING',
    critical: true,
    note: stripeWebhookSecret ? 'Webhook signature verification enabled' : 'WEBHOOKS WILL FAIL WITHOUT THIS!',
    prefix: stripeWebhookSecret ? stripeWebhookSecret.substring(0, 10) + '...' : 'N/A'
  });

  // 2. Check webhook endpoint URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://functionalfoods.se';
  const webhookUrl = `${baseUrl}/api/webhooks/payment`;

  diagnostics.checks.push({
    name: 'Webhook Endpoint URL',
    url: webhookUrl,
    note: 'This should be configured in Stripe Dashboard > Developers > Webhooks'
  });

  // 3. Try to fetch Stripe webhooks list
  if (stripeSecretKey && !stripeSecretKey.includes('build')) {
    try {
      const stripe = require('stripe')(stripeSecretKey);
      const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });

      diagnostics.checks.push({
        name: 'Stripe Connection',
        status: '✅ SUCCESS',
        webhooksFound: webhooks.data.length,
        webhooks: webhooks.data.map((w: any) => ({
          url: w.url,
          status: w.status,
          events: w.enabled_events,
          matchesExpected: w.url === webhookUrl,
          hasCheckoutSessionCompleted: w.enabled_events.includes('checkout.session.completed')
        }))
      });

      // Check for critical issues
      const hasMatchingWebhook = webhooks.data.some((w: any) => w.url === webhookUrl);
      const hasCheckoutEvent = webhooks.data.some((w: any) => 
        w.enabled_events.includes('checkout.session.completed') && w.url === webhookUrl
      );

      if (!hasMatchingWebhook) {
        diagnostics.checks.push({
          name: '⚠️ ISSUE',
          issue: 'Webhook URL not configured in Stripe',
          action: `Add webhook endpoint: ${webhookUrl}`,
          dashboard: 'https://dashboard.stripe.com/webhooks'
        });
      }

      if (!hasCheckoutEvent) {
        diagnostics.checks.push({
          name: '⚠️ ISSUE',
          issue: 'checkout.session.completed event not enabled',
          action: 'Enable this event in Stripe webhook configuration'
        });
      }

    } catch (error: any) {
      diagnostics.checks.push({
        name: 'Stripe Connection',
        status: '❌ FAILED',
        error: error.message
      });
    }
  }

  // 4. Check Mailchimp (for email sending)
  const mailchimpKey = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY;
  diagnostics.checks.push({
    name: 'MAILCHIMP_TRANSACTIONAL_API_KEY',
    status: mailchimpKey ? '✅ SET' : '❌ MISSING',
    note: mailchimpKey ? 'Emails should be sent' : 'EMAILS WILL NOT BE SENT!',
    prefix: mailchimpKey ? mailchimpKey.substring(0, 10) + '...' : 'N/A'
  });

  // 5. Overall assessment
  const criticalIssues = diagnostics.checks.filter(c => 
    c.status?.includes('❌') && (c.critical || c.name.includes('WEBHOOK'))
  );

  diagnostics.checks.push({
    name: '📊 Overall Assessment',
    criticalIssues: criticalIssues.length,
    status: criticalIssues.length === 0 ? '✅ All critical checks passed' : `❌ ${criticalIssues.length} critical issue(s) found`,
    recommendation: criticalIssues.length > 0 ? 'Fix critical issues listed above' : 'Configuration looks good - check Railway logs for webhook attempts'
  });

  return NextResponse.json(diagnostics, { status: 200 });
}
