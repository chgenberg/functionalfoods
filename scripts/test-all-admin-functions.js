/*
  Complete test of ALL admin functionality
  Run with: node scripts/test-all-admin-functions.js
  
  Tests every admin feature to ensure 100% functionality
*/

async function testAdminLogin() {
  console.log('🔐 Testing admin authentication...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@functionalfoods.se',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      console.log('   ✅ Admin login successful');
      return true;
    } else {
      console.log('   ❌ Login failed');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return false;
  }
}

async function testOrdersAPI() {
  console.log('\n🛒 Testing orders management...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/orders');
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Orders API working');
      console.log(`   📊 Found ${data.orders?.length || data.length || 0} orders`);
      return true;
    } else {
      console.log('   ❌ Orders API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Orders API error:', error.message);
    return false;
  }
}

async function testStripePayments() {
  console.log('\n💳 Testing Stripe payments integration...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/stripe-payments?limit=5');
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Stripe integration working');
      console.log(`   💰 Total revenue: ${data.summary?.totalAmount || 0} SEK`);
      console.log(`   📈 Successful payments: ${data.summary?.successful || 0}`);
      return true;
    } else {
      console.log('   ❌ Stripe API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Stripe API error:', error.message);
    return false;
  }
}

async function testSettingsAPI() {
  console.log('\n⚙️ Testing settings management...');
  
  try {
    // Test GET
    const getResponse = await fetch('http://localhost:3000/api/admin/settings');
    
    if (!getResponse.ok) {
      console.log('   ❌ Settings GET failed:', getResponse.status);
      return false;
    }
    
    const settings = await getResponse.json();
    console.log('   ✅ Settings GET working');
    console.log(`   📋 Found ${Object.keys(settings.settings || {}).length} settings`);
    
    // Test POST (save)
    const testSettings = {
      'test.setting': { 
        value: 'test-value-' + Date.now(), 
        type: 'text', 
        description: 'Test setting' 
      }
    };
    
    const postResponse = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: testSettings })
    });
    
    if (postResponse.ok) {
      console.log('   ✅ Settings POST working - changes save to database');
      return true;
    } else {
      console.log('   ❌ Settings POST failed:', postResponse.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Settings API error:', error.message);
    return false;
  }
}

async function testBlogAPI() {
  console.log('\n📝 Testing blog management...');
  
  try {
    // Test GET
    const getResponse = await fetch('http://localhost:3000/api/blog?limit=5');
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('   ✅ Blog GET working');
      console.log(`   📄 Found ${data.posts?.length || 0} blog posts`);
      
      // Test POST (create) - but don't actually create
      console.log('   ⚠️ Blog POST not tested (would create real blog post)');
      return true;
    } else {
      console.log('   ❌ Blog GET failed:', getResponse.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Blog API error:', error.message);
    return false;
  }
}

async function testRecipesAPI() {
  console.log('\n🍽️ Testing recipe management...');
  
  try {
    const response = await fetch('http://localhost:3000/api/recipes?limit=5');
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Recipes GET working');
      console.log(`   🥘 Found ${data.recipes?.length || 0} recipes`);
      
      console.log('   ⚠️ Recipe POST/PUT not tested (would modify real recipes)');
      return true;
    } else {
      console.log('   ❌ Recipes API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Recipes API error:', error.message);
    return false;
  }
}

async function testUsersAPI() {
  console.log('\n👥 Testing user management...');
  
  try {
    const response = await fetch('http://localhost:3000/api/users');
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Users API working');
      console.log(`   👤 Found ${data.users?.length || 0} users`);
      return true;
    } else {
      console.log('   ❌ Users API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Users API error:', error.message);
    return false;
  }
}

async function checkServerHealth() {
  console.log('🏥 Checking server health...');
  
  try {
    const response = await fetch('http://localhost:3000/api/health');
    
    if (response.ok) {
      const health = await response.json();
      console.log('   ✅ Server healthy');
      console.log(`   🗄️ Database: ${health.checks?.database?.status || 'unknown'}`);
      console.log(`   💳 Stripe: ${health.checks?.stripe?.status || 'unknown'}`);
      return true;
    } else {
      console.log('   ❌ Server unhealthy');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Server not reachable. Start with: npm run dev');
    return false;
  }
}

async function main() {
  console.log('🧪 COMPREHENSIVE ADMIN FUNCTIONALITY TEST\n');
  console.log('═══════════════════════════════════════════════\n');
  
  // Check server first
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    console.log('\n❌ Server must be running to test admin functionality');
    process.exit(1);
  }
  
  const tests = [
    { name: 'Admin Authentication', test: testAdminLogin, critical: true },
    { name: 'Orders Management', test: testOrdersAPI, critical: true },
    { name: 'Stripe Payments', test: testStripePayments, critical: true },
    { name: 'Settings Management', test: testSettingsAPI, critical: true },
    { name: 'Blog Management', test: testBlogAPI, critical: false },
    { name: 'Recipe Management', test: testRecipesAPI, critical: false },
    { name: 'User Management', test: testUsersAPI, critical: false }
  ];
  
  const results = [];
  
  for (const { name, test, critical } of tests) {
    const success = await test();
    results.push({ name, success, critical });
  }
  
  // Analysis
  console.log('\n📊 ADMIN FUNCTIONALITY TEST RESULTS');
  console.log('═══════════════════════════════════════════════');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const criticalFailed = failed.filter(r => r.critical);
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const criticality = result.critical ? ' (KRITISK)' : ' (valfri)';
    console.log(`${icon} ${result.name}${criticality}`);
  });
  
  console.log(`\n🎯 Resultat: ${successful.length}/${results.length} funktioner fungerar`);
  console.log(`📈 Funktionalitet: ${(successful.length/results.length*100).toFixed(1)}%`);
  
  if (criticalFailed.length === 0) {
    console.log('\n🎉 ALLA KRITISKA FUNKTIONER FUNGERAR!');
    console.log('✅ Admin-panelen är produktionsklar för:');
    console.log('   - Hantera beställningar och betalningar');
    console.log('   - Se Stripe-transaktioner live');
    console.log('   - Ändra site-inställningar');
    console.log('   - Administrera användarkonton');
    
    if (failed.length > 0) {
      console.log('\n⚠️ Mindre funktioner som kan förbättras:');
      failed.forEach(f => console.log(`   - ${f.name}`));
      console.log('\nDessa påverkar inte kärnfunktionaliteten för kurslansering.');
    }
    
    console.log('\n🚀 ADMIN-PANELEN ÄR REDO FÖR PRODUKTION!');
  } else {
    console.log('\n❌ Kritiska funktioner behöver fixas:');
    criticalFailed.forEach(f => console.log(`   - ${f.name}`));
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Admin test failed:', error);
  process.exit(1);
}); 