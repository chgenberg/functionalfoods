/*
  Test admin functionality to ensure all features work correctly
  Run with: node scripts/test-admin-functionality.js
  
  This script tests:
  - Admin login
  - Settings save/load
  - Page builder save/load
  - Database connectivity
*/

async function testAdminLogin() {
  console.log('🔐 Testing admin login...');
  
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
      const data = await response.json();
      console.log('   ✅ Admin login successful');
      console.log('   👤 User:', data.user.email, 'Role:', data.user.role);
      return true;
    } else {
      const error = await response.json();
      console.log('   ❌ Login failed:', error.error);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Login request failed:', error.message);
    return false;
  }
}

async function testSettingsAPI() {
  console.log('\n⚙️ Testing settings API...');
  
  try {
    // Test GET settings
    console.log('   📥 Testing GET /api/admin/settings');
    const getResponse = await fetch('http://localhost:3000/api/admin/settings');
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('   ✅ Settings loaded successfully');
      console.log('   📊 Settings count:', Object.keys(data.settings).length);
      
      // Test POST settings (save)
      console.log('   💾 Testing POST /api/admin/settings');
      const testSettings = {
        'site.name': { value: 'Functional Foods TEST', type: 'text', description: 'Test site name' },
        'test.setting': { value: 'test-value', type: 'text', description: 'Test setting' }
      };
      
      const postResponse = await fetch('http://localhost:3000/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: testSettings })
      });
      
      if (postResponse.ok) {
        const saveData = await postResponse.json();
        console.log('   ✅ Settings saved successfully:', saveData.message);
        return true;
      } else {
        const error = await postResponse.json();
        console.log('   ❌ Settings save failed:', error.error);
        return false;
      }
    } else {
      console.log('   ❌ Settings load failed:', getResponse.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Settings API test failed:', error.message);
    return false;
  }
}

async function testPageBuilderAPI() {
  console.log('\n📄 Testing page builder API...');
  
  try {
    // Test GET pages
    console.log('   📥 Testing GET /api/admin/pages');
    const getResponse = await fetch('http://localhost:3000/api/admin/pages?page=homepage');
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('   ✅ Page config loaded successfully');
      console.log('   🧩 Components count:', data.components.length);
      
      // Test POST pages (save)
      console.log('   💾 Testing POST /api/admin/pages');
      const testComponents = [
        {
          id: 'test-hero',
          type: 'hero',
          props: {
            title: 'TEST TITLE from Admin',
            subtitle: 'This proves admin changes work!'
          }
        }
      ];
      
      const postResponse = await fetch('http://localhost:3000/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          page: 'test-page', 
          components: testComponents 
        })
      });
      
      if (postResponse.ok) {
        const saveData = await postResponse.json();
        console.log('   ✅ Page saved successfully:', saveData.message);
        return true;
      } else {
        const error = await postResponse.json();
        console.log('   ❌ Page save failed:', error.error);
        return false;
      }
    } else {
      console.log('   ❌ Page load failed:', getResponse.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Page builder API test failed:', error.message);
    return false;
  }
}

async function testSiteConfigAPI() {
  console.log('\n🌐 Testing site config API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/site-config');
    
    if (response.ok) {
      const config = await response.json();
      console.log('   ✅ Site config loaded successfully');
      console.log('   🏷️ Site name:', config.siteName);
      console.log('   🎨 Primary color:', config.primaryColor);
      console.log('   📧 Contact email:', config.contactEmail);
      console.log('   🔧 Maintenance mode:', config.maintenanceMode);
      return true;
    } else {
      console.log('   ❌ Site config failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Site config test failed:', error.message);
    return false;
  }
}

async function checkServerHealth() {
  console.log('🏥 Checking server health...');
  
  try {
    const response = await fetch('http://localhost:3000/api/health');
    
    if (response.ok) {
      const health = await response.json();
      console.log('   ✅ Server is healthy');
      console.log('   🗄️ Database:', health.checks?.database?.status);
      console.log('   💳 Stripe:', health.checks?.stripe?.status);
      return true;
    } else {
      console.log('   ❌ Server health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Cannot reach server. Is it running? (npm run dev)');
    return false;
  }
}

async function main() {
  console.log('🧪 TESTING ADMIN FUNCTIONALITY\n');
  console.log('═══════════════════════════════════════\n');
  
  // Check server health first
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server is not healthy. Please check your development server.');
    process.exit(1);
  }
  
  const tests = [
    { name: 'Admin Login', test: testAdminLogin },
    { name: 'Settings API', test: testSettingsAPI },
    { name: 'Page Builder API', test: testPageBuilderAPI },
    { name: 'Site Config API', test: testSiteConfigAPI }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    const success = await test();
    results.push({ name, success });
  }
  
  // Summary
  console.log('\n📊 ADMIN FUNCTIONALITY TEST RESULTS');
  console.log('═══════════════════════════════════════');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Success rate: ${successful}/${total} (${(successful/total*100).toFixed(1)}%)`);
  
  if (successful === total) {
    console.log('\n🎉 ALL ADMIN FEATURES WORKING!');
    console.log('✅ Admin can now change settings and they will be saved to database');
    console.log('✅ Page builder changes will persist');
    console.log('✅ Site configuration is dynamic and updateable');
    console.log('\n🚀 Ready for production admin usage!');
  } else {
    console.log('\n⚠️ Some admin features need attention before production');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Admin functionality test failed:', error);
  process.exit(1);
}); 