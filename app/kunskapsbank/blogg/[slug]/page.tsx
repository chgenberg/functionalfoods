import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateMetadata as generateSEOMetadata } from '@/app/lib/seo';
import { prisma } from '@/app/lib/database';
import BlogPostPageClient from './page.client';

type Props = {
  params: {
    slug: string;
  };
};

function normalizeImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '/images/blog-placeholder.jpg';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: {
        title: true,
        excerpt: true,
        coverImage: true,
      },
    });

    if (!post) {
      return generateSEOMetadata({
        title: 'Artikel hittades inte',
        description: 'Artikeln du söker kunde inte hittas.',
        url: `/kunskapsbank/blogg/${params.slug}`,
        image: '/images/blog-placeholder.jpg',
        type: 'article',
      });
    }

    return generateSEOMetadata({
      title: post.title,
      description:
        post.excerpt ||
        'Läs artiklar om functional foods, hälsa och longevity i vår kunskapsbank.',
      url: `/kunskapsbank/blogg/${params.slug}`,
      image: normalizeImageUrl(post.coverImage),
      type: 'article',
    });
  } catch {
    return generateSEOMetadata({
      title: 'Artikel',
      description: 'Läs artiklar om functional foods, hälsa och longevity i vår kunskapsbank.',
      url: `/kunskapsbank/blogg/${params.slug}`,
      image: '/images/blog-placeholder.jpg',
      type: 'article',
    });
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!post) {
    notFound();
  }

  return <BlogPostPageClient params={params} />;
}
