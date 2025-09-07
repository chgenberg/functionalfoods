const fetch = require('node-fetch');

async function testLiveAccess() {
  try {
    console.log('🧪 Testing live recipe access...\n');

    // First, login to get a token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch('https://ulrika-functional-foods-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ulrikadavidsson.se',
        password: 'adminpassword'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.token) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    console.log('✅ Logged in successfully\n');

    // Test course recipe access
    const testRecipes = [
      { slug: 'aggrora-fetaost-spenat', course: 'flow' },
      { slug: 'aggrora-asiatisk-avokadosallad', course: 'flow' }
    ];

    for (const test of testRecipes) {
      console.log(`2️⃣ Testing ${test.slug}...`);
      
      // Test without course param
      const response1 = await fetch(`https://ulrika-functional-foods-production.up.railway.app/api/recipes/${test.slug}`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      const data1 = await response1.json();
      console.log(`   Without course param: ${response1.status} - requiresCourse: ${data1.requiresCourse}, requiresPremium: ${data1.requiresPremium}`);

      // Test with course param
      const response2 = await fetch(`https://ulrika-functional-foods-production.up.railway.app/api/recipes/${test.slug}?course=${test.course}`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      const data2 = await response2.json();
      console.log(`   With course param: ${response2.status} - requiresCourse: ${data2.requiresCourse}, requiresPremium: ${data2.requiresPremium}`);
      
      console.log('');
    }

    // Test user access endpoint
    console.log('3️⃣ Testing user access endpoint...');
    const accessResponse = await fetch('https://ulrika-functional-foods-production.up.railway.app/api/user/access', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const accessData = await accessResponse.json();
    console.log('Access data:', JSON.stringify(accessData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLiveAccess(); 