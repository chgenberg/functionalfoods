import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/app/lib/seo';
import { prisma } from '@/app/lib/database';
import RecipePageClient from './page.client';

type Props = {
  params: {
    slug: string;
  };
};

const ALIASES: Record<string, string> = {
  'mandelkaka-med-med-choklad': 'mandelkaka-med-choklad',
  'tonfisksallad-apple-sallad': 'tonfisksallad-med-apple',
  'squashspagetti-kottfarssas': 'squashspagetti-med-kottfarssas',
  'omelett-bar': 'omelett-med-bar',
  'agghack-kalkon': 'agghack-med-kalkon',
  'stekt-agg-lax-2': 'stekt-agg-med-champinjoner-2',
  'stek-torsk-med-bearnaisesas-och-haricot-verts': 'stekt-torsk-med-bearnaisesas-och-haricots-verts',
  'stekt-torsk-med-bearnaisesas-och-haricot-verts': 'stekt-torsk-med-bearnaisesas-och-haricots-verts',
  'smoothiebowl-med-mango-och-jordgubbar': 'smoothiebowl',
  'smoothie-smoothiebowl': 'tropisk-smoothiebowl',
  'laxsallad-med-druvor': 'laxsallad-med-vindruvor',
  'havrefrallor-morotter-aprikoser': 'havrefralla-med-morotter-och-torkade-aprikoser',
  'lax-broccolipaj': 'lax-och-broccolipaj',
};

function normalizeImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '/images/recipe-placeholder.svg';

  let url = imageUrl;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/public/')) url = url.replace('/public', '');
  if (url.startsWith('public/')) url = url.replace('public/', '/');
  return url.startsWith('/') ? url : `/${url}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const requestedSlug = params.slug;
  const canonicalSlug = ALIASES[requestedSlug] || requestedSlug;

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug: canonicalSlug },
      select: {
        title: true,
        excerpt: true,
        imageUrl: true,
      },
    });

    if (!recipe) {
      return generateSEOMetadata({
        title: 'Recept hittades inte',
        description: 'Receptet du söker kunde inte hittas.',
        url: `/kunskapsbank/recept/${requestedSlug}`,
        image: '/images/recipe-placeholder.svg',
        type: 'article',
      });
    }

    return generateSEOMetadata({
      title: recipe.title,
      description:
        recipe.excerpt ||
        'Utforska näringsrika recept inom functional foods för bättre hälsa och energi.',
      url: `/kunskapsbank/recept/${requestedSlug}`,
      image: normalizeImageUrl(recipe.imageUrl),
      type: 'article',
    });
  } catch {
    return generateSEOMetadata({
      title: 'Recept',
      description: 'Utforska näringsrika recept inom functional foods för bättre hälsa och energi.',
      url: `/kunskapsbank/recept/${requestedSlug}`,
      image: '/images/recipe-placeholder.svg',
      type: 'article',
    });
  }
}

export default function RecipePage() {
  return <RecipePageClient />;
}
