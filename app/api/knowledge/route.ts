import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course') || undefined; // 'basic' | 'flow' | 'energy'
    const slug = searchParams.get('slug') || undefined;

    // Gather from DB (if available)
    let dbDocs: any[] = [];
    try {
      if (slug) {
        const doc = await (prisma as any).knowledgeDocument?.findFirst({ where: { slug } });
        if (doc) dbDocs = [doc];
      } else {
        const docs = await (prisma as any).knowledgeDocument?.findMany({
          where: course ? { course } : undefined,
          orderBy: [{ course: 'asc' }, { order: 'asc' }]
        });
        if (docs && Array.isArray(docs)) dbDocs = docs;
      }
    } catch (e) {
      console.warn('Knowledge DB not available yet, will use JSON fallback');
    }

    // Fallback to JSON files under /public/data
    const fallbackCourse = course || 'basic';
    const filePath = path.join(process.cwd(), 'public', 'data', `knowledge-documents-${fallbackCourse}.json`);
    console.log('Looking for knowledge JSON at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('Knowledge JSON file not found:', filePath);
      // Try both course types if no course specified
      if (!course && slug) {
        const basicPath = path.join(process.cwd(), 'public', 'data', 'knowledge-documents-basic.json');
        const flowPath = path.join(process.cwd(), 'public', 'data', 'knowledge-documents-flow.json');
        
        if (fs.existsSync(basicPath)) {
          const basicDocs = JSON.parse(fs.readFileSync(basicPath, 'utf8'));
          const basicDoc = basicDocs.find((d: any) => d.slug === slug);
          if (basicDoc) {
            return NextResponse.json({ documents: [basicDoc] }, { headers: { 'Cache-Control': 'no-store' } });
          }
        }
        
        if (fs.existsSync(flowPath)) {
          const flowDocs = JSON.parse(fs.readFileSync(flowPath, 'utf8'));
          const flowDoc = flowDocs.find((d: any) => d.slug === slug);
          if (flowDoc) {
            return NextResponse.json({ documents: [flowDoc] }, { headers: { 'Cache-Control': 'no-store' } });
          }
        }
        
        const energyPath = path.join(process.cwd(), 'public', 'data', 'knowledge-documents-energy.json');
        if (fs.existsSync(energyPath)) {
          const energyDocs = JSON.parse(fs.readFileSync(energyPath, 'utf8'));
          const energyDoc = energyDocs.find((d: any) => d.slug === slug);
          if (energyDoc) {
            return NextResponse.json({ documents: [energyDoc] }, { headers: { 'Cache-Control': 'no-store' } });
          }
        }
      }
      // As last resort return empty
      return NextResponse.json({ documents: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }
    
    // Load JSON for selected course and also merge in energy if course=energy
    const raw = fs.readFileSync(filePath, 'utf8');
    let jsonDocs = JSON.parse(raw);
    if (!course && slug) {
      // If only slug provided and file didn't include it, try other courses too
      const energyPath = path.join(process.cwd(), 'public', 'data', 'knowledge-documents-energy.json');
      if (fs.existsSync(energyPath)) {
        const energyDocs = JSON.parse(fs.readFileSync(energyPath, 'utf8'));
        jsonDocs = [...jsonDocs, ...energyDocs];
      }
    }
    const jsonFiltered = slug ? jsonDocs.filter((d: any) => d.slug === slug) : jsonDocs;

    // Merge DB + JSON, prefer DB values when present, but DO NOT overwrite
    // existing JSON images with null/empty DB values
    const bySlug: Record<string, any> = {};
    for (const jd of jsonFiltered) {
      bySlug[jd.slug] = jd;
    }

    for (const dbd of dbDocs) {
      const existing = bySlug[dbd.slug] || {};
      const mergedDoc: any = { ...existing, ...dbd };

      // Preserve JSON headerImage if DB headerImage is missing/empty
      if ((dbd.headerImage === null || dbd.headerImage === undefined || dbd.headerImage === '')) {
        mergedDoc.headerImage = existing.headerImage ?? dbd.headerImage;
      }

      // Preserve JSON relatedImages if DB is missing
      if ((dbd.relatedImages === null || dbd.relatedImages === undefined)) {
        mergedDoc.relatedImages = existing.relatedImages ?? dbd.relatedImages;
      }

      // Preserve JSON excerpt/readTime when DB lacks
      if (dbd.excerpt == null) mergedDoc.excerpt = existing.excerpt;
      if (dbd.readTime == null) mergedDoc.readTime = existing.readTime;

      bySlug[dbd.slug] = mergedDoc;
    }

    const merged = Object.values(bySlug);

    // Override header images by slug when we have curated replacements
    const headerImageOverrides: Record<string, string> = {
      'att-a-ta-ute-med-functional-foods': '/Ersattning-bilder/kunskapsdokument-basic/ata-ute-functionalfoods.jpg',
      'att-va-lja-ra-tt-kolhydrater': '/Ersattning-bilder/kunskapsdokument-basic/ratt-kolhydrater.jpg',
      'att-va-lja-ra-tt-proteiner': '/Ersattning-bilder/kunskapsdokument-basic/proteiner.jpg',
      'a-t-mer-functional-foods-pa-ett-enkelt-sa-tt': '/Ersattning-bilder/kunskapsdokument-basic/mer-functional-ratt-satt.jpg',
      'dags-att-komma-iga-ng': '/Ersattning-bilder/kunskapsdokument-basic/komma-igang.jpg',
      'ersa-ttningsguide-fo-r-kolhydrater': '/Ersattning-bilder/kunskapsdokument-basic/MISC.png',
      'fo-rdelarna-med-functional-foods': '/Ersattning-bilder/kunskapsdokument-basic/MISC.png',
      'fra-gor-och-svar': '/Ersattning-bilder/kunskapsdokument-basic/fragor-svar.jpg',
      'ma-ldokument-styrelsemo-te-1': '/Ersattning-bilder/kunskapsdokument-basic/styrelsemote-1.jpg',
      'ma-ldokument-styrelsemo-te-2': '/Ersattning-bilder/kunskapsdokument-basic/MISC.png',
      'vad-a-r-functional-foods': '/Ersattning-bilder/kunskapsdokument-basic/vad-ar-functionalfoods.png'
    };

    const finalDocs = (merged as any[]).map((doc: any) => {
      const override = headerImageOverrides[doc.slug];
      if (override) {
        return { ...doc, headerImage: override };
      }
      return doc;
    });

    // If DB had docs and no course param provided, merged covers both; if nothing found anywhere, return []
    return NextResponse.json({ documents: finalDocs }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Knowledge API error:', e);
    return NextResponse.json({ documents: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    await prisma.$disconnect();
  }
} 