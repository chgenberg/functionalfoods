import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

function stripHtmlPreserveNewlines(html: string): string {
  try {
    let txt = html || '';
    txt = txt.replace(/<\/(h1|h2|h3)>/gi, '\n\n');
    txt = txt.replace(/<\/(p|li)>/gi, '\n');
    txt = txt.replace(/<[^>]*>/g, '');
    txt = txt
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    txt = txt.replace(/\n{3,}/g, '\n\n');
    return txt.trim();
  } catch {
    return html || '';
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
  
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const reqUrl = typeof req.url === 'string' ? req.url : '';
  const debugMode = /\bdebug=1\b/.test(reqUrl);
  try {
    const slug = params.slug;
    console.log('📄 Recipe PDF: Starting generation for', { slug });

    // Get recipe from database
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        imageUrl: true,
        ingredients: true,
        instructions: true,
        prepTime: true,
        cookTime: true,
        difficulty: true,
        servings: true,
        nutrition: true,
        tips: true
      }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recept hittades inte' }, { status: 404 });
    }

    console.log('✅ Recipe PDF: Found recipe:', recipe.title);

    console.log('✅ Recipe PDF: Using static pdfkit import');
    
    // Register custom fonts BEFORE creating PDFDocument to avoid Helvetica.afm error
    const regularFontPath = path.join(process.cwd(), 'public', 'fonts', 'OpenSans-Regular.ttf');
    const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'OpenSans-Bold.ttf');
    
    console.log('📄 Recipe PDF: Checking fonts at:', { regularFontPath, boldFontPath, cwd: process.cwd() });
    
    // Check if custom fonts exist
    const regularFontExists = fs.existsSync(regularFontPath);
    const boldFontExists = fs.existsSync(boldFontPath);
    
    if (!regularFontExists || !boldFontExists) {
      console.error('❌ Recipe PDF: Required fonts not found:', { regularFontExists, boldFontExists });
      throw new Error('Required fonts not found for PDF generation');
    }
    
    // Create PDF with autoFirstPage: false to prevent default font initialization
    const pdf = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      autoFirstPage: false,
      info: { Title: recipe.title }
    });
    
    // Register fonts before adding any pages
    try {
      pdf.registerFont('OpenSans', regularFontPath);
      pdf.registerFont('OpenSans-Bold', boldFontPath);
      console.log('✅ Recipe PDF: Custom fonts registered successfully');
    } catch (fontError: any) {
      console.error('❌ Recipe PDF: Failed to register fonts:', fontError?.message);
      throw new Error(`Failed to register fonts: ${fontError?.message}`);
    }
    
    // Now add the first page (after fonts are registered)
    pdf.addPage();
    
    // Set default font
    pdf.font('OpenSans');
    
    const boldFont = 'OpenSans-Bold';
    const regularFont = 'OpenSans';
    const italicFont = 'OpenSans'; // OpenSans doesn't have italic, use regular

    // Collect PDF chunks - set up BEFORE generating content
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
        console.error('❌ Recipe PDF: PDFDocument error event:', err);
        reject(err);
      });
      setTimeout(() => reject(new Error('PDF generation timeout')), 30000);
    });

    try {
      // Title
      const title = String(recipe.title || 'Okänt recept');
      pdf.fontSize(24).font(boldFont).text(title, { align: 'center' });
      pdf.moveDown(0.5);
      
      // Meta information
      pdf.fontSize(10).font(regularFont).fillColor('#555555');
      const metaInfo: string[] = [];
      if (recipe.prepTime) metaInfo.push(`Förberedelse: ${recipe.prepTime}`);
      if (recipe.cookTime) metaInfo.push(`Tillagning: ${recipe.cookTime}`);
      if (recipe.servings) metaInfo.push(`${recipe.servings} ${recipe.servings === 1 ? 'portion' : 'portioner'}`);
      if (recipe.difficulty) metaInfo.push(`Svårighetsgrad: ${recipe.difficulty}`);
      
      if (metaInfo.length > 0) {
        pdf.text(metaInfo.join(' • '), { align: 'center' });
      }
      pdf.moveDown(1);

      // Recipe image
      if (recipe.imageUrl) {
        try {
          const imagePath = getPublicPath(recipe.imageUrl);
          if (imagePath && fs.existsSync(imagePath)) {
            const pageWidth = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right;
            pdf.image(imagePath, { fit: [pageWidth, 200], align: 'center' });
            pdf.moveDown(1);
          }
        } catch (imgError: any) {
          console.warn('⚠️ Recipe PDF: Could not add image:', imgError?.message);
        }
      }

      // Excerpt
      if (recipe.excerpt) {
        pdf.fontSize(11).font(italicFont).fillColor('#666666').text(stripHtmlPreserveNewlines(recipe.excerpt), {
          align: 'left',
          lineGap: 2
        });
        pdf.moveDown(1);
      }

      // Ingredients
      const ingredients = recipe.ingredients || [];
      if (ingredients.length > 0) {
        pdf.fontSize(16).font(boldFont).fillColor('#000000').text('Ingredienser', { align: 'left' });
        pdf.moveDown(0.5);
        pdf.fontSize(12).font(regularFont).fillColor('#000000');
        
        ingredients.forEach((ingredient: string) => {
          if (ingredient && ingredient.trim()) {
            pdf.text(`• ${ingredient.trim()}`, { align: 'left', lineGap: 2 });
          }
        });
        pdf.moveDown(1);
      }

      // Instructions
      if (recipe.instructions) {
        pdf.fontSize(16).font(boldFont).fillColor('#000000').text('Instruktioner', { align: 'left' });
        pdf.moveDown(0.5);
        
        let instructions: string[] = [];
        if (Array.isArray(recipe.instructions)) {
          instructions = recipe.instructions;
        } else {
          instructions = recipe.instructions.split('\n').filter((s: string) => s.trim());
        }

        pdf.fontSize(12).font(regularFont).fillColor('#000000');
        instructions.forEach((step: string, index: number) => {
          if (step && step.trim()) {
            pdf.text(`${index + 1}. ${stripHtmlPreserveNewlines(step.trim())}`, {
              align: 'left',
              lineGap: 2
            });
            pdf.moveDown(0.3);
          }
        });
        pdf.moveDown(1);
      }

      // Nutrition info
      if (recipe.nutrition && typeof recipe.nutrition === 'object') {
        const nutrition = recipe.nutrition as any;
        const perServing = nutrition.perServing || nutrition;
        
        if (perServing.energy || perServing.calories) {
          pdf.fontSize(16).font(boldFont).fillColor('#000000').text('Näringsvärde per portion', { align: 'left' });
          pdf.moveDown(0.5);
          pdf.fontSize(11).font(regularFont).fillColor('#000000');
          
          const nutritionInfo: string[] = [];
          if (perServing.energy || perServing.calories) {
            nutritionInfo.push(`${Math.round(perServing.energy || perServing.calories || 0)} kcal`);
          }
          if (perServing.protein) {
            nutritionInfo.push(`Protein: ${Math.round(perServing.protein * 10) / 10}g`);
          }
          if (perServing.carbohydrates || perServing.carbs) {
            nutritionInfo.push(`Kolhydrater: ${Math.round((perServing.carbohydrates || perServing.carbs || 0) * 10) / 10}g`);
          }
          if (perServing.fat) {
            nutritionInfo.push(`Fett: ${Math.round(perServing.fat * 10) / 10}g`);
          }
          
          if (nutritionInfo.length > 0) {
            pdf.text(nutritionInfo.join(' • '), { align: 'left' });
          }
          pdf.moveDown(1);
        }
      }

      // Tips
      if (recipe.tips) {
        pdf.fontSize(14).font(boldFont).fillColor('#000000').text('Tips', { align: 'left' });
        pdf.moveDown(0.5);
        pdf.fontSize(11).font(regularFont).fillColor('#000000').text(stripHtmlPreserveNewlines(recipe.tips), {
          align: 'left',
          lineGap: 2
        });
      }

      // Footer
      pdf.fontSize(8).font(regularFont).fillColor('#999999').text(
        `Functional Foods med Ulrika Davidsson • functionalfoods.se • ${new Date().getFullYear()}`,
        { align: 'center' }
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
      console.error('❌ Recipe PDF: Error during PDF generation:', pdfGenError);
      console.error('❌ Recipe PDF: Error details:', {
        message: pdfGenError?.message,
        stack: pdfGenError?.stack,
        name: pdfGenError?.name
      });
      try {
        pdf.end();
      } catch {}
      throw pdfGenError;
    }
  } catch (e: any) {
    console.error('❌ Recipe PDF: Fatal error:', e);
    console.error('❌ Recipe PDF: Error details:', {
      message: e?.message,
      stack: e?.stack,
      slug: params.slug,
      name: e?.name,
      cause: e?.cause
    });
    
    // Return user-friendly error message
    const errorMessage = e?.message || 'Unknown error';
    const isImportError = errorMessage.includes('Failed to load PDF library') || errorMessage.includes('pdfkit');
    
    return NextResponse.json({ 
      error: 'Kunde inte generera PDF',
      details: (debugMode || process.env.NODE_ENV === 'development') ? errorMessage : undefined,
      ...(isImportError && { hint: 'PDF library not available' })
    }, { status: 500 });
  }
}

