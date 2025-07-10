import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Kontrollera att det är en giltig cron-förfrågan
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Slumpmässig kontroll - kör endast ~30% av gångerna för att inte skapa för många inlägg
    const shouldRun = Math.random() < 0.3;
    
    if (!shouldRun) {
      return NextResponse.json({ 
        message: 'Skippade denna körning (slumpmässig kontroll)',
        timestamp: new Date().toISOString()
      });
    }

    // Kontrollera att det är dagtid (mellan 08:00 och 18:00 svensk tid)
    const now = new Date();
    const swedenTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Stockholm"}));
    const hour = swedenTime.getHours();
    
    if (hour < 8 || hour > 18) {
      return NextResponse.json({ 
        message: 'Inte dagtid, skippade körning',
        currentHour: hour,
        timestamp: new Date().toISOString()
      });
    }

    // Anropa blogginlägg-generatorn
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/generate-blog-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Fel vid generering av blogginlägg');
    }

    return NextResponse.json({
      success: true,
      message: 'Automatisk blogginlägg-generering slutförd',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fel i automatisk blogginlägg-cron:', error);
    return NextResponse.json(
      { 
        error: 'Kunde inte köra automatisk blogginlägg-generering',
        details: error instanceof Error ? error.message : 'Okänt fel',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST endpoint för manuell triggering
export async function POST(req: NextRequest) {
  try {
    // Kontrollera att det är en giltig förfrågan
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Anropa blogginlägg-generatorn direkt (utan slumpmässig kontroll)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/generate-blog-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Fel vid generering av blogginlägg');
    }

    return NextResponse.json({
      success: true,
      message: 'Manuell blogginlägg-generering slutförd',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fel i manuell blogginlägg-generering:', error);
    return NextResponse.json(
      { 
        error: 'Kunde inte köra manuell blogginlägg-generering',
        details: error instanceof Error ? error.message : 'Okänt fel',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 