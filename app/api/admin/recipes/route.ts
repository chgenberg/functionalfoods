import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

// GET /api/admin/recipes - Get all recipes with admin view
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.categories = { has: category };
    }

    // Get recipes with pagination
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          categories: true,
          cookTime: true,
          prepTime: true,
          servings: true,
          isFree: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.recipe.count({ where })
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/recipes - Create new recipe
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const data = await request.json();
    
    // Check if slug already exists
    if (data.slug) {
      const existing = await prisma.recipe.findUnique({
        where: { slug: data.slug }
      });
      
      if (existing) {
        return NextResponse.json(
          { error: 'A recipe with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 