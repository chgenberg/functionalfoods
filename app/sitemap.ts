import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://functionalfoods.se';
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/utbildning', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/utbildning/functional-basics', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/utbildning/functional-flow', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/utbildning/functional-energy', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/kunskapsbank', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/kunskapsbank/recept', priority: 0.8, changeFrequency: 'daily' },
    { path: '/kunskapsbank/artiklar', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/boken', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/om-oss', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/kontakt', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/anvandarvillkor', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/integritetspolicy', priority: 0.3, changeFrequency: 'yearly' },
  ].map(({ path, priority, changeFrequency }) => ({ 
    url: `${site}${path}`, 
    lastModified: now, 
    changeFrequency: changeFrequency as any, 
    priority 
  }));

  return staticPaths;
} 