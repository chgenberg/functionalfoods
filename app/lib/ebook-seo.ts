import { Metadata } from 'next';
import { prisma } from '@/app/lib/database';
import { generateMetadata as generateSEOMetadata } from '@/app/lib/seo';

type EbookSeoOptions = {
  pageId: string;
  url: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImage: string;
  keywords?: string[];
};

type PageContent = {
  title?: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  price?: string;
  features?: string[];
  authorSection?: string;
};

function normalizeImageUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

function parsePageContent(raw: string): PageContent | null {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as PageContent) : null;
  } catch {
    return null;
  }
}

export async function getEbookPageContent(
  pageId: string,
): Promise<PageContent | null> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: `page_${pageId}` },
    select: { value: true },
  });
  return setting?.value ? parsePageContent(setting.value) : null;
}

export async function generateEbookMetadata(
  options: EbookSeoOptions,
): Promise<Metadata> {
  const {
    pageId,
    url,
    fallbackTitle,
    fallbackDescription,
    fallbackImage,
    keywords = ['e-bok', 'functional foods', 'Ulrika Davidsson'],
  } = options;

  try {

    const content = await getEbookPageContent(pageId);
    const title = [content?.title, content?.subtitle].filter(Boolean).join(' - ') || fallbackTitle;
    const description =
      content?.description || content?.shortDescription || fallbackDescription;
    const image = normalizeImageUrl(content?.image) || fallbackImage;

    return generateSEOMetadata({
      title,
      description,
      keywords,
      url,
      image,
      type: 'website',
    });
  } catch {
    return generateSEOMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      keywords,
      url,
      image: fallbackImage,
      type: 'website',
    });
  }
}
