/**
 * Tag Jul E-bok Buyers in Mailchimp
 * 
 * This script adds "Köp – Jul e-bok" tag to all customers who bought the Jul e-book.
 * 
 * Usage: 
 *   MAILCHIMP_API_KEY="your-key" MAILCHIMP_LIST_ID="your-list-id" node scripts/tag-jul-ebook-buyers.js
 * 
 * Or with .env file configured.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us4';
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID || process.env.MAILCHIMP_AUDIENCE_ID;

const TAG_NAME = 'Köp – Jul e-bok';

if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
  console.error('❌ Missing MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID');
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

async function addTagToSubscriber(email, tagName) {
  const crypto = require('crypto');
  const subscriberHash = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex');
  
  const endpoint = `/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}/tags`;
  
  const result = await makeRequest(endpoint, 'POST', {
    tags: [{ name: tagName, status: 'active' }]
  });
  
  return result.ok;
}

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       Tag Jul E-bok Buyers in Mailchimp                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Tag to add: "${TAG_NAME}"`);
  console.log('');

  // Read emails from the exported CSV file
  const csvPath = path.join(__dirname, '../exports/jul-ebook-buyers-unique.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ File not found:', csvPath);
    console.error('   Run the export first or provide the file.');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  const emails = lines
    .map(line => line.split(',')[0]?.trim())
    .filter(email => email && email.includes('@'));

  console.log(`📧 Found ${emails.length} email addresses to tag.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const email of emails) {
    process.stdout.write(`   Tagging ${email}... `);
    
    const success = await addTagToSubscriber(email, TAG_NAME);
    
    if (success) {
      console.log('✅');
      successCount++;
    } else {
      console.log('❌ (not in list or error)');
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`   ✅ Successfully tagged: ${successCount}`);
  console.log(`   ❌ Errors/not found: ${errorCount}`);
  console.log('');
  console.log(`   Tag "${TAG_NAME}" has been added to all Jul e-bok buyers.`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
