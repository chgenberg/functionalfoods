export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 3600; // Cache images for 1 hour

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function slugifyFilename(name: string): string {
  // Don't decode if already decoded - just normalize
  const withoutExt = name.replace(/\.[^/.]+$/, '');
  const translit = withoutExt
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[ÉéÈèÊêËë]/g, 'e')
    .replace(/[ÁáÀàÂâÄä]/g, 'a')
    .replace(/[ÍíÌìÎîÏï]/g, 'i')
    .replace(/[ÓóÒòÔôÖö]/g, 'o')
    .replace(/[ÚúÙùÛûÜü]/g, 'u')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return translit + '.webp';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Decode each path segment properly
    const decodedPath = params.path.map(segment => decodeURIComponent(segment)).join('/');
    const filePath = path.join(process.cwd(), 'public', decodedPath);
    
    console.log('🖼️ Image request:', decodedPath);
    
    // Security check - ensure path is within public directory
    const publicDir = path.join(process.cwd(), 'public');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(publicDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    let targetPath = resolvedPath;

    // If not exists, try slugified filename variant (spaces -> -, åäö -> a/o, etc.)
    if (!fs.existsSync(targetPath)) {
      const dir = path.dirname(resolvedPath);
      const base = path.basename(resolvedPath);
      const fallback = slugifyFilename(base);
      const candidate = path.join(dir, fallback);
      console.log('🔄 Trying slugified fallback:', fallback);
      if (fs.existsSync(candidate)) {
        targetPath = candidate;
        console.log('✅ Found slugified version');
      }
    }

    // Final fallback to placeholder to avoid broken thumbnails
    if (!fs.existsSync(targetPath)) {
      const placeholder = path.join(publicDir, 'images', 'blog-placeholder.jpg');
      if (fs.existsSync(placeholder)) {
        console.log('ℹ️ Using placeholder image');
        targetPath = placeholder;
      } else {
        console.log('❌ File not found and no placeholder available:', targetPath);
        return new NextResponse('Not Found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
      }
    }

    console.log('✅ Serving:', targetPath);

    // Transform on the fly if size/quality requested
    const url = new URL(request.url);
    const w = parseInt(url.searchParams.get('w') || '0', 10) || undefined;
    const hRaw = parseInt(url.searchParams.get('h') || '0', 10);
    const h = hRaw > 0 ? hRaw : undefined;
    const q = parseInt(url.searchParams.get('q') || '0', 10) || 80;
    const fmt = (url.searchParams.get('format') || '').toLowerCase();

    let fileBuffer: Buffer = fs.readFileSync(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    let contentType = 'image/webp';

    // Use 'inside' fit to preserve aspect ratio when only width is provided; fall back to cover when both provided
    const fitMode = w && h ? 'cover' : 'inside';

    if (fmt === 'webp' || ext === '.webp') {
      const pipeline = sharp(fileBuffer).rotate();
      if (w || h) pipeline.resize(w, h, { fit: fitMode as any, withoutEnlargement: true });
      fileBuffer = await pipeline.webp({ quality: q }).toBuffer() as Buffer;
      contentType = 'image/webp';
    } else {
      const pipeline = sharp(fileBuffer).rotate();
      if (w || h) pipeline.resize(w, h, { fit: fitMode as any, withoutEnlargement: true });
      fileBuffer = await pipeline.jpeg({ quality: q, mozjpeg: true }).toBuffer() as Buffer;
      contentType = 'image/jpeg';
    }

    // Convert Node Buffer to ArrayBuffer slice to satisfy Web Response typing
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

    return new NextResponse(arrayBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        // Allow long caching in clients/CDN while letting us bust via file name changes
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
} 