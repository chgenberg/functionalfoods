import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://functionalfoods.se';
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    '',
    '/utbildning',
    '/kunskapsbank',
    '/boken',
    '/kontakt/adress',
  ].map((path) => ({ url: `${site}${path}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 }));

  return staticPaths;
} 