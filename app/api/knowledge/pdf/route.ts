import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import fs from 'fs';
import path from 'path';

interface KnowledgeDocument {
  title: string;
  slug: string;
  content: string;
  headerImage: string;
  readTime: number;
  course: 'basic' | 'flow' | 'energy' | 'hormone';
}

function stripHtmlPreserveStructure(html: string): Array<{ type: 'heading' | 'paragraph' | 'list'; content: string }> {
  try {
    const result: Array<{ type: 'heading' | 'paragraph' | 'list'; content: string }> = [];
    
    // Split by major block elements
    let content = html;
    
    // Handle headings
    const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi;
    let lastIndex = 0;
    let match;
    
    const headings: Array<{ index: number; content: string }> = [];
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({ index: match.index, content: match[1] });
    }
    
    // Process content in order
    let workingContent = content;
    
    // Remove script and style tags
    workingContent = workingContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    workingContent = workingContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Split by paragraph tags
    const paragraphs = workingContent.split(/<\/?p[^>]*>/gi).filter(p => p.trim());
    
    paragraphs.forEach(para => {
      let text = para
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&auml;/g, 'ä')
        .replace(/&aring;/g, 'å')
        .replace(/&ouml;/g, 'ö')
        .replace(/&Auml;/g, 'Ä')
        .replace(/&Aring;/g, 'Å')
        .replace(/&Ouml;/g, 'Ö')
        .trim();
      
      if (text.length > 0) {
        result.push({ type: 'paragraph', content: text });
      }
    });
    
    return result;
  } catch {
    return [{ type: 'paragraph', content: html }];
  }
}

