const https = require('https');

// Test cases
const testCases = [
  {
    name: 'Free recipe (should be accessible without login)',
    url: 'https://ulrika-functional-foods-production.up.railway.app/api/recipes/havregrynsgrot-med-ananas',
    expected: {
      isFree: true,
      requiresCourse: false,
      requiresPremium: false
    }
  },
  {
    name: 'Flow course recipe',
    url: 'https://ulrika-functional-foods-production.up.railway.app/api/recipes/aggrora-fetaost-spenat',
    expected: {
      isFree: false,
      requiresCourse: true,
      requiresPremium: false,
      courseTags: ['Flow']
    }
  },
  {
    name: 'Basic course recipe',
    url: 'https://ulrika-functional-foods-production.up.railway.app/api/recipes/kycklinggryta-roda-linser',
    expected: {
      isFree: false,
      requiresCourse: true,
      requiresPremium: false,
      courseTags: ['Basic']
    }
  }
];

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Testing Live Recipe Access...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    try {
      console.log(`📋 Test: ${test.name}`);
      const data = await fetchJSON(test.url);
      
      let testPassed = true;
      const issues = [];
      
      // Check each expected field
      for (const [key, expectedValue] of Object.entries(test.expected)) {
        const actualValue = data[key];
        
        if (Array.isArray(expectedValue)) {
          // For arrays, check if they match
          if (!Array.isArray(actualValue) || 
              expectedValue.length !== actualValue.length ||
              !expectedValue.every(v => actualValue.includes(v))) {
            testPassed = false;
            issues.push(`${key}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`);
          }
        } else if (actualValue !== expectedValue) {
          testPassed = false;
          issues.push(`${key}: expected ${expectedValue}, got ${actualValue}`);
        }
      }
      
      if (testPassed) {
        console.log('✅ PASSED\n');
        passed++;
      } else {
        console.log('❌ FAILED');
        issues.forEach(issue => console.log(`   - ${issue}`));
        console.log();
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      failed++;
    }
  }
  
  // Test batch images API
  console.log('📋 Test: Batch Images API');
  try {
    const batchResponse = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        recipeNames: ['Fruktsmoothie', 'Laxsallad med vindruvor'],
        recipeSlugs: ['fruktsmoothie', 'laxsallad-vindruvor-sallad'],
        size: 'small'
      });
      
      const options = {
        hostname: 'ulrika-functional-foods-production.up.railway.app',
        path: '/api/recipes/batch-images',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    if (batchResponse.images && Object.keys(batchResponse.images).length > 0) {
      console.log('✅ PASSED - Images returned:', Object.keys(batchResponse.images));
      passed++;
    } else {
      console.log('❌ FAILED - No images returned');
      failed++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    failed++;
  }
  
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
}

runTests(); 