/**
 * Test Stripe Webhook Configuration
 * This script helps diagnose why Stripe webhooks are not working
 */

console.log('\n🔍 STRIPE WEBHOOK DIAGNOSTIC\n');
console.log('=' .repeat(50));

// 1. Check environment variables
console.log('\n1️⃣ CHECKING ENVIRONMENT VARIABLES:\n');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is NOT set');
} else {
  const keyType = STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST';
  console.log(`✅ STRIPE_SECRET_KEY is set (${keyType} mode)`);
  console.log(`   Prefix: ${STRIPE_SECRET_KEY.substring(0, 10)}...`);
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('❌ STRIPE_WEBHOOK_SECRET is NOT set');
  console.error('   This is REQUIRED for webhook signature verification');
  console.error('   Get it from: Stripe Dashboard > Developers > Webhooks');
} else {
  console.log(`✅ STRIPE_WEBHOOK_SECRET is set`);
  console.log(`   Prefix: ${STRIPE_WEBHOOK_SECRET.substring(0, 10)}...`);
}

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('❌ STRIPE_PUBLISHABLE_KEY is NOT set');
} else {
  const keyType = STRIPE_PUBLISHABLE_KEY.startsWith('pk_live') ? 'LIVE' : 'TEST';
  console.log(`✅ STRIPE_PUBLISHABLE_KEY is set (${keyType} mode)`);
}

// 2. Check webhook endpoint
console.log('\n2️⃣ WEBHOOK ENDPOINT INFORMATION:\n');

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://functionalfoods.se';
const webhookUrl = `${baseUrl}/api/webhooks/payment`;

console.log(`   Expected webhook URL: ${webhookUrl}`);
console.log(`   \n   ⚠️  Make sure this URL is configured in Stripe Dashboard:`);
console.log(`      Stripe Dashboard > Developers > Webhooks > Add endpoint`);

// 3. Required events
console.log('\n3️⃣ REQUIRED WEBHOOK EVENTS:\n');
console.log('   The following events should be enabled in Stripe:');
console.log('   - checkout.session.completed ✅ (CRITICAL)');
console.log('   - payment_intent.succeeded');
console.log('   - payment_intent.payment_failed');
console.log('   - payment_intent.canceled');
console.log('   - payment_intent.processing');

// 4. Test Stripe connection
console.log('\n4️⃣ TESTING STRIPE CONNECTION:\n');

if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('build')) {
  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    
    // Try to list webhooks
    stripe.webhookEndpoints.list({ limit: 10 })
      .then((webhooks: any) => {
        console.log(`✅ Successfully connected to Stripe`);
        console.log(`   Found ${webhooks.data.length} webhook endpoint(s):\n`);
        
        if (webhooks.data.length === 0) {
          console.error('   ❌ NO WEBHOOKS CONFIGURED IN STRIPE!');
          console.error('   You MUST add a webhook endpoint in Stripe Dashboard');
        } else {
          webhooks.data.forEach((webhook: any, i: number) => {
            console.log(`   Webhook ${i + 1}:`);
            console.log(`   - URL: ${webhook.url}`);
            console.log(`   - Status: ${webhook.status}`);
            console.log(`   - Events: ${webhook.enabled_events.join(', ')}`);
            
            // Check if our URL is configured
            if (webhook.url === webhookUrl) {
              console.log(`   ✅ This matches our expected URL!`);
            } else {
              console.log(`   ⚠️  URL mismatch - expected: ${webhookUrl}`);
            }
            
            // Check if checkout.session.completed is enabled
            if (webhook.enabled_events.includes('checkout.session.completed')) {
              console.log(`   ✅ checkout.session.completed is enabled`);
            } else {
              console.error(`   ❌ checkout.session.completed is NOT enabled`);
            }
            console.log('');
          });
        }
        
        // 5. Recommendations
        console.log('\n5️⃣ RECOMMENDATIONS:\n');
        
        if (webhooks.data.length === 0) {
          console.log('   🔧 ACTION REQUIRED:');
          console.log('   1. Go to: https://dashboard.stripe.com/webhooks');
          console.log('   2. Click "Add endpoint"');
          console.log(`   3. Enter URL: ${webhookUrl}`);
          console.log('   4. Select events: checkout.session.completed, payment_intent.*');
          console.log('   5. Copy the webhook signing secret (whsec_...)');
          console.log('   6. Add it to Railway as: STRIPE_WEBHOOK_SECRET');
        } else {
          const matchingWebhook = webhooks.data.find((w: any) => w.url === webhookUrl);
          if (!matchingWebhook) {
            console.log('   ⚠️  WARNING: Webhook URL mismatch');
            console.log('   Update webhook URL in Stripe Dashboard to:');
            console.log(`   ${webhookUrl}`);
          }
          
          if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET.includes('build')) {
            console.log('   ⚠️  WARNING: Webhook secret not properly configured');
            console.log('   Get the signing secret from Stripe Dashboard and add to Railway');
          }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ Diagnostic complete\n');
        
        process.exit(0);
      })
      .catch((err: any) => {
        console.error('❌ Failed to connect to Stripe:', err.message);
        process.exit(1);
      });
  } catch (error: any) {
    console.error('❌ Error testing Stripe connection:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Cannot test Stripe connection - API key not configured');
  console.log('\n' + '='.repeat(50));
  process.exit(1);
}