function stripHtmlPreserveNewlines(html: string): string {
  try {
    let txt = html;
    txt = txt.replace(/<\/(h1|h2|h3)>/gi, '\n\n');
    txt = txt.replace(/<\/(p|li)>/gi, '\n');
    txt = txt.replace(/<[^>]*>/g, '');
    txt = txt
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&auml;/g, 'ä')
      .replace(/&aring;/g, 'å')
      .replace(/&ouml;/g, 'ö')
      .replace(/&Auml;/g, 'Ä')
      .replace(/&Aring;/g, 'Å')
      .replace(/&Ouml;/g, 'Ö');
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
  
  // Try common image formats if original not found
  const ext = path.extname(filePath).toLowerCase();
  if (!ext || ext === '') {
    // No extension, try common formats
    for (const tryExt of ['.webp', '.jpg', '.jpeg', '.png']) {
      const candidate = filePath + tryExt;
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  
  // Try alternative extensions
  for (const tryExt of ['.webp', '.jpg', '.jpeg', '.png']) {
    const candidate = filePath.replace(/\.[^.]*$/, tryExt);
    if (candidate !== filePath && fs.existsSync(candidate)) return candidate;
  }
  
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
    return NextResponse.json({ error: 'courseId och slug krävs' }, { status: 400 });
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
    course = 'basic';
  }

  try {
    console.log('📄 PDF: Starting generation for', { courseId, slug, course });
    
    const filePath = path.join(process.cwd(), 'public', 'data', `knowledge-documents-${course}.json`);
    if (!fs.existsSync(filePath)) {
      console.error('❌ PDF: File not found:', filePath);
      return NextResponse.json({ error: 'Dokumentdatabas saknas' }, { status: 404 });
    }
    
    // Read JSON file with explicit UTF-8 encoding
    const raw = fs.readFileSync(filePath, 'utf8');
    const docs: KnowledgeDocument[] = JSON.parse(raw);
    console.log('📄 PDF: Loaded', docs.length, 'documents from', course);
    
    const doc = docs.find(d => d.slug === slug);
    if (!doc) {
      console.error('❌ PDF: Document not found with slug:', slug);
      console.log('📄 PDF: Available slugs (first 10):', docs.slice(0, 10).map(d => d.slug));
      return NextResponse.json({ error: `Dokument "${slug}" hittades inte i ${course} kursen` }, { status: 404 });
    }

    console.log('✅ PDF: Found document:', doc.title);
    console.log('📄 PDF: Title encoding check:', {
      title: doc.title,
      titleLength: doc.title?.length,
      titleBytes: Buffer.from(doc.title || '', 'utf8').length,
      hasSwedishChars: /[åäöÅÄÖ]/.test(doc.title || '')
    });

    // Dynamically import pdfkit
    let PDFDocument: any;
    try {
      const pdfkitModule = await import('pdfkit/js/pdfkit.standalone.js');
      PDFDocument = (pdfkitModule as any).default || pdfkitModule;
      if (!PDFDocument) {
        throw new Error('PDFDocument not found in pdfkit module');
      }
    } catch (importError: any) {
      console.error('❌ PDF: Failed to import pdfkit:', importError);
      throw new Error(`Failed to load PDF library: ${importError?.message || 'Unknown error'}`);
    }
    
    const pdf = new PDFDocument({ 
      size: 'A4', 
      margin: 60,
      info: { Title: doc.title }
    });

    // Collect PDF chunks
    const chunks: Buffer[] = [];
    pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Create promise to wait for PDF completion
    const pdfReady = new Promise<Buffer>((resolve, reject) => {
      pdf.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        } catch (err: any) {
          reject(new Error(`Failed to concat PDF chunks: ${err?.message}`));
        }
      });
      pdf.on('error', (err: Error) => {
        console.error('❌ PDF: PDFDocument error event:', err);
        reject(err);
      });
      setTimeout(() => reject(new Error('PDF generation timeout after 30 seconds')), 30000);
    });

    try {
      // Define colors for professional look
      const primaryColor = '#1a5f3f'; // Dark green matching brand
      const secondaryColor = '#666666';
      const lightGray = '#f5f5f5';
      const pageWidth = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right;

      // Header image - full width banner
      if (doc.headerImage) {
        try {
          const headerPath = getPublicPath(doc.headerImage);
          if (headerPath && fs.existsSync(headerPath)) {
            pdf.image(headerPath, pdf.page.margins.left, pdf.page.margins.top, { 
              width: pageWidth, 
              height: 200 
            });
            pdf.moveDown(5);
          }
        } catch (imgError: any) {
          console.warn('⚠️ PDF: Could not add header image:', imgError?.message);
        }
      }

      // Title with professional styling - ensure proper encoding for Swedish characters
      let title = String(doc.title || 'Okänt dokument');
      // Ensure title is properly decoded if it contains HTML entities
      title = title
        .replace(/&auml;/g, 'ä')
        .replace(/&aring;/g, 'å')
        .replace(/&ouml;/g, 'ö')
        .replace(/&Auml;/g, 'Ä')
        .replace(/&Aring;/g, 'Å')
        .replace(/&Ouml;/g, 'Ö')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      // Use Helvetica which supports basic Latin characters including Swedish
      // PDFKit handles UTF-8 encoding automatically, but we need to ensure clean text
      pdf
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(title, { 
          align: 'left', 
          lineGap: 5
        });
      
      pdf.moveDown(0.5);

      // Course info and metadata
      const courseNames: Record<string, string> = {
        'basic': 'Functional Basics',
        'flow': 'Functional Flow',
        'energy': 'Functional Energy',
        'hormone': 'Hormonell Balans'
      };
      const courseName = courseNames[doc.course] || courseNames[course] || 'Functional Foods';
      const readTime = doc.readTime || 5;
      
      // Metadata bar - ensure Swedish characters are properly encoded
      pdf
        .fontSize(10)
        .font('Helvetica')
        .fillColor(secondaryColor)
        .text(`${courseName} • ${readTime} min läsning`, { 
          align: 'left'
        });
      
      // Horizontal line separator
      const lineY = pdf.y;
      pdf
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .moveTo(pdf.page.margins.left, lineY + 5)
        .lineTo(pdf.page.width - pdf.page.margins.right, lineY + 5)
        .stroke();
      
      pdf.moveDown(1.5);

      // Body content with better formatting
      const text = stripHtmlPreserveNewlines(doc.content || '');
      if (text && text.trim()) {
        try {
          // Split into paragraphs for better formatting
          const paragraphs = text.split('\n\n').filter(p => p.trim());
          
          paragraphs.forEach((para, index) => {
            if (para.trim().length === 0) return;
            
            // Clean paragraph text
            let cleanPara = para.trim()
              .replace(/&auml;/g, 'ä')
              .replace(/&aring;/g, 'å')
              .replace(/&ouml;/g, 'ö')
              .replace(/&Auml;/g, 'Ä')
              .replace(/&Aring;/g, 'Å')
              .replace(/&Ouml;/g, 'Ö');
            
            // Main text with proper encoding
            pdf
              .fontSize(11)
              .font('Helvetica')
              .fillColor('#000000')
              .text(cleanPara, {
                align: 'left',
                lineGap: 3,
                width: pageWidth,
                continued: false
              });
            
            // Add spacing between paragraphs
            if (index < paragraphs.length - 1) {
              pdf.moveDown(0.5);
            }
          });
        } catch (textError: any) {
          console.error('❌ PDF: Error adding text:', textError?.message);
          const safeText = text.substring(0, 5000);
          pdf
            .fontSize(11)
            .font('Helvetica')
            .fillColor('#000000')
            .text(safeText || 'Innehåll kunde inte visas.', { 
              align: 'left',
              lineGap: 3,
              width: pageWidth
            });
        }
      } else {
        console.warn('⚠️ PDF: No content found for document');
        pdf
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#999999')
          .text('Inget innehåll tillgängligt.');
      }

      // Footer
      pdf.moveDown(2);
      const footerY = pdf.page.height - pdf.page.margins.bottom - 30;
      
      // Footer line
      pdf
        .strokeColor('#e0e0e0')
        .lineWidth(0.5)
        .moveTo(pdf.page.margins.left, footerY)
        .lineTo(pdf.page.width - pdf.page.margins.right, footerY)
        .stroke();
      
      // Footer text - ensure Swedish characters are properly encoded
      pdf
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          `Functional Foods med Ulrika Davidsson • functionalfoods.se • ${new Date().getFullYear()}`,
          pdf.page.margins.left,
          footerY + 10,
          { align: 'center', width: pageWidth }
        );
      
      // Page number
      pdf
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#cccccc')
        .text(
          `Sida 1`,
          pdf.page.margins.left,
          pdf.page.height - pdf.page.margins.bottom + 5,
          { align: 'right', width: pageWidth }
        );

      pdf.end();
      
      // Wait for PDF to finish generating
      const pdfBuffer = await pdfReady;

      const filename = `${slug}.pdf`;
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store'
        }
      });
    } catch (pdfGenError: any) {
      console.error('❌ PDF: Error during PDF generation:', pdfGenError);
      try {
        pdf.end();
      } catch {}
      throw pdfGenError;
    }
  } catch (e: any) {
    console.error('❌ PDF: Fatal error:', e);
    console.error('❌ PDF: Error details:', {
      message: e?.message,
      stack: e?.stack,
      courseId,
      slug,
      course
    });
    return NextResponse.json({ 
      error: 'Kunde inte generera PDF',
      details: process.env.NODE_ENV === 'development' ? e?.message : undefined
    }, { status: 500 });
  }
} 