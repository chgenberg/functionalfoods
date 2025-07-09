import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface CSVRecipe {
  'Recept-titel': string;
  'Beskrivning': string;
  'Kategori': string;
  'Svårighetsgrad': string;
  'Förberedelsetid': string;
  'Tillagningstid': string;
  'Portioner': string;
  'Ingredienser': string;
  'Instruktioner': string;
  'Näringsvärden': string;
  'Tips': string;
  'Taggar': string;
  'Bild': string;
  'Slug': string;
  'Status': string;
  'Premium': string;
  'Författare': string;
  'Datum': string;
}

interface Recipe {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'publish' | 'draft';
  isPremium: boolean;
  date: string;
  author: {
    name: string;
    username: string;
  };
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  instructions?: string[];
  nutrition?: any;
  tips?: string;
  tags?: string[];
}

// Funktion för att parsa CSV-data
function parseCSV(csvData: string): CSVRecipe[] {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const recipes: CSVRecipe[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const recipe: any = {};
    
    headers.forEach((header, index) => {
      recipe[header] = values[index] || '';
    });
    
    recipes.push(recipe as CSVRecipe);
  }
  
  return recipes;
}

// Funktion för att konvertera CSV-recept till API-format
function convertCSVToRecipe(csvRecipe: CSVRecipe, index: number): Recipe {
  const categories = csvRecipe.Kategori ? csvRecipe.Kategori.split(';').map(c => c.trim()) : ['Okategoriserad'];
  const ingredients = csvRecipe.Ingredienser ? csvRecipe.Ingredienser.split(';').map(i => i.trim()) : [];
  const instructions = csvRecipe.Instruktioner ? csvRecipe.Instruktioner.split(';').map(i => i.trim()) : [];
  const tags = csvRecipe.Taggar ? csvRecipe.Taggar.split(';').map(t => t.trim()) : [];
  
  // Generera slug från titel om det inte finns
  const title = csvRecipe['Recept-titel'] || 'namnlost-recept';
  const slug = csvRecipe.Slug || title
    .toLowerCase()
    .replace(/[åäö]/g, (match) => ({ 'å': 'a', 'ä': 'a', 'ö': 'o' }[match] || match))
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: `recipe-${index + 1}`,
    title: csvRecipe['Recept-titel'] || 'Namnlöst recept',
    excerpt: csvRecipe.Beskrivning || 'Ingen beskrivning tillgänglig',
    imageUrl: csvRecipe.Bild || '/images/recipe-placeholder.svg',
    imageAlt: csvRecipe['Recept-titel'],
    categories,
    ingredients,
    slug,
    status: csvRecipe.Status?.toLowerCase() === 'publicerad' ? 'publish' : 'draft',
    isPremium: csvRecipe.Premium?.toLowerCase() === 'ja' || csvRecipe.Premium?.toLowerCase() === 'true',
    date: csvRecipe.Datum || new Date().toISOString(),
    author: {
      name: csvRecipe.Författare || 'Ulrika Davidsson',
      username: 'ulrika'
    },
    difficulty: csvRecipe.Svårighetsgrad || 'Medel',
    prepTime: csvRecipe.Förberedelsetid || '30 min',
    cookTime: csvRecipe.Tillagningstid || '30 min',
    servings: parseInt(csvRecipe.Portioner) || 4,
    instructions,
    tips: csvRecipe.Tips || '',
    tags
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Läs CSV-filen
    const csvPath = path.join(process.cwd(), 'Recept', 'Recept_Functional.csv');
    
    let csvData: string;
    try {
      csvData = await fs.readFile(csvPath, 'utf-8');
    } catch (error) {
      console.error('Error reading CSV file:', error);
      // Fallback till dummy data om CSV inte kan läsas
      return NextResponse.json({
        recipes: generateDummyRecipes(),
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          totalPages: 1,
          hasMore: false
        },
        categories: ['Frukost', 'Lunch', 'Middag', 'Mellanmål', 'Efterrätt'],
        statistics: {
          total: 4,
          free: 3,
          premium: 1,
          visible: 4
        }
      });
    }

    // Parsa CSV och konvertera till recept
    const csvRecipes = parseCSV(csvData);
    let recipes = csvRecipes.map((csvRecipe, index) => convertCSVToRecipe(csvRecipe, index));

    // Filtrera baserat på sökparametrar
    if (category) {
      recipes = recipes.filter(recipe => recipe.categories.includes(category));
    }

    if (status) {
      recipes = recipes.filter(recipe => {
        if (status === 'published') return recipe.status === 'publish' && !recipe.isPremium;
        if (status === 'draft') return recipe.status === 'draft';
        if (status === 'premium') return recipe.isPremium;
        return true;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      recipes = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.excerpt.toLowerCase().includes(searchLower) ||
        recipe.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    // Paginering
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecipes = recipes.slice(startIndex, endIndex);

    // Extrahera unika kategorier
    const allCategories = [...new Set(recipes.flatMap(recipe => recipe.categories))];

    // Beräkna statistik
    const statistics = {
      total: recipes.length,
      free: recipes.filter(r => r.status === 'publish' && !r.isPremium).length,
      premium: recipes.filter(r => r.isPremium).length,
      visible: recipes.filter(r => r.status === 'publish').length
    };

    return NextResponse.json({
      recipes: paginatedRecipes,
      pagination: {
        page,
        limit,
        total: recipes.length,
        totalPages: Math.ceil(recipes.length / limit),
        hasMore: endIndex < recipes.length
      },
      categories: allCategories.sort(),
      statistics
    });

  } catch (error) {
    console.error('Error in recipes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// Dummy data som fallback
function generateDummyRecipes(): Recipe[] {
  return [
    {
      id: 'recipe-1',
      title: 'Grön super-smoothie',
      excerpt: 'En näringsrik smoothie full av antioxidanter och vitaminer',
      imageUrl: '/smoothie.jpg',
      categories: ['Frukost', 'Mellanmål'],
      ingredients: ['Spenat', 'Banan', 'Avokado', 'Kokosvatten'],
      slug: 'gron-super-smoothie',
      status: 'publish',
      isPremium: false,
      date: '2024-01-15T10:00:00Z',
      author: {
        name: 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: 'Lätt',
      prepTime: '5 min',
      cookTime: '0 min',
      servings: 2,
      instructions: ['Mixa alla ingredienser', 'Servera direkt'],
      tips: 'Använd frusen banan för extra krämighet',
      tags: ['Vegan', 'Glutenfri', 'Antioxidanter']
    },
    {
      id: 'recipe-2',
      title: 'Anti-inflammatorisk laxsallad',
      excerpt: 'Omega-3-rik laxsallad med anti-inflammatoriska ingredienser',
      imageUrl: '/salmon_salad.jpg',
      categories: ['Lunch', 'Middag'],
      ingredients: ['Laxfilé', 'Spenat', 'Avokado', 'Valnötter'],
      slug: 'anti-inflammatorisk-laxsallad',
      status: 'publish',
      isPremium: false,
      date: '2024-01-12T14:30:00Z',
      author: {
        name: 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: 'Medel',
      prepTime: '15 min',
      cookTime: '10 min',
      servings: 4,
      instructions: ['Grilla laxen', 'Blanda salladen', 'Servera med dressing'],
      tips: 'Välj ekologisk lax för bästa kvalitet',
      tags: ['Omega-3', 'Anti-inflammatorisk', 'Proteinrik']
    },
    {
      id: 'recipe-3',
      title: 'Chiapudding med bär',
      excerpt: 'Näringsrik chiapudding med antioxidantrika bär',
      imageUrl: '/chia_pudding.jpg',
      categories: ['Frukost', 'Efterrätt'],
      ingredients: ['Chiafrön', 'Mandelmjölk', 'Blåbär', 'Honung'],
      slug: 'chiapudding-med-bar',
      status: 'draft',
      isPremium: true,
      date: '2024-01-10T09:15:00Z',
      author: {
        name: 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: 'Lätt',
      prepTime: '10 min',
      cookTime: '0 min',
      servings: 2,
      instructions: ['Blanda chiafrön med mjölk', 'Låt svälla över natten', 'Toppa med bär'],
      tips: 'Rör om efter 30 minuter för att undvika klumpar',
      tags: ['Superfood', 'Fibrer', 'Antioxidanter']
    },
    {
      id: 'recipe-4',
      title: 'Värmande linssoppa',
      excerpt: 'Proteinrik och värmande linssoppa med anti-inflammatoriska kryddor',
      imageUrl: '/lentil_soup.jpg',
      categories: ['Middag', 'Lunch'],
      ingredients: ['Röda linser', 'Kokosgrädde', 'Ingefära', 'Gurkmeja'],
      slug: 'varmande-linssoppa',
      status: 'publish',
      isPremium: false,
      date: '2024-01-08T16:45:00Z',
      author: {
        name: 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: 'Medel',
      prepTime: '15 min',
      cookTime: '30 min',
      servings: 6,
      instructions: ['Stek löken', 'Tillsätt linser och buljong', 'Sjud i 25 minuter'],
      tips: 'Servera med kokosflingor för extra smak',
      tags: ['Vegan', 'Proteinrik', 'Anti-inflammatorisk']
    }
  ];
} 