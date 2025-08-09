import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data: any = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      published: body.published,
      publishedAt: body.published ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
    };
    ['en','es','de','fr'].forEach((lng) => {
      if (body[`title_${lng}`]) data[`title_${lng}`] = body[`title_${lng}`];
      if (body[`excerpt_${lng}`]) data[`excerpt_${lng}`] = body[`excerpt_${lng}`];
      if (body[`content_${lng}`]) data[`content_${lng}`] = body[`content_${lng}`];
      if (body[`metaDescription_${lng}`]) data[`metaDescription_${lng}`] = body[`metaDescription_${lng}`];
    });
    const blogPost = await prisma.blogPost.update({ where: { id: params.id }, data });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.blogPost.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
} 