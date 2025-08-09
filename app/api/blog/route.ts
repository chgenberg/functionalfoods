import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const SUPPORTED = ['sv','en','es','de','fr'] as const;
type Lang = typeof SUPPORTED[number];
function getLang(req: NextRequest): Lang {
  const hdr = req.headers.get('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (m ? m[1] : '').toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val as Lang) ? (val as Lang) : 'sv';
}
function pick(obj: any, base: string, lang: Lang) {
  if (lang === 'sv') return obj[base];
  const k = `${base}_${lang}`;
  return obj[k] || obj[base];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const published = searchParams.get('published');
    const search = searchParams.get('search') || '';

    const lang = getLang(request);

    const where: any = {};
    if (published !== null) {
      where.published = published === 'true';
    }
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const blogPosts = await prisma.blogPost.findMany({
      where,
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalPosts = await prisma.blogPost.count({ where });

    const localized = blogPosts.map((p: any) => ({
      ...p,
      title: pick(p, 'title', lang),
      excerpt: pick(p, 'excerpt', lang),
      content: pick(p, 'content', lang),
    }));

    return NextResponse.json({
      posts: localized,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: (page * limit) < totalPosts
      }
    });

  } catch (error) {
    console.error('Error in blog API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminUser) return NextResponse.json({ error: 'No admin user found' }, { status: 403 });
    const data: any = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      published: body.published,
      publishedAt: body.published ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
      authorId: adminUser.id,
    };
    // Map i18n fields if provided
    ['en','es','de','fr'].forEach((lng) => {
      if (body[`title_${lng}`]) data[`title_${lng}`] = body[`title_${lng}`];
      if (body[`excerpt_${lng}`]) data[`excerpt_${lng}`] = body[`excerpt_${lng}`];
      if (body[`content_${lng}`]) data[`content_${lng}`] = body[`content_${lng}`];
      if (body[`metaDescription_${lng}`]) data[`metaDescription_${lng}`] = body[`metaDescription_${lng}`];
    });
    const blogPost = await prisma.blogPost.create({ data });
    return NextResponse.json(blogPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
} 