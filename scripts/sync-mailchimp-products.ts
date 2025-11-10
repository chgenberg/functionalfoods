/**
 * Sync all course products to Mailchimp E-commerce Store
 * 
 * This script syncs all CourseProduct entries to Mailchimp so they appear
 * in the Mailchimp E-commerce dashboard.
 * 
 * Usage:
 *   npx tsx scripts/sync-mailchimp-products.ts
 */

import { PrismaClient } from '@prisma/client';
import { getMailchimpEcommerce } from '../app/lib/mailchimp-ecommerce';

const prisma = new PrismaClient();

async function syncProducts() {
  console.log('🔄 Starting Mailchimp product sync...\n');

  const mailchimpEcommerce = getMailchimpEcommerce();

  if (!mailchimpEcommerce.isConfigured()) {
    console.error('❌ Mailchimp E-commerce is not configured!');
    console.error('Required environment variables:');
    console.error('  - MAILCHIMP_API_KEY');
    console.error('  - MAILCHIMP_SERVER_PREFIX');
    console.error('  - MAILCHIMP_STORE_ID');
    process.exit(1);
  }

  try {
    // Get all course products
    const products = await prisma.courseProduct.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📦 Found ${products.length} products to sync\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Get product image if available
        const imageUrl = product.overviewVideoUrl 
          ? undefined // Mailchimp doesn't support video URLs as product images
          : undefined;

        // Get product description
        const description = product.description || product.welcomeText || '';

        // Calculate current price (use sale price if active, otherwise base price or price)
        const now = new Date();
        const isSaleActive = product.salePrice && 
          product.saleStartsAt && 
          product.saleEndsAt &&
          now >= product.saleStartsAt &&
          now <= product.saleEndsAt;
        
        const currentPrice = isSaleActive 
          ? product.salePrice 
          : (product.basePrice || product.price || 0);

        // Sync product to Mailchimp
        await mailchimpEcommerce.syncProduct({
          id: product.id,
          title: product.name,
          description: description.substring(0, 500), // Limit description length
          type: 'course',
          image_url: imageUrl,
          vendor: 'Functional Foods',
          variants: [{
            id: `${product.id}-default`,
            title: product.name,
            price: currentPrice,
            inventory_quantity: 999 // Unlimited inventory
          }]
        });

        console.log(`✅ Synced: ${product.name} (${currentPrice} SEK)`);
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to sync ${product.name}:`, error instanceof Error ? error.message : error);
        errorCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${products.length}`);

    if (successCount > 0) {
      console.log('\n✅ Products synced successfully!');
      console.log('   Check Mailchimp → Audience → E-commerce → Products');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run sync
syncProducts().catch(console.error);

