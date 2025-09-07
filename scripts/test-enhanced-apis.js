const https = require('https');

// Test functions for each API
async function testWorldTimeAPI() {
  console.log('🕐 Testing WorldTimeAPI...');
  
  try {
    const response = await fetch('https://worldtimeapi.org/api/ip');
    const data = await response.json();
    
    console.log('✅ WorldTimeAPI Success:');
    console.log(`  Timezone: ${data.timezone}`);
    console.log(`  Current time: ${data.datetime}`);
    console.log(`  UTC offset: ${data.utc_offset}`);
    
    return { success: true, data };
  } catch (error) {
    console.log(`❌ WorldTimeAPI Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testRxNormAPI() {
  console.log('\n💊 Testing RxNorm API...');
  
  try {
    // Test drug search
    const searchResponse = await fetch(
      'https://rxnav.nlm.nih.gov/REST/drugs.json?name=warfarin'
    );
    const searchData = await searchResponse.json();
    
    if (!searchData.drugGroup?.conceptGroup) {
      throw new Error('No drug concepts found');
    }
    
    const concept = searchData.drugGroup.conceptGroup[0]?.conceptProperties?.[0];
    if (!concept) {
      throw new Error('No concept properties found');
    }
    
    console.log('✅ RxNorm Drug Search Success:');
    console.log(`  Drug: ${concept.name}`);
    console.log(`  RxCUI: ${concept.rxcui}`);
    
    // Test interactions
    const interactionResponse = await fetch(
      `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${concept.rxcui}`
    );
    const interactionData = await interactionResponse.json();
    
    console.log('✅ RxNorm Interactions Success:');
    console.log(`  Interactions found: ${interactionData.interactionTypeGroup?.length || 0}`);
    
    return { success: true, data: { drug: concept, interactions: interactionData } };
  } catch (error) {
    console.log(`❌ RxNorm API Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPubMedAPI() {
  console.log('\n📚 Testing PubMed API...');
  
  try {
    // Search for omega-3 studies
    const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=omega-3%20cognitive%20function&retmode=json&retmax=2&email=test@ulrikafunctionalfoods.com';
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    const pmids = searchData.esearchresult?.idlist || [];
    if (pmids.length === 0) {
      throw new Error('No studies found');
    }
    
    console.log('✅ PubMed Search Success:');
    console.log(`  Studies found: ${pmids.length}`);
    console.log(`  PMIDs: ${pmids.join(', ')}`);
    
    // Get study summaries
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids[0]}&retmode=json`;
    
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    
    const study = summaryData.result[pmids[0]];
    console.log('✅ PubMed Summary Success:');
    console.log(`  Title: ${study.title?.slice(0, 80)}...`);
    console.log(`  Authors: ${study.authors?.[0]?.name || 'Unknown'}`);
    console.log(`  Date: ${study.pubdate}`);
    
    return { success: true, data: { pmids, study } };
  } catch (error) {
    console.log(`❌ PubMed API Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testNominatimAPI() {
  console.log('\n🌍 Testing Nominatim API...');
  
  try {
    // Test reverse geocoding for Stockholm
    const lat = 59.3293;
    const lon = 18.0686;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=sv,en`,
      {
        headers: {
          'User-Agent': 'UlrikaFunctionalFoods/1.0 (test@ulrikafunctionalfoods.com)'
        }
      }
    );
    
    const data = await response.json();
    const address = data.address || {};
    
    console.log('✅ Nominatim Success:');
    console.log(`  City: ${address.city || address.town || 'Unknown'}`);
    console.log(`  Country: ${address.country || 'Unknown'}`);
    console.log(`  Display: ${data.display_name?.slice(0, 60) || 'Unknown'}...`);
    
    return { success: true, data };
  } catch (error) {
    console.log(`❌ Nominatim API Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testEnhancedContextAPI() {
  console.log('\n🚀 Testing Enhanced Context API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/healthquiz/enhanced-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 59.3293,
        lon: 18.0686,
        medications: ['blood_thinners'],
        healthGoals: ['energy', 'brain_health']
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Enhanced Context API Success:');
    console.log(`  Location: ${data.location?.city || 'Unknown'}`);
    console.log(`  Timezone: ${data.timezone?.timezone || 'Unknown'}`);
    console.log(`  Circadian phase: ${data.timezone?.circadianPhase || 'Unknown'}`);
    console.log(`  Safety warnings: ${data.safety?.warnings?.length || 0}`);
    console.log(`  Research studies: ${data.research?.length || 0}`);
    console.log(`  Sources: ${data.metadata?.sources?.join(', ') || 'Unknown'}`);
    
    return { success: true, data };
  } catch (error) {
    console.log(`❌ Enhanced Context API Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🧪 Testing All Enhanced Health Test APIs');
  console.log('==========================================\n');
  
  const results = [];
  
  // Test individual APIs
  results.push(await testWorldTimeAPI());
  results.push(await testRxNormAPI());
  results.push(await testPubMedAPI());
  results.push(await testNominatimAPI());
  
  // Test integrated API
  results.push(await testEnhancedContextAPI());
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (successful === results.length) {
    console.log('\n🎉 All APIs working perfectly! Ready for production.');
  } else {
    console.log('\n⚠️  Some APIs failed. Check individual results above.');
  }
}

// Add fetch polyfill for Node.js
global.fetch = require('node-fetch');

runAllTests().catch(console.error); 