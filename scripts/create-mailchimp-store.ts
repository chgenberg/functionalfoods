/**
 * Create Mailchimp E-commerce Store via API
 * 
 * This script creates a new Mailchimp E-commerce store and displays the Store ID.
 * 
 * Usage:
 *   # On Railway (environment variables are automatically available):
 *   railway run npx tsx scripts/create-mailchimp-store.ts
 * 
 *   # Or locally with Railway CLI:
 *   railway run npx tsx scripts/create-mailchimp-store.ts
 * 
 *   # Or export Railway variables locally:
 *   export MAILCHIMP_API_KEY=... && export MAILCHIMP_SERVER_PREFIX=... && npx tsx scripts/create-mailchimp-store.ts
 */

async function createStore() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !serverPrefix) {
    console.error('❌ Missing environment variables!');
    console.error('Required:');
    console.error('  - MAILCHIMP_API_KEY');
    console.error('  - MAILCHIMP_SERVER_PREFIX');
    console.error('\nOptional (but recommended):');
    console.error('  - MAILCHIMP_AUDIENCE_ID (to link store to your audience)');
    console.error('\nMake sure you have a .env file with these variables set.');
    process.exit(1);
  }

  console.log('🛍️  Creating Mailchimp E-commerce Store...\n');
  console.log(`Using server prefix: ${serverPrefix}`);
  console.log(`API key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  try {
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/ecommerce/stores`;
    
    // Store configuration
    const storeData = {
      id: `store_${Date.now()}`, // Unique store ID
      list_id: audienceId || undefined, // Link to your audience if available
      name: 'Functional Foods Store',
      platform: 'other',
      domain: 'www.functionalfoods.se',
      email_address: 'store@functionalfoods.se',
      currency_code: 'SEK',
      money_format: 'kr',
      primary_locale: 'sv_SE',
      timezone: 'Europe/Stockholm'
    };

    console.log('Store configuration:');
    console.log(`  Name: ${storeData.name}`);
    console.log(`  Domain: ${storeData.domain}`);
    console.log(`  Currency: ${storeData.currency_code}`);
    if (audienceId) {
      console.log(`  Linked to audience: ${audienceId}`);
    }
    console.log('');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(storeData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.title) {
          errorMessage = errorJson.title;
        }
      } catch {
        // Use raw error text if JSON parsing fails
      }

      console.error(`❌ ${errorMessage}`);
      console.error('Response:', errorText);
      
      if (response.status === 401) {
        console.error('\n💡 Tips:');
        console.error('  - Check that your API key is correct');
        console.error('  - Make sure you\'re using the Marketing API key (not Transactional API key)');
        console.error('  - API key format should be: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1');
      } else if (response.status === 400) {
        console.error('\n💡 Tips:');
        console.error('  - Store might already exist with this ID');
        console.error('  - Try checking existing stores first');
        console.error('  - Or manually create store in Mailchimp dashboard');
      }
      
      process.exit(1);
    }

    const store = await response.json();

    console.log('✅ Store created successfully!\n');
    console.log('📋 Store Details:');
    console.log(`   Store ID: ${store.id}`);
    console.log(`   Name: ${store.name}`);
    console.log(`   Domain: ${store.domain}`);
    console.log(`   Currency: ${store.currency_code}`);
    console.log(`   Created: ${store.created_at ? new Date(store.created_at).toLocaleDateString('sv-SE') : 'N/A'}`);
    console.log('');

    console.log('📝 Add this to your .env file:');
    console.log(`   MAILCHIMP_STORE_ID=${store.id}`);
    console.log('\nOr add it to Railway/production environment variables.');
    console.log('\n✅ You can now use Mailchimp E-commerce tracking!');

  } catch (error) {
    console.error('❌ Error creating store:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createStore();

