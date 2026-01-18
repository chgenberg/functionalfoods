/**
 * Setup Mailchimp E-commerce Store
 * 
 * This script creates an E-commerce store in Mailchimp for tracking purchases.
 * Run this ONCE to set up the store, then update MAILCHIMP_STORE_ID in Railway.
 * 
 * Usage: node scripts/setup-mailchimp-store.js
 * 
 * Required env vars:
 *   MAILCHIMP_API_KEY
 *   MAILCHIMP_SERVER_PREFIX (e.g., "us4")
 *   MAILCHIMP_LIST_ID or MAILCHIMP_AUDIENCE_ID
 */

require('dotenv').config();

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us4';
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID || process.env.MAILCHIMP_AUDIENCE_ID;

if (!MAILCHIMP_API_KEY) {
  console.error('❌ Missing MAILCHIMP_API_KEY');
  process.exit(1);
}

if (!MAILCHIMP_LIST_ID) {
  console.error('❌ Missing MAILCHIMP_LIST_ID or MAILCHIMP_AUDIENCE_ID');
  process.exit(1);
}

const baseUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const text = await response.text();
  
  try {
    return { ok: response.ok, status: response.status, data: JSON.parse(text) };
  } catch {
    return { ok: response.ok, status: response.status, data: text };
  }
}

async function listExistingStores() {
  console.log('\n📦 Checking existing E-commerce stores...\n');
  
  const result = await makeRequest('/ecommerce/stores');
  
  if (!result.ok) {
    console.error('❌ Failed to list stores:', result.data);
    return [];
  }
  
  const stores = result.data.stores || [];
  
  if (stores.length === 0) {
    console.log('   No existing stores found.');
  } else {
    console.log(`   Found ${stores.length} store(s):\n`);
    stores.forEach(store => {
      console.log(`   • ID: ${store.id}`);
      console.log(`     Name: ${store.name}`);
      console.log(`     Platform: ${store.platform}`);
      console.log(`     Domain: ${store.domain}`);
      console.log(`     List ID: ${store.list_id}`);
      console.log('');
    });
  }
  
  return stores;
}

async function createStore() {
  const storeId = 'functional-foods-store';
  const storeName = 'Functional Foods';
  const domain = 'functionalfoods.se';
  
  console.log('\n🏪 Creating new E-commerce store...\n');
  console.log(`   Store ID: ${storeId}`);
  console.log(`   Name: ${storeName}`);
  console.log(`   Domain: ${domain}`);
  console.log(`   List ID: ${MAILCHIMP_LIST_ID}`);
  console.log('');
  
  const storeData = {
    id: storeId,
    list_id: MAILCHIMP_LIST_ID,
    name: storeName,
    domain: domain,
    email_address: 'info@functionalfoods.se',
    currency_code: 'SEK',
    primary_locale: 'sv',
    timezone: 'Europe/Stockholm',
    phone: '',
    address: {
      address1: '',
      city: 'Stockholm',
      province: '',
      postal_code: '',
      country: 'Sweden',
      country_code: 'SE'
    },
    platform: 'Custom (Next.js)',
    is_syncing: false,
    money_format: '{{amount}} kr'
  };
  
  const result = await makeRequest('/ecommerce/stores', 'POST', storeData);
  
  if (!result.ok) {
    if (result.status === 400 && result.data?.detail?.includes('already exists')) {
      console.log('ℹ️  Store already exists with this ID.');
      console.log('\n✅ Use this MAILCHIMP_STORE_ID in Railway:');
      console.log(`\n   ${storeId}\n`);
      return storeId;
    }
    console.error('❌ Failed to create store:', result.data);
    return null;
  }
  
  console.log('✅ Store created successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('   🔑 Add this to your Railway environment variables:');
  console.log('');
  console.log(`   MAILCHIMP_STORE_ID=${storeId}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  return storeId;
}

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       Mailchimp E-commerce Store Setup                    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Server: ${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com`);
  console.log(`List ID: ${MAILCHIMP_LIST_ID}`);
  
  // First, check existing stores
  const existingStores = await listExistingStores();
  
  // Check if our store already exists
  const ourStore = existingStores.find(s => s.id === 'functional-foods-store' || s.domain === 'functionalfoods.se');
  
  if (ourStore) {
    console.log('✅ Your store already exists!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('   🔑 Use this MAILCHIMP_STORE_ID in Railway:');
    console.log('');
    console.log(`   MAILCHIMP_STORE_ID=${ourStore.id}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    return;
  }
  
  // Create new store
  await createStore();
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
