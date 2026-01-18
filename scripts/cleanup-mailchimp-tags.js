/**
 * Mailchimp Tag Cleanup Script
 * 
 * Lists all tags and identifies which ones are safe to delete.
 * Run with --delete flag to actually remove unused tags.
 * 
 * Usage:
 *   node scripts/cleanup-mailchimp-tags.js          # List only (safe)
 *   node scripts/cleanup-mailchimp-tags.js --delete # Delete unused tags
 */

require('dotenv').config();

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us4';
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID || process.env.MAILCHIMP_AUDIENCE_ID;

const DELETE_MODE = process.argv.includes('--delete');

// Tags that ARE used by the website - DO NOT DELETE
const PROTECTED_TAGS = [
  'kund',
  'Website Signup',
  'Functional Foods',
  'SV', 'EN', 'ES', 'DE', 'FR',
  'Health Quiz',
  'Contact Form',
  // New tags we're adding
  'Köp – Jul e-bok',
  'Lead – Provvecka'
];

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

async function getAllTags() {
  // Mailchimp doesn't have a direct "list all tags" endpoint
  // We need to get segments of type 'static' which include tags
  const result = await makeRequest(`/lists/${MAILCHIMP_LIST_ID}/segments?count=1000&type=static`);
  
  if (!result.ok) {
    console.error('❌ Failed to fetch segments:', result.data);
    return [];
  }
  
  return result.data.segments || [];
}

async function deleteTag(tagId, tagName) {
  const result = await makeRequest(`/lists/${MAILCHIMP_LIST_ID}/segments/${tagId}`, 'DELETE');
  
  if (result.ok || result.status === 204) {
    return true;
  }
  
  console.error(`   ❌ Failed to delete "${tagName}":`, result.data);
  return false;
}

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       Mailchimp Tag Cleanup                               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Mode: ${DELETE_MODE ? '🗑️  DELETE (will remove unused tags)' : '👁️  VIEW ONLY (safe)'}`);
  console.log('');

  const segments = await getAllTags();
  
  // Filter to only tags (not saved segments)
  const tags = segments.filter(s => s.type === 'static');
  
  console.log(`📋 Found ${tags.length} tags in Mailchimp:\n`);

  const protectedTags = [];
  const unusedTags = [];

  for (const tag of tags) {
    const isProtected = PROTECTED_TAGS.some(p => 
      tag.name.toLowerCase() === p.toLowerCase()
    );
    
    if (isProtected) {
      protectedTags.push(tag);
    } else {
      unusedTags.push(tag);
    }
  }

  // Show protected tags
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛡️  SKYDDADE TAGGAR (används av hemsidan - raderas INTE):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const tag of protectedTags) {
    console.log(`   ✅ ${tag.name} (${tag.member_count} kontakter)`);
  }
  console.log('');

  // Show unused tags
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  OANVÄNDA TAGGAR (kan raderas säkert):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (unusedTags.length === 0) {
    console.log('   Inga oanvända taggar hittades! 🎉');
  } else {
    for (const tag of unusedTags) {
      console.log(`   ⚠️  ${tag.name} (${tag.member_count} kontakter)`);
    }
  }
  console.log('');

  // Delete if in delete mode
  if (DELETE_MODE && unusedTags.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  RADERAR OANVÄNDA TAGGAR...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    let deletedCount = 0;
    let errorCount = 0;

    for (const tag of unusedTags) {
      process.stdout.write(`   Raderar "${tag.name}"... `);
      
      const success = await deleteTag(tag.id, tag.name);
      
      if (success) {
        console.log('✅');
        deletedCount++;
      } else {
        errorCount++;
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('');
    console.log(`   ✅ Raderade: ${deletedCount}`);
    console.log(`   ❌ Fel: ${errorCount}`);
  } else if (!DELETE_MODE && unusedTags.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 För att radera oanvända taggar, kör:');
    console.log('   node scripts/cleanup-mailchimp-tags.js --delete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  console.log('');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
