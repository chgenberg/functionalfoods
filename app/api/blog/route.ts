import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: List all blog posts
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
      include: { author: true },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST: Create a new blog post
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      title,
      slug,
      content,
      imageUrl,
      imageAlt,
      metaTitle,
      metaDesc,
      status,
      scheduledAt,
      publishedAt,
      authorId,
    } = data;

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        imageUrl,
        imageAlt,
        metaTitle,
        metaDesc,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        authorId,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
} 