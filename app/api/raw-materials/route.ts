import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const SUPPORTED = ['sv','en','es','de','fr'] as const;
type Lang = typeof SUPPORTED[number];
function getLang(req: NextRequest): Lang {
  const hdr = req.headers.get('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (m ? m[1] : '').toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val as Lang) ? (val as Lang) : 'sv';
}
function pickName(mat: any, lang: Lang): string {
  if (lang === 'sv') return mat.name;
  const key = `name_${lang}`;
  return mat[key] || mat.name;
}
function pickDesc(mat: any, lang: Lang): string | null {
  if (lang === 'sv') return mat.description || null;
  const key = `description_${lang}`;
  return mat[key] || mat.description || null;
}
function localeTag(lang: Lang): string {
  return lang === 'sv' ? 'sv-SE' : lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'fr-FR';
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ materials: [] }, { status: 200 });
    }
    const lang = getLang(req);

    const materials = await prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });

    // Map to localized view
    const mapped = materials.map((m: any) => ({
      ...m,
      name: pickName(m, lang),
      description: pickDesc(m, lang),
    }));

    // Sort using display name in correct locale
    const collator = new Intl.Collator(localeTag(lang));
    mapped.sort((a, b) => collator.compare(a.name, b.name));

    return NextResponse.json({ materials: mapped });
  } catch (error) {
    console.error('Error fetching raw materials', error);
    return NextResponse.json({ materials: [] }, { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
} 