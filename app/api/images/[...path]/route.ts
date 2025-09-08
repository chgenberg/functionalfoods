import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function slugifyFilename(name: string): string {
  const decoded = decodeURIComponent(name);
  const withoutExt = decoded.replace(/\.[^/.]+$/, '');
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
    const imagePath = params.path.join('/');
    const filePath = path.join(process.cwd(), 'public', imagePath);
    
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
      if (fs.existsSync(candidate)) {
        targetPath = candidate;
      }
    }

    // Check again
    if (!fs.existsSync(targetPath)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(targetPath);
    
    // Determine content type
    const ext = path.extname(targetPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 