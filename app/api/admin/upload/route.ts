import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { verifyAdminAuth } from '@/app/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const adminUser = await verifyAdminAuth(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.` },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Create filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const filename = `${timestamp}-${originalName}`;

    // Determine upload directory based on type
    let uploadDir = 'uploads';
    if (type === 'recipe') {
      uploadDir = 'recept_images_2025';
    } else if (type === 'blog') {
      uploadDir = 'Blogginlagg';
    } else if (type === 'course') {
      uploadDir = 'kurser';
    } else if (type === 'book') {
      uploadDir = 'bocker';
    }

    // Create upload directory if it doesn't exist
    const publicDir = join(process.cwd(), 'public');
    const uploadPath = join(publicDir, uploadDir);
    
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filePath = join(uploadPath, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/${uploadDir}/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadDir,
      message: 'File uploaded successfully',
      security: 'Admin-only upload with 10MB limit'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please check file size (max 10MB) and format (JPEG, PNG, WebP, GIF).' },
      { status: 500 }
    );
  }
}

// Handle file size limits - Next.js 14 format
export const maxDuration = 30; // 30 seconds timeout
