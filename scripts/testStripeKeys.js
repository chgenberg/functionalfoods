const dotenv = require('dotenv');

// Ladda .env.local fil
dotenv.config({ path: '.env.local' });

async function testStripeKeys() {
  console.log('🔧 Testar Stripe-nycklar...\n');

  // Kontrollera miljövariabler
  console.log('📋 Kontrollerar miljövariabler:');
  console.log('✓ STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Konfigurerad ✅' : '❌ Saknas');
  console.log('✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Konfigurerad ✅' : '❌ Saknas');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('\n❌ Kan inte testa utan STRIPE_SECRET_KEY');
    console.log('Lägg till din Stripe Secret Key i .env.local-filen');
    return;
  }

  try {
    console.log('\n🧪 Testar Stripe API-anslutning...');
    
    // Importera Stripe och testa
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Testa att skapa en enkel PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // 100 SEK (Stripe använder öre)
      currency: 'sek',
      metadata: {
        test: 'true',
        website: 'ulrika-functional-foods'
      },
      description: 'Test från Ulrika Functional Foods'
    });

    console.log('✅ Stripe API-test lyckades!');
    console.log('   Payment Intent ID:', paymentIntent.id);
    console.log('   Status:', paymentIntent.status);
    console.log('   Belopp:', paymentIntent.amount / 100, 'SEK');

    // Testa att hämta PaymentIntent
    console.log('\n🔍 Testar att hämta PaymentIntent...');
    const retrieved = await stripe.paymentIntents.retrieve(paymentIntent.id);
    console.log('✅ Hämtning lyckades!');
    console.log('   Retrieved ID:', retrieved.id);

  } catch (error) {
    console.error('❌ Stripe-test misslyckades:', error.message);
    
    if (error.message.includes('No such API key')) {
      console.log('\n💡 Tips: Kontrollera att din STRIPE_SECRET_KEY är korrekt');
    } else if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Tips: API-nyckeln verkar vara felaktig');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Tips: Kontrollera internetanslutningen');
    }
    
    console.log('\nFel-detaljer:', error.type, error.code);
  }

  console.log('\n🎉 Test avslutat!');
  console.log('\n📖 Nästa steg:');
  console.log('1. Om testet lyckades, lägg till samma nycklar i Railway');
  console.log('2. Konfigurera webhooks i Stripe Dashboard');
  console.log('3. Testa betalningar på hemsidan');
}

// Kör scriptet
testStripeKeys(); 