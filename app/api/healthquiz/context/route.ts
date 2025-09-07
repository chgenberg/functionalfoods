import { NextResponse } from 'next/server';

// Simple in-memory cache keyed by rounded lat/lon + radius bucket
// TTL default 30 minutes
const cache = new Map<string, { expiresAt: number; payload: any }>();
const DEFAULT_TTL_MS = 30 * 60 * 1000;

function makeKey(lat: number, lon: number, radius: number) {
  const rlat = Math.round(lat * 100) / 100; // ~1.1 km
  const rlon = Math.round(lon * 100) / 100;
  const rb = radius <= 1000 ? 1000 : radius <= 2000 ? 2000 : 3000;
  return `${rlat},${rlon},${rb}`;
}

function isSweden(lat: number, lon: number): boolean {
  // Rough bounding box for Sweden
  return lat >= 55.0 && lat <= 69.1 && lon >= 10.5 && lon <= 24.2;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }, next: { revalidate: 1800 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed ${url}: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchSMHIWeather(lat: number, lon: number) {
  // SMHI Point Weather Forecast API
  const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;
  
  try {
    const data = await fetchJson(url);
    
    if (!data.timeSeries || data.timeSeries.length === 0) {
      throw new Error('No SMHI data available');
    }

    // Get current conditions (first time series entry)
    const current = data.timeSeries[0];
    const currentParams = current.parameters.reduce((acc: any, param: any) => {
      acc[param.name] = param.values[0];
      return acc;
    }, {});

    // SMHI parameter mapping
    const smhiWeather = {
      current: {
        temperature_2m: currentParams.t || 0, // Air temperature
        apparent_temperature: currentParams.t || 0, // Use same for now
        precipitation: currentParams.pmin || 0, // Precipitation intensity
        wind_speed_10m: currentParams.ws || 0, // Wind speed
        uv_index: Math.max(0, Math.round((currentParams.vis || 10000) / 2000)), // Rough UV estimate from visibility
        time: current.validTime
      },
      hourly: {
        time: data.timeSeries.slice(0, 24).map((ts: any) => ts.validTime),
        temperature_2m: data.timeSeries.slice(0, 24).map((ts: any) => 
          ts.parameters.find((p: any) => p.name === 't')?.values[0] || 0
        ),
        precipitation_probability: data.timeSeries.slice(0, 24).map((ts: any) => 
          Math.min(100, (ts.parameters.find((p: any) => p.name === 'pmin')?.values[0] || 0) * 10)
        ),
        uv_index: data.timeSeries.slice(0, 24).map((ts: any) => 
          Math.max(0, Math.round((ts.parameters.find((p: any) => p.name === 'vis')?.values[0] || 10000) / 2000))
        )
      },
      daily: {
        time: [new Date().toISOString().split('T')[0]],
        uv_index_max: [Math.max(0, Math.round((currentParams.vis || 10000) / 1500))],
        precipitation_sum: [currentParams.pmin || 0]
      },
      source: 'SMHI'
    };

    return smhiWeather;
  } catch (error) {
    console.warn('SMHI API failed:', error);
    throw error;
  }
}

async function fetchSwedishPollen(lat: number, lon: number) {
  try {
    // Pollenrapporten API - approximate endpoint (might need adjustment)
    const response = await fetch('https://www.pollenrapporten.se/api/forecast', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Pollen API failed');
    
    const data = await response.json();
    
    // Transform to match our expected format
    return {
      daily: {
        time: [new Date().toISOString().split('T')[0]],
        alder_pollen: [data.alder || 0],
        birch_pollen: [data.birch || 0],
        grass_pollen: [data.grass || 0],
        mugwort_pollen: [data.mugwort || 0],
        ragweed_pollen: [data.ragweed || 0]
      },
      source: 'Pollenrapporten'
    };
  } catch (error) {
    console.warn('Swedish pollen API failed:', error);
    return null;
  }
}

async function fetchSwedishAirQuality(lat: number, lon: number) {
  try {
    // Luftkvalitet.se API (approximate - might need API key or different endpoint)
    const response = await fetch(`https://api.luftkvalitet.se/v1/measurements/latest?lat=${lat}&lon=${lon}&radius=50000`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Air quality API failed');
    
    const data = await response.json();
    
    // Transform to match Open-Meteo format
    return {
      hourly: {
        time: [new Date().toISOString()],
        pm10: [data.pm10 || 0],
        pm2_5: [data.pm25 || 0],
        nitrogen_dioxide: [data.no2 || 0],
        ozone: [data.o3 || 0],
        sulphur_dioxide: [data.so2 || 0],
        carbon_monoxide: [data.co || 0]
      },
      source: 'Luftkvalitet.se'
    };
  } catch (error) {
    console.warn('Swedish air quality API failed:', error);
    return null;
  }
}

async function fetchOverpassPlaces(lat: number, lon: number, radius: number) {
  const query = `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lon})["leisure"="park"];
  way(around:${radius},${lat},${lon})["leisure"="park"];
  node(around:${radius},${lat},${lon})["leisure"="fitness_centre"];
  way(around:${radius},${lat},${lon})["leisure"="fitness_centre"];
  node(around:${radius},${lat},${lon})["amenity"="gym"];
  way(around:${radius},${lat},${lon})["amenity"="gym"];
  node(around:${radius},${lat},${lon})["leisure"="fitness_station"];
  way(around:${radius},${lat},${lon})["leisure"="fitness_station"];
  node(around:${radius},${lat},${lon})["leisure"="track"];
  way(around:${radius},${lat},${lon})["leisure"="track"];
  node(around:${radius},${lat},${lon})["amenity"="swimming_pool"];
  way(around:${radius},${lat},${lon})["amenity"="swimming_pool"];
);
out center 30;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Overpass error: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const results = Array.isArray(data?.elements) ? data.elements : [];

  // Normalize to points with name/type
  const places = results.map((el: any) => {
    const type = el.tags?.amenity || el.tags?.leisure || 'place';
    const name = el.tags?.name || null;
    const latNorm = el.lat || el.center?.lat || null;
    const lonNorm = el.lon || el.center?.lon || null;
    return latNorm && lonNorm ? {
      id: `${el.type}/${el.id}`,
      name,
      type,
      lat: latNorm,
      lon: lonNorm,
      tags: el.tags || {}
    } : null;
  }).filter(Boolean);

  // Deduplicate by id
  const unique = new Map<string, any>();
  for (const p of places) unique.set(p.id, p);
  return Array.from(unique.values()).slice(0, 50);
}

export async function POST(req: Request) {
  try {
    const { lat, lon, radiusMeters, ttlSeconds } = await req.json();
    const latNum = Number(lat);
    const lonNum = Number(lon);
    const radius = Math.max(200, Math.min(5000, Number(radiusMeters) || 1500));
    const ttl = Math.max(60, Math.min(3600, Number(ttlSeconds) || 1800)) * 1000;

    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      return NextResponse.json({ error: 'lat and lon are required numbers' }, { status: 400 });
    }

    const key = makeKey(latNum, lonNum, radius);
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json({ ...cached.payload, cached: true });
    }

    const isInSweden = isSweden(latNum, lonNum);
    
    // Weather data - prioritize SMHI for Sweden
    let weatherPromise;
    if (isInSweden) {
      weatherPromise = fetchSMHIWeather(latNum, lonNum).catch(() => {
        console.log('SMHI failed, falling back to Open-Meteo');
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}&current=temperature_2m,apparent_temperature,precipitation,uv_index,wind_speed_10m&hourly=uv_index,precipitation_probability,temperature_2m&daily=uv_index_max,uv_index_clear_sky_max,precipitation_sum&timezone=auto`;
        return fetchJson(weatherUrl);
      });
    } else {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}&current=temperature_2m,apparent_temperature,precipitation,uv_index,wind_speed_10m&hourly=uv_index,precipitation_probability,temperature_2m&daily=uv_index_max,uv_index_clear_sky_max,precipitation_sum&timezone=auto`;
      weatherPromise = fetchJson(weatherUrl);
    }

    // Air quality - prioritize Swedish API for Sweden
    let airPromise;
    if (isInSweden) {
      airPromise = fetchSwedishAirQuality(latNum, lonNum).catch(() => {
        console.log('Swedish air quality failed, falling back to Open-Meteo');
        const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latNum}&longitude=${lonNum}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`;
        return fetchJson(airUrl);
      });
    } else {
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latNum}&longitude=${lonNum}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`;
      airPromise = fetchJson(airUrl);
    }

    // Pollen data - prioritize Swedish API for Sweden
    let pollenPromise;
    if (isInSweden) {
      pollenPromise = fetchSwedishPollen(latNum, lonNum).catch(() => {
        console.log('Swedish pollen failed, falling back to Open-Meteo');
        const pollenUrl = `https://pollen-api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}&daily=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen&timezone=auto`;
        return fetchJson(pollenUrl);
      });
    } else {
      const pollenUrl = `https://pollen-api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}&daily=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen&timezone=auto`;
      pollenPromise = fetchJson(pollenUrl);
    }

    const [weather, air, pollen, places] = await Promise.all([
      weatherPromise.catch(() => null),
      airPromise.catch(() => null),
      pollenPromise.catch(() => null),
      fetchOverpassPlaces(latNum, lonNum, radius).catch(() => [])
    ]);

    const payload = {
      lat: latNum,
      lon: lonNum,
      radius,
      country: isInSweden ? 'SE' : 'other',
      fetchedAt: new Date().toISOString(),
      weather,
      air,
      pollen,
      places
    };

    cache.set(key, { expiresAt: now + (ttl || DEFAULT_TTL_MS), payload });

    return NextResponse.json({ ...payload, cached: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch health context', details: msg }, { status: 500 });
  }
} 