/**
 * Get Mailchimp Store ID
 * 
 * This script lists all Mailchimp E-commerce stores and displays their IDs.
 * 
 * Usage:
 *   # On Railway (environment variables are automatically available):
 *   railway run npx tsx scripts/get-mailchimp-store-id.ts
 * 
 *   # Or locally with Railway CLI:
 *   railway run npx tsx scripts/get-mailchimp-store-id.ts
 * 
 *   # Or export Railway variables locally:
 *   export MAILCHIMP_API_KEY=... && export MAILCHIMP_SERVER_PREFIX=... && npx tsx scripts/get-mailchimp-store-id.ts
 */

async function getStoreId() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !serverPrefix) {
    console.error('❌ Missing environment variables!');
    console.error('Required:');
    console.error('  - MAILCHIMP_API_KEY');
    console.error('  - MAILCHIMP_SERVER_PREFIX');
    console.error('\nMake sure you have a .env file with these variables set.');
    process.exit(1);
  }

  console.log('🔍 Fetching Mailchimp stores...\n');
  console.log(`Using server prefix: ${serverPrefix}`);
  console.log(`API key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  try {
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/ecommerce/stores`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error('Response:', errorText);
      
      if (response.status === 401) {
        console.error('\n💡 Tips:');
        console.error('  - Check that your API key is correct');
        console.error('  - Make sure you\'re using the Marketing API key (not Transactional API key)');
        console.error('  - API key format should be: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1');
      }
      
      process.exit(1);
    }

    const data = await response.json();

    if (!data.stores || data.stores.length === 0) {
      console.log('⚠️  No stores found in your Mailchimp account.');
      console.log('\nTo create a store:');
      console.log('  1. Go to Mailchimp → Audience → E-commerce → Stores');
      console.log('  2. Click "Create Store"');
      console.log('  3. Fill in store name and URL');
      console.log('  4. Run this script again to get the Store ID');
      process.exit(0);
    }

    console.log(`✅ Found ${data.stores.length} store(s):\n`);

    data.stores.forEach((store: any, index: number) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   Store ID: ${store.id}`);
      console.log(`   Domain: ${store.domain || 'N/A'}`);
      console.log(`   Currency: ${store.currency_code || 'N/A'}`);
      console.log(`   Created: ${store.created_at ? new Date(store.created_at).toLocaleDateString('sv-SE') : 'N/A'}`);
      console.log('');
    });

    console.log('📋 To use this Store ID, add it to your .env file:');
    console.log(`   MAILCHIMP_STORE_ID=${data.stores[0].id}`);
    console.log('\nOr copy the Store ID above and add it to Railway/production environment variables.');

  } catch (error) {
    console.error('❌ Error fetching stores:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

getStoreId();

