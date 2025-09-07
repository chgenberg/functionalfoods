const fetch = require('node-fetch');

async function testHealthQuizContext() {
  const url = 'http://localhost:3000/api/healthquiz/context';
  const data = {
    lat: 59.3293,  // Stockholm
    lon: 18.0686,
    radiusMeters: 1500
  };

  console.log('Testing /api/healthquiz/context...');
  console.log('Request:', data);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error:', response.status, result);
      return;
    }

    console.log('✅ Success!');
    console.log('\n📍 Location:', result.lat, result.lon);
    console.log('⭕ Radius:', result.radius, 'meters');
    console.log('💾 Cached:', result.cached);
    
    if (result.weather?.current) {
      console.log('\n🌡️ Weather:');
      console.log('  Temperature:', result.weather.current.temperature_2m, '°C');
      console.log('  UV Index:', result.weather.current.uv_index);
      console.log('  Precipitation:', result.weather.current.precipitation, 'mm');
    }
    
    if (result.air?.hourly) {
      const latest = Object.keys(result.air.hourly.time || {}).length - 1;
      console.log('\n💨 Air Quality (latest hour):');
      console.log('  PM2.5:', result.air.hourly.pm2_5?.[latest], 'μg/m³');
      console.log('  PM10:', result.air.hourly.pm10?.[latest], 'μg/m³');
      console.log('  NO2:', result.air.hourly.nitrogen_dioxide?.[latest], 'μg/m³');
    }
    
    if (result.pollen?.daily) {
      console.log('\n🌸 Pollen (today):');
      console.log('  Birch:', result.pollen.daily.birch_pollen?.[0] || 0);
      console.log('  Grass:', result.pollen.daily.grass_pollen?.[0] || 0);
    }
    
    if (result.places?.length > 0) {
      console.log('\n📍 Nearby places:', result.places.length);
      result.places.slice(0, 5).forEach(place => {
        console.log(`  - ${place.name || 'Unnamed'} (${place.type})`);
      });
    }

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testHealthQuizContext(); 