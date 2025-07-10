import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const published = searchParams.get('published');
    const search = searchParams.get('search') || '';

    // Build Prisma filter
    const where: any = {};

    // Filter by published status
    if (published !== null) {
      where.published = published === 'true';
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Fetch blog posts from database
    const blogPosts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Count total posts
    const totalPosts = await prisma.blogPost.count({ where });

    return NextResponse.json({
      posts: blogPosts,
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
    
    // Get the admin user (in a real app, this would come from auth)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 403 }
      );
    }
    
    // Create the blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        published: body.published,
        publishedAt: body.published ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
        authorId: adminUser.id,
      },
    });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
} 