import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';

// Lazy require to avoid issues if pdfkit is tree-shaken
const PDFDocument = require('pdfkit');

interface KnowledgeDocument {
  title: string;
  slug: string;
  content: string;
  headerImage: string;
  readTime: number;
  course: 'basic' | 'flow' | 'energy' | 'hormone';
}

function stripHtmlPreserveNewlines(html: string): string {
  try {
    let txt = html;
    // Headings -> line breaks
    txt = txt.replace(/<\/(h1|h2|h3)>/gi, '\n\n');
    // Paragraphs and list items -> line breaks
    txt = txt.replace(/<\/(p|li)>/gi, '\n');
    // Remove all remaining tags
    txt = txt.replace(/<[^>]*>/g, '');
    // Decode minimal entities
    txt = txt
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    // Collapse extra blank lines
    txt = txt.replace(/\n{3,}/g, '\n\n');
    return txt.trim();
  } catch {
    return html;
  }
}

function getPublicPath(relPath: string): string | null {
  if (!relPath) return null;
  let p = relPath;
  if (p.startsWith('/public/')) p = p.replace('/public', '');
  if (!p.startsWith('/')) p = '/' + p;
  const filePath = path.join(process.cwd(), 'public', p);
  if (fs.existsSync(filePath)) return filePath;
  // try slugified .webp fallback
  const base = path.basename(filePath);
  const dir = path.dirname(filePath);
  const slug = base
    .replace(/\.[^.]+$/, '.webp')
    .normalize()
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[^A-Za-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  const candidate = path.join(dir, slug);
  return fs.existsSync(candidate) ? candidate : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const slug = searchParams.get('slug');

  if (!courseId || !slug) {
    return new Response(JSON.stringify({ error: 'courseId och slug krävs' }), { status: 400 });
  }

  // Map courseId to course file name
  let course: 'basic' | 'flow' | 'energy' | 'hormone';
  if (courseId === 'functional-basics') {
    course = 'basic';
  } else if (courseId === 'functional-flow') {
    course = 'flow';
  } else if (courseId === 'functional-energy') {
    course = 'energy';
  } else if (courseId === 'functional-hormone' || courseId === 'hormonell-balans') {
    course = 'hormone';
  } else {
    // Fallback to basic if unknown courseId
    course = 'basic';
  }

  try {

    const filePath = path.join(process.cwd(), 'public', 'data', `knowledge-documents-${course}.json`);
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: 'Dokumentdatabas saknas' }), { status: 404 });
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const docs: KnowledgeDocument[] = JSON.parse(raw);
    const doc = docs.find(d => d.slug === slug);
    if (!doc) {
      return new Response(JSON.stringify({ error: 'Dokument hittades inte' }), { status: 404 });
    }

    // Prepare PDF stream
    const stream = new PassThrough();
    const pdf = new PDFDocument({ size: 'A4', margin: 50, info: { Title: doc.title } });
    pdf.pipe(stream);

    // Title
    pdf.fontSize(20).font('Helvetica-Bold').text(doc.title, { align: 'left' });
    pdf.moveDown(0.5);
    
    // Course name mapping
    const courseNames: Record<string, string> = {
      'basic': 'Functional Basics',
      'flow': 'Functional Flow',
      'energy': 'Functional Energy',
      'hormone': 'Hormonell Balans'
    };
    const courseName = courseNames[doc.course] || courseNames[course] || 'Functional Foods';
    
    pdf.fontSize(10).font('Helvetica').fillColor('#555555').text(`${courseName} · ${doc.readTime} min läsning`);
    pdf.moveDown(1);

    // Header image
    try {
      const headerPath = getPublicPath(doc.headerImage);
      if (headerPath) {
        const pageWidth = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right;
        pdf.image(headerPath, { fit: [pageWidth, 240], align: 'center' });
        pdf.moveDown(1);
      }
    } catch {}

    // Body text (HTML stripped)
    const text = stripHtmlPreserveNewlines(doc.content);
    pdf.fillColor('#000000').fontSize(12).font('Helvetica').text(text, { align: 'left' });

    pdf.end();

    const filename = `${slug}.pdf`;
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (e: any) {
    console.error('PDF generation error:', e);
    console.error('Error details:', {
      message: e?.message,
      stack: e?.stack,
      courseId,
      slug,
      course
    });
    return new Response(JSON.stringify({ 
      error: 'Kunde inte generera PDF',
      details: process.env.NODE_ENV === 'development' ? e?.message : undefined
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 