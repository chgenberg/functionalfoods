import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/app/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, results, locale } = await req.json();
    if (!email || !results) {
      return NextResponse.json({ error: 'Missing email or results' }, { status: 400 });
    }

    // Build simple HTML from results
    const title = locale==='en' ? 'Your Health Analysis' : locale==='es' ? 'Tu Análisis de Salud' : locale==='de' ? 'Deine Gesundheitsanalyse' : locale==='fr' ? 'Votre Analyse de Santé' : 'Din Hälsoanalys';

    const html = `
      <h1 style="font-family:Arial;color:#1a4324;">${title}</h1>
      <div style="font-family:Arial;color:#333;line-height:1.6;">
        ${results.profile ? `<h2>Profil</h2>${results.profile}` : ''}
        ${Array.isArray(results.recommendations) ? `<h2>Rekommendationer</h2>` + results.recommendations.map((r:any)=>`<h3>${r.title||''}</h3><div>${r.description||''}</div><div><em>${r.howToUse||''}</em></div>`).join('') : ''}
      </div>`;

    const ok = await emailService['sendEmail']?.({
      to: email,
      subject: `${title}`,
      html
    } as any) || false;

    if (!ok) return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
} 