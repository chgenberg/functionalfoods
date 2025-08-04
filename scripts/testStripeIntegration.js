const { PaymentService } = require('../app/lib/payment');

async function testStripeIntegration() {
  console.log('🔧 Testar Stripe-integration...\n');

  // Kontrollera miljövariabler
  console.log('📋 Kontrollerar miljövariabler:');
  console.log('✓ STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Konfigurerad' : '❌ Saknas');
  console.log('✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Konfigurerad' : '❌ Saknas');
  console.log('✓ STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Konfigurerad' : '⚠️  Saknas (behövs för webhooks)');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('\n❌ Kan inte testa utan STRIPE_SECRET_KEY');
    console.log('Lägg till din Stripe Secret Key i .env.local-filen');
    return;
  }

  console.log('\n🧪 Testar PaymentService...');

  const paymentService = new PaymentService();
  
  const testRequest = {
    amount: 299, // 299 SEK
    currency: 'SEK',
    items: [
      {
        id: 'test-course',
        name: 'Test Kurs',
        price: 299,
        quantity: 1,
        type: 'course'
      }
    ],
    customer: {
      userId: 'test-user-123',
      email: 'test@example.com',
      name: 'Test Användare'
    },
    paymentMethod: 'stripe',
    returnUrl: 'http://localhost:3000/checkout/success',
    cancelUrl: 'http://localhost:3000/checkout/cancelled'
  };

  try {
    // Test i development mode (simulerad betalning)
    process.env.NODE_ENV = 'development';
    console.log('📝 Testar development mode (simulerad betalning)...');
    
    const devResult = await paymentService.processPayment(testRequest);
    console.log('✅ Development test:', devResult.success ? 'Lyckades' : 'Misslyckades');
    console.log('   Status:', devResult.status);
    console.log('   Payment ID:', devResult.paymentId);

    // Test i production mode (riktig Stripe API)
    console.log('\n📝 Testar production mode (riktig Stripe API)...');
    process.env.NODE_ENV = 'production';
    
    const prodResult = await paymentService.processPayment(testRequest);
    console.log('✅ Production test:', prodResult.success ? 'Lyckades' : 'Misslyckades');
    console.log('   Status:', prodResult.status);
    console.log('   Payment ID:', prodResult.paymentId);
    
    if (prodResult.paymentId) {
      console.log('\n🔍 Testar payment verification...');
      const verifyResult = await paymentService.verifyPayment(prodResult.paymentId, 'stripe');
      console.log('✅ Verification test:', verifyResult.success ? 'Lyckades' : 'Misslyckades');
      console.log('   Status:', verifyResult.status);
    }

  } catch (error) {
    console.error('❌ Test misslyckades:', error.message);
    
    if (error.message.includes('No such API key')) {
      console.log('\n💡 Tips: Kontrollera att din STRIPE_SECRET_KEY är korrekt och börjar med "sk_test_" eller "sk_live_"');
    }
  }

  console.log('\n🎉 Test avslutat!');
  console.log('\n📖 Nästa steg:');
  console.log('1. Sätt dina riktiga Stripe-nycklar i .env.local');
  console.log('2. Konfigurera webhooks i Stripe Dashboard');
  console.log('3. Testa en riktig betalning på din hemsida');
}

// Kör scriptet om det anropas direkt
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--run')) {
    testStripeIntegration();
  } else {
    console.log('📖 Script för att testa Stripe-integration');
    console.log('🚀 Kör med: node scripts/testStripeIntegration.js --run');
  }
}

module.exports = { testStripeIntegration }; 