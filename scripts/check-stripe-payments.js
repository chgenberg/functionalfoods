require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkStripePayments() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment');
    process.exit(1);
  }
  
  console.log('✅ Stripe configured\n');
  try {
    console.log('🔍 Checking Stripe payments...\n');

    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      expand: ['data.customer', 'data.payment_method']
    });

    console.log(`📊 Total payment intents from Stripe: ${paymentIntents.data.length}\n`);

    // Count by status
    const statusCount = {};
    const courseCount = {};
    let totalRevenue = 0;
    let succeededCount = 0;

    paymentIntents.data.forEach(pi => {
      statusCount[pi.status] = (statusCount[pi.status] || 0) + 1;
      
      if (pi.status === 'succeeded') {
        succeededCount++;
        totalRevenue += pi.amount / 100;
        
        // Extract course from description or metadata
        const desc = pi.description || '';
        const metadata = pi.metadata || {};
        
        let course = 'Unknown';
        if (desc.includes('Functional Basics') || desc.includes('Basics')) {
          course = 'Functional Basics';
        } else if (desc.includes('Functional Flow') || desc.includes('Flow') || desc.includes('Gut Health')) {
          course = 'Functional Flow';
        } else if (desc.includes('Functional Energy') || desc.includes('Energy') || desc.includes('Insulin balance')) {
          course = 'Functional Energy';
        } else if (desc.includes('Hormonell Balans') || desc.includes('Hormon')) {
          course = 'Hormonell Balans';
        }
        
        if (!courseCount[course]) {
          courseCount[course] = { count: 0, revenue: 0 };
        }
        courseCount[course].count++;
        courseCount[course].revenue += pi.amount / 100;
      }
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 STRIPE PAYMENT INTENTS BY STATUS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('💰 SUCCEEDED PAYMENTS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`Total succeeded: ${succeededCount}`);
    console.log(`Total revenue: ${totalRevenue.toLocaleString('sv-SE')} kr\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📚 COURSE BREAKDOWN (from Stripe)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    Object.entries(courseCount)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .forEach(([course, data]) => {
        console.log(`${course}:`);
        console.log(`  Orders: ${data.count}`);
        console.log(`  Revenue: ${data.revenue.toLocaleString('sv-SE')} kr\n`);
      });

    // Show sample of succeeded payments
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 SAMPLE SUCCEEDED PAYMENTS (first 10)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    paymentIntents.data
      .filter(pi => pi.status === 'succeeded')
      .slice(0, 10)
      .forEach(pi => {
        console.log(`ID: ${pi.id}`);
        console.log(`  Amount: ${(pi.amount / 100).toLocaleString('sv-SE')} kr`);
        console.log(`  Description: ${pi.description || 'No description'}`);
        console.log(`  Customer: ${pi.customer?.email || 'No email'}`);
        console.log(`  Created: ${new Date(pi.created * 1000).toLocaleDateString('sv-SE')}\n`);
      });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStripePayments();

