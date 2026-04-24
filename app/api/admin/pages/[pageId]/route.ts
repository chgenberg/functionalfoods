import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

function safeParseJson(value: unknown): any | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') return value;
  return null;
}

// GET - Get page content by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    
    const setting = await prisma.siteSettings.findUnique({
      where: { key: `page_${pageId}` }
    });

    if (!setting) {
      return NextResponse.json({ 
        pageId,
        content: null,
        message: 'No custom content - using defaults'
      });
    }

    const parsed = safeParseJson(setting.value);
    if (parsed === null) {
      console.warn(`⚠️ Invalid JSON for page_${pageId} in siteSettings`);
      return NextResponse.json({
        pageId,
        content: null,
        message: 'Invalid saved content - using defaults'
      });
    }

    return NextResponse.json({
      pageId,
      content: parsed,
      updatedAt: setting.updatedAt
    });
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

// PUT - Update page content
export async function PUT(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const adminUser = await verifyAdminAuth(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = params;
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Upsert the page content
    const setting = await prisma.siteSettings.upsert({
      where: { key: `page_${pageId}` },
      update: {
        value: JSON.stringify(content),
        type: 'json'
      },
      create: {
        key: `page_${pageId}`,
        value: JSON.stringify(content),
        type: 'json',
        description: `Content for ${pageId} page`
      }
    });

    return NextResponse.json({
      success: true,
      pageId,
      content: safeParseJson(setting.value),
      updatedAt: setting.updatedAt
    });
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE - Reset page to defaults
export async function DELETE(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const adminUser = await verifyAdminAuth(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = params;

    await prisma.siteSettings.delete({
      where: { key: `page_${pageId}` }
    }).catch(() => {
      // Ignore if doesn't exist
    });

    return NextResponse.json({
      success: true,
      message: 'Page reset to defaults'
    });
  } catch (error) {
    console.error('Failed to reset page:', error);
    return NextResponse.json({ error: 'Failed to reset page' }, { status: 500 });
  }
}

