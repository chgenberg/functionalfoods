import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

// Use a singleton pattern for PrismaClient to avoid connection issues
let prisma: PrismaClient;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.functionalfoods.se';
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

  let recipePaths: MetadataRoute.Sitemap = [];
  let blogPaths: MetadataRoute.Sitemap = [];

  // Try to fetch dynamic content, but don't fail completely if database is unavailable
  try {
    const prismaClient = getPrismaClient();
    
    // Fetch published recipes with timeout
    try {
      const recipes = await Promise.race([
        prismaClient.recipe.findMany({
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
          take: 10000
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Recipe query timeout')), 10000)
        )
      ]) as Awaited<ReturnType<typeof prismaClient.recipe.findMany>>;

      recipePaths = recipes.map(recipe => ({
        url: `${site}/kunskapsbank/recept/${recipe.slug}`,
        lastModified: recipe.updatedAt || recipe.createdAt || now,
        changeFrequency: 'weekly' as const,
        priority: 0.7
      }));

      console.log(`✅ Sitemap: Added ${recipes.length} recipes`);
    } catch (recipeError) {
      console.error('⚠️ Sitemap: Failed to fetch recipes:', recipeError);
      // Continue without recipes
    }

    // Fetch published blog posts with timeout
    try {
      const blogPosts = await Promise.race([
        prismaClient.blogPost.findMany({
          where: {
            published: true
          },
          select: {
            slug: true,
            updatedAt: true,
            publishedAt: true
          },
          take: 10000
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Blog query timeout')), 10000)
        )
      ]) as Awaited<ReturnType<typeof prismaClient.blogPost.findMany>>;

      blogPaths = blogPosts.map(post => ({
        url: `${site}/kunskapsbank/blogg/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || now,
        changeFrequency: 'monthly' as const,
        priority: 0.6
      }));

      console.log(`✅ Sitemap: Added ${blogPosts.length} blog posts`);
    } catch (blogError) {
      console.error('⚠️ Sitemap: Failed to fetch blog posts:', blogError);
      // Continue without blog posts
    }

  } catch (error) {
    console.error('⚠️ Sitemap: Database connection error:', error);
    // Continue with static paths only
  }

  // Combine all paths
  const allPaths = [...staticPaths, ...recipePaths, ...blogPaths];
  console.log(`✅ Sitemap generated with ${allPaths.length} total URLs (${staticPaths.length} static + ${recipePaths.length} recipes + ${blogPaths.length} blog posts)`);
  
  return allPaths;
} 
