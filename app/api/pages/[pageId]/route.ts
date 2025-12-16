import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get page content by ID (public endpoint)
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
        content: null
      });
    }

    return NextResponse.json({
      pageId,
      content: JSON.parse(setting.value)
    });
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

