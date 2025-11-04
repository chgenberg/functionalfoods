import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://functionalfoods.se';
  const now = new Date();

  // Static paths
  const staticPaths: MetadataRoute.Sitemap = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/utbildning', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/utbildning/functional-basics', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/utbildning/functional-flow', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/utbildning/functional-energy', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/utbildning/functional-hormone', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/kunskapsbank', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/kunskapsbank/recept', priority: 0.8, changeFrequency: 'daily' },
    { path: '/kunskapsbank/artiklar', priority: 0.7, changeFrequency: 'daily' },
    { path: '/kunskapsbank/blogg', priority: 0.7, changeFrequency: 'daily' },
    { path: '/kunskapsbank/poddar', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/kunskapsbank/qa', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/kunskapsbank/ingredienser', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/boken', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/om-oss', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/kontakt', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/anvandarvillkor', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/integritetspolicy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/cookie-policy', priority: 0.3, changeFrequency: 'yearly' },
  ].map(({ path, priority, changeFrequency }) => ({ 
    url: `${site}${path}`, 
    lastModified: now, 
    changeFrequency: changeFrequency as any, 
    priority 
  }));

  try {
    // Fetch published recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED',
        // Exclude admin-only recipes
        NOT: {
          tags: {
            has: 'ADMIN_ONLY'
          }
        }
      },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true
      },
      take: 10000 // Adjust based on your needs
    });

    const recipePaths: MetadataRoute.Sitemap = recipes.map(recipe => ({
      url: `${site}/kunskapsbank/recept/${recipe.slug}`,
      lastModified: recipe.updatedAt || recipe.createdAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }));

    // Fetch published blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        published: true
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true
      },
      take: 10000
    });

    const blogPaths: MetadataRoute.Sitemap = blogPosts.map(post => ({
      url: `${site}/kunskapsbank/blogg/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || now,
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }));

    // Combine all paths
    return [...staticPaths, ...recipePaths, ...blogPaths];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static paths only if database query fails
    return staticPaths;
  }
} 