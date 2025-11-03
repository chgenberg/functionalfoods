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
    console.log('📄 PDF: Starting generation for', { courseId, slug, course });
    
    const filePath = path.join(process.cwd(), 'public', 'data', `knowledge-documents-${course}.json`);
    if (!fs.existsSync(filePath)) {
      console.error('❌ PDF: File not found:', filePath);
      return new Response(JSON.stringify({ error: 'Dokumentdatabas saknas' }), { status: 404 });
    }
    
    const raw = fs.readFileSync(filePath, 'utf8');
    const docs: KnowledgeDocument[] = JSON.parse(raw);
    console.log('📄 PDF: Loaded', docs.length, 'documents from', course);
    
    const doc = docs.find(d => d.slug === slug);
    if (!doc) {
      console.error('❌ PDF: Document not found with slug:', slug);
      console.log('📄 PDF: Available slugs (first 10):', docs.slice(0, 10).map(d => d.slug));
      return new Response(JSON.stringify({ error: `Dokument "${slug}" hittades inte i ${course} kursen` }), { status: 404 });
    }

    console.log('✅ PDF: Found document:', doc.title);

    // Use buffer-based approach for better error handling
    const chunks: Buffer[] = [];
    const pdf = new PDFDocument({ 
      size: 'A4', 
      margin: 50, 
      info: { Title: doc.title }
    });

    // Collect PDF chunks
    pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Handle PDF errors
    pdf.on('error', (err: Error) => {
      console.error('❌ PDF: PDFDocument error:', err);
      throw err;
    });

    // Create promise to wait for PDF to finish
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      pdf.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      pdf.on('error', reject);
      // Timeout after 30 seconds
      setTimeout(() => reject(new Error('PDF generation timeout')), 30000);
    });

    // Title - ensure it's a string and handle special characters
    const title = String(doc.title || 'Okänt dokument');
    pdf.fontSize(20).font('Helvetica-Bold').text(title, { align: 'left' });
    pdf.moveDown(0.5);
    
    // Course name mapping
    const courseNames: Record<string, string> = {
      'basic': 'Functional Basics',
      'flow': 'Functional Flow',
      'energy': 'Functional Energy',
      'hormone': 'Hormonell Balans'
    };
    const courseName = courseNames[doc.course] || courseNames[course] || 'Functional Foods';
    const readTime = doc.readTime || 5;
    
    pdf.fontSize(10).font('Helvetica').fillColor('#555555').text(`${courseName} · ${readTime} min läsning`);
    pdf.moveDown(1);

    // Header image
    if (doc.headerImage) {
      try {
        const headerPath = getPublicPath(doc.headerImage);
        if (headerPath && fs.existsSync(headerPath)) {
          const pageWidth = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right;
          pdf.image(headerPath, { fit: [pageWidth, 240], align: 'center' });
          pdf.moveDown(1);
        } else {
          console.warn('⚠️ PDF: Header image not found:', doc.headerImage);
        }
      } catch (imgError: any) {
        console.warn('⚠️ PDF: Could not add header image:', imgError?.message);
      }
    }

    // Body text (HTML stripped) - handle long text properly
    const text = stripHtmlPreserveNewlines(doc.content || '');
    if (text && text.trim()) {
      try {
        pdf.fillColor('#000000').fontSize(12).font('Helvetica').text(text, { 
          align: 'left',
          lineGap: 2
        });
      } catch (textError: any) {
        console.error('❌ PDF: Error adding text:', textError?.message);
        console.error('❌ PDF: Text length:', text.length);
        // Fallback: try with truncated text
        const safeText = text.substring(0, 5000); // Limit length
        pdf.fillColor('#000000').fontSize(12).font('Helvetica').text(safeText || 'Innehåll kunde inte visas.', { 
          align: 'left'
        });
      }
    } else {
      console.warn('⚠️ PDF: No content found for document');
      pdf.fontSize(12).font('Helvetica').fillColor('#666666').text('Inget innehåll tillgängligt.');
    }

    pdf.end();
    
    // Wait for PDF to finish generating
    const pdfBuffer = await pdfPromise;

    const filename = `${slug}.pdf`;
    return new Response(pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength), {
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