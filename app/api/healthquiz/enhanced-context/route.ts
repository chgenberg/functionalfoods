import { NextResponse } from 'next/server';

// Cache for expensive API calls
const cache = new Map<string, { expiresAt: number; data: any }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>, ttl = CACHE_TTL): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { expiresAt: Date.now() + ttl, data });
  return data;
}

// 1. WorldTimeAPI - Timezone and circadian data
async function fetchTimezoneData(lat: number, lon: number) {
  try {
    // Try coordinate-based first, fallback to IP-based
    let timeData;
    try {
      const response = await fetch(`https://worldtimeapi.org/api/timezone/Europe/Stockholm`);
      if (response.ok) timeData = await response.json();
    } catch {}
    
    if (!timeData) {
      const response = await fetch('https://worldtimeapi.org/api/ip');
      timeData = await response.json();
    }
    
    const currentTime = new Date(timeData.datetime);
    const sunrise = new Date();
    const sunset = new Date();
    
    // Rough sunrise/sunset calculation (can be improved)
    sunrise.setHours(7, 0, 0, 0);
    sunset.setHours(18, 0, 0, 0);
    
    return {
      timezone: timeData.timezone,
      currentTime: timeData.datetime,
      utcOffset: timeData.utc_offset,
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
      isDaytime: currentTime > sunrise && currentTime < sunset,
      circadianPhase: currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'
    };
  } catch (error) {
    console.warn('Timezone API failed:', error);
    return null;
  }
}

// 2. RxNorm API - Drug interaction checking
async function checkDrugInteractions(medications: string[]) {
  if (!medications || medications.length === 0) return null;
  
  try {
    const interactions: any[] = [];
    
    for (const medication of medications) {
      const cacheKey = `drug_${medication}`;
      const drugData = await fetchWithCache(cacheKey, async () => {
        // Search for drug
        const searchResponse = await fetch(
          `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(medication)}`
        );
        
        if (!searchResponse.ok) throw new Error('Drug search failed');
        
        const searchData = await searchResponse.json();
        const drugGroup = searchData.drugGroup;
        
        if (!drugGroup?.conceptGroup) return null;
        
        // Find SCD (Semantic Clinical Drug) concepts which are most relevant
        const scdGroup = drugGroup.conceptGroup.find((group: any) => group.tty === 'SCD');
        const concept = scdGroup?.conceptProperties?.[0] || drugGroup.conceptGroup[0]?.conceptProperties?.[0];
        if (!concept) return null;
        
        // Check interactions
        const interactionResponse = await fetch(
          `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${concept.rxcui}`
        );
        
        if (!interactionResponse.ok) return { name: medication, rxcui: concept.rxcui, interactions: [] };
        
        const interactionData = await interactionResponse.json();
        return {
          name: medication,
          rxcui: concept.rxcui,
          interactions: interactionData.interactionTypeGroup || []
        };
      });
      
      if (drugData) interactions.push(drugData);
    }
    
    return interactions;
  } catch (error) {
    console.warn('RxNorm API failed:', error);
    return null;
  }
}

// 3. PubMed E-utilities - Research evidence
async function fetchResearchEvidence(healthGoals: string[]) {
  try {
    const studies: any[] = [];
    
    // Map health goals to search terms
    const searchTerms: Record<string, string> = {
      energy: 'B vitamins energy fatigue',
      brain_health: 'omega-3 cognitive function memory',
      gut_health: 'probiotics gut microbiome health',
      immune: 'vitamin C zinc immune function',
      anti_aging: 'antioxidants longevity aging',
      beauty: 'collagen skin health'
    };
    
    for (const goal of healthGoals.slice(0, 3)) { // Limit to avoid rate limits
      const query = searchTerms[goal];
      if (!query) continue;
      
      const cacheKey = `pubmed_${goal}`;
      const research = await fetchWithCache(cacheKey, async () => {
        // Search PubMed
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=2&sort=relevance&email=contact@ulrikafunctionalfoods.com`;
        
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error('PubMed search failed');
        
        const searchData = await searchResponse.json();
        const pmids = searchData.esearchresult?.idlist || [];
        
        if (pmids.length === 0) return [];
        
        // Get summaries
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
        
        const summaryResponse = await fetch(summaryUrl);
        if (!summaryResponse.ok) throw new Error('PubMed summary failed');
        
        const summaryData = await summaryResponse.json();
        const result = summaryData.result;
        
        return pmids.map((pmid: string) => ({
          pmid,
          title: result[pmid]?.title || '',
          authors: result[pmid]?.authors?.[0]?.name || '',
          pubdate: result[pmid]?.pubdate || '',
          goal,
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        }));
      });
      
      studies.push(...research);
      
      // Rate limiting for PubMed (3 requests/second max)
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    return studies;
  } catch (error) {
    console.warn('PubMed API failed:', error);
    return [];
  }
}

// 4. Nominatim Geocoding - Location context
async function fetchLocationContext(lat: number, lon: number) {
  try {
    const cacheKey = `geo_${Math.round(lat * 100)}_${Math.round(lon * 100)}`;
    
    return await fetchWithCache(cacheKey, async () => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=sv,en`,
        {
          headers: {
            'User-Agent': 'UlrikaFunctionalFoods/1.0 (contact@ulrikafunctionalfoods.com)'
          }
        }
      );
      
      if (!response.ok) throw new Error('Nominatim failed');
      
      const data = await response.json();
      const address = data.address || {};
      
      return {
        city: address.city || address.town || address.village || '',
        municipality: address.municipality || '',
        county: address.county || '',
        country: address.country || '',
        countryCode: address.country_code?.toUpperCase() || '',
        climate: getClimateZone(lat),
        population: getPopulationCategory(address.city || address.town),
        displayName: data.display_name || ''
      };
    });
  } catch (error) {
    console.warn('Nominatim API failed:', error);
    return null;
  }
}

function getClimateZone(lat: number): string {
  if (lat > 66.5) return 'arctic';
  if (lat > 60) return 'subarctic'; 
  if (lat > 55) return 'temperate';
  if (lat > 45) return 'continental';
  return 'mild';
}

function getPopulationCategory(city: string): string {
  const largeCities = ['stockholm', 'göteborg', 'malmö', 'uppsala', 'västerås', 'örebro'];
  const mediumCities = ['linköping', 'helsingborg', 'jönköping', 'norrköping', 'lund'];
  
  if (!city) return 'unknown';
  const cityLower = city.toLowerCase();
  
  if (largeCities.includes(cityLower)) return 'large';
  if (mediumCities.includes(cityLower)) return 'medium';
  return 'small';
}

// Generate circadian-optimized recommendations
function generateCircadianRecommendations(timezoneData: any, healthGoals: string[]) {
  if (!timezoneData) return [];
  
  const recommendations: any[] = [];
  const phase = timezoneData.circadianPhase;
  
  if (phase === 'morning') {
    recommendations.push({
      timing: 'Nu (morgon)',
      supplements: ['Vitamin D3', 'B-komplex', 'Järn (om brist)'],
      reason: 'Optimal absorption på morgonen, stödjer energi'
    });
  }
  
  if (phase === 'afternoon') {
    recommendations.push({
      timing: 'Eftermiddag (13-15)',
      supplements: ['Omega-3', 'Probiotika'],
      reason: 'Bäst med mat, stödjer hjärn- och tarmhälsa'
    });
  }
  
  if (phase === 'evening') {
    recommendations.push({
      timing: 'Kväll (60 min före säng)',
      supplements: ['Magnesium', 'Melatonin (låg dos)', 'Ashwagandha'],
      reason: 'Främjar avslappning och sömnkvalitet'
    });
  }
  
  return recommendations;
}

// Generate safety warnings based on drug interactions
function generateSafetyWarnings(drugInteractions: any[], functionalFoods: string[]) {
  if (!drugInteractions) return [];
  
  const warnings: any[] = [];
  
  // Common interaction patterns
  const interactionMap: Record<string, string[]> = {
    'blood_thinners': [
      'Omega-3 tillskott kan öka blödningsrisk',
      'Undvik höga doser vitamin E',
      'Var försiktig med ginkgo och gurkmeja'
    ],
    'blood_pressure': [
      'Magnesium kan förstärka blodtrycksmedicin',
      'Övervaka kaliumintag vid ACE-hämmare',
      'Konsultera läkare före CoQ10'
    ],
    'antidepressants': [
      'St. Johns wort kan påverka SSRI',
      'Var försiktig med 5-HTP och tryptofan',
      'Omega-3 kan förstärka positiva effekter'
    ],
    'diabetes': [
      'Krom och kanel kan påverka blodsockret',
      'Övervaka glukos vid alpha-liponsyra',
      'Fiber kan påverka läkemedelsabsorption'
    ]
  };
  
  for (const drug of drugInteractions) {
    const drugType = drug.name.toLowerCase();
    for (const [type, typeWarnings] of Object.entries(interactionMap)) {
      if (drugType.includes(type) || drug.interactions.some((i: any) => 
        i.interactionType?.some((t: any) => t.comment?.toLowerCase().includes(type))
      )) {
        warnings.push(...typeWarnings.map(warning => ({
          medication: drug.name,
          warning,
          severity: 'moderate',
          action: 'Konsultera läkare eller apotekare'
        })));
      }
    }
  }
  
  return warnings;
}

export async function POST(req: Request) {
  try {
    const { lat, lon, medications, healthGoals } = await req.json();
    
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
    }
    
    // Fetch all data in parallel
    const [timezoneData, locationContext, drugInteractions, researchEvidence] = await Promise.all([
      fetchTimezoneData(lat, lon),
      fetchLocationContext(lat, lon),
      medications ? checkDrugInteractions(medications) : null,
      healthGoals ? fetchResearchEvidence(healthGoals) : []
    ]);
    
    // Generate enhanced recommendations
    const circadianRecommendations = generateCircadianRecommendations(timezoneData, healthGoals || []);
    const safetyWarnings = generateSafetyWarnings(drugInteractions || [], healthGoals || []);
    
    const response = {
      location: locationContext,
      timezone: timezoneData,
      circadian: circadianRecommendations,
      safety: {
        warnings: safetyWarnings,
        drugInteractions: drugInteractions || []
      },
      research: researchEvidence,
      metadata: {
        fetchedAt: new Date().toISOString(),
        sources: ['WorldTimeAPI', 'RxNorm', 'PubMed', 'Nominatim'],
        cacheStatus: 'fresh'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Enhanced context API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enhanced context', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 