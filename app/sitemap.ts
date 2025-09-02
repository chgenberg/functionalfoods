import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://functionalfoods.se';
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    '',
    '/utbildning',
    '/kunskapsbank',
    '/boken',
    '/om-oss',
    '/om-oss/kontakta-oss',
  ].map((path) => ({ url: `${site}${path}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 }));

  return staticPaths;
} 