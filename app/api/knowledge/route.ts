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
    const course = searchParams.get('course') || undefined; // 'basic' | 'flow'
    const slug = searchParams.get('slug') || undefined;

    // Try DB first (if model exists)
    try {
      // If slug provided, return single document
      if (slug) {
        const doc = await (prisma as any).knowledgeDocument?.findFirst({ where: { slug } });
        if (doc) return NextResponse.json({ documents: [doc] }, { headers: { 'Cache-Control': 'no-store' } });
      } else {
        const docs = await (prisma as any).knowledgeDocument?.findMany({
          where: course ? { course } : undefined,
          orderBy: [{ course: 'asc' }, { order: 'asc' }]
        });
        if (docs && Array.isArray(docs) && docs.length > 0) {
          return NextResponse.json({ documents: docs }, { headers: { 'Cache-Control': 'no-store' } });
        }
      }
    } catch (e) {
      // Swallow errors if model not migrated yet; we'll fall back to JSON
      console.warn('Knowledge DB not available yet, falling back to JSON');
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
      }
      
      return NextResponse.json({ documents: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }
    
    const raw = fs.readFileSync(filePath, 'utf8');
    const docs = JSON.parse(raw);
    const filtered = slug ? docs.filter((d: any) => d.slug === slug) : docs;

    return NextResponse.json({ documents: filtered }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Knowledge API error:', e);
    return NextResponse.json({ documents: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    await prisma.$disconnect();
  }
} 