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

interface UpdateRecipeData {
  title: string;
  excerpt: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  tips: string;
  tags: string[];
  status: 'publish' | 'draft';
  isPremium: boolean;
  imageUrl: string;
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

// Funktion för att konvertera tillbaka till CSV-format
function convertToCSVRecipe(updateData: UpdateRecipeData, originalRecipe: CSVRecipe): CSVRecipe {
  return {
    'Recept-titel': updateData.title,
    'Beskrivning': updateData.excerpt,
    'Kategori': updateData.category,
    'Svårighetsgrad': updateData.difficulty,
    'Förberedelsetid': updateData.prepTime,
    'Tillagningstid': updateData.cookTime,
    'Portioner': updateData.servings.toString(),
    'Ingredienser': updateData.ingredients.join(';'),
    'Instruktioner': updateData.instructions.join(';'),
    'Näringsvärden': originalRecipe['Näringsvärden'] || '', // Behåll befintliga näringsvärden
    'Tips': updateData.tips,
    'Taggar': updateData.tags.join(';'),
    'Bild': updateData.imageUrl,
    'Slug': originalRecipe.Slug || updateData.title.toLowerCase().replace(/[åäö]/g, (match) => ({ 'å': 'a', 'ä': 'a', 'ö': 'o' }[match] || match)).replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    'Status': updateData.status === 'publish' ? 'Publicerad' : 'Utkast',
    'Premium': updateData.isPremium ? 'Ja' : 'Nej',
    'Författare': originalRecipe['Författare'] || 'Ulrika Davidsson',
    'Datum': new Date().toISOString().split('T')[0] // Uppdatera datum
  };
}

// Funktion för att skriva CSV-data
function writeCSV(recipes: CSVRecipe[]): string {
  if (recipes.length === 0) return '';
  
  const headers = Object.keys(recipes[0]);
  const csvContent = [
    headers.join(','),
    ...recipes.map(recipe => 
      headers.map(header => `"${recipe[header as keyof CSVRecipe] || ''}"`).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

// GET - Hämta specifikt recept
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const csvPath = path.join(process.cwd(), 'Recept', 'Recept_Functional.csv');
    
    let csvData: string;
    try {
      csvData = await fs.readFile(csvPath, 'utf-8');
    } catch (error) {
      return NextResponse.json({ error: 'Recipe file not found' }, { status: 404 });
    }

    const csvRecipes = parseCSV(csvData);
    const recipeIndex = parseInt(params.id.replace('recipe-', '')) - 1;
    
    if (recipeIndex < 0 || recipeIndex >= csvRecipes.length) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const csvRecipe = csvRecipes[recipeIndex];
    
    // Konvertera till API-format
    const recipe = {
      id: params.id,
      title: csvRecipe['Recept-titel'] || 'Namnlöst recept',
      excerpt: csvRecipe.Beskrivning || 'Ingen beskrivning tillgänglig',
      imageUrl: csvRecipe.Bild || '/images/recipe-placeholder.svg',
      imageAlt: csvRecipe['Recept-titel'],
      categories: csvRecipe.Kategori ? csvRecipe.Kategori.split(';').map(c => c.trim()) : ['Okategoriserad'],
      ingredients: csvRecipe.Ingredienser ? csvRecipe.Ingredienser.split(';').map(i => i.trim()) : [],
      slug: csvRecipe.Slug || csvRecipe['Recept-titel'].toLowerCase().replace(/[åäö]/g, (match) => ({ 'å': 'a', 'ä': 'a', 'ö': 'o' }[match] || match)).replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
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
      instructions: csvRecipe.Instruktioner ? csvRecipe.Instruktioner.split(';').map(i => i.trim()) : [],
      tips: csvRecipe.Tips || '',
      tags: csvRecipe.Taggar ? csvRecipe.Taggar.split(';').map(t => t.trim()) : []
    };

    return NextResponse.json({ recipe });

  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}

// PUT - Uppdatera specifikt recept
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updateData: UpdateRecipeData = await request.json();
    const csvPath = path.join(process.cwd(), 'Recept', 'Recept_Functional.csv');
    
    // Läs befintlig CSV-fil
    let csvData: string;
    try {
      csvData = await fs.readFile(csvPath, 'utf-8');
    } catch (error) {
      return NextResponse.json({ error: 'Recipe file not found' }, { status: 404 });
    }

    const csvRecipes = parseCSV(csvData);
    const recipeIndex = parseInt(params.id.replace('recipe-', '')) - 1;
    
    if (recipeIndex < 0 || recipeIndex >= csvRecipes.length) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Uppdatera receptet
    const originalRecipe = csvRecipes[recipeIndex];
    const updatedRecipe = convertToCSVRecipe(updateData, originalRecipe);
    csvRecipes[recipeIndex] = updatedRecipe;

    // Skriv tillbaka till CSV-fil
    const newCSVContent = writeCSV(csvRecipes);
    
    // Skapa backup av befintlig fil
    const backupPath = csvPath + '.backup.' + Date.now();
    await fs.copyFile(csvPath, backupPath);
    
    // Skriv den nya filen
    await fs.writeFile(csvPath, newCSVContent, 'utf-8');

    // Returnera uppdaterat recept
    const updatedRecipeResponse = {
      id: params.id,
      title: updatedRecipe['Recept-titel'],
      excerpt: updatedRecipe.Beskrivning,
      imageUrl: updatedRecipe.Bild || '/images/recipe-placeholder.svg',
      categories: updatedRecipe.Kategori ? updatedRecipe.Kategori.split(';').map(c => c.trim()) : ['Okategoriserad'],
      ingredients: updatedRecipe.Ingredienser ? updatedRecipe.Ingredienser.split(';').map(i => i.trim()) : [],
      slug: updatedRecipe.Slug,
      status: updatedRecipe.Status?.toLowerCase() === 'publicerad' ? 'publish' : 'draft',
      isPremium: updatedRecipe.Premium?.toLowerCase() === 'ja',
      date: updatedRecipe.Datum,
      author: {
        name: updatedRecipe.Författare || 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: updatedRecipe.Svårighetsgrad,
      prepTime: updatedRecipe.Förberedelsetid,
      cookTime: updatedRecipe.Tillagningstid,
      servings: parseInt(updatedRecipe.Portioner) || 4,
      instructions: updatedRecipe.Instruktioner ? updatedRecipe.Instruktioner.split(';').map(i => i.trim()) : [],
      tips: updatedRecipe.Tips,
      tags: updatedRecipe.Taggar ? updatedRecipe.Taggar.split(';').map(t => t.trim()) : []
    };

    return NextResponse.json({ 
      message: 'Recipe updated successfully',
      recipe: updatedRecipeResponse,
      backupFile: backupPath
    });

  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

// DELETE - Ta bort specifikt recept
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const csvPath = path.join(process.cwd(), 'Recept', 'Recept_Functional.csv');
    
    // Läs befintlig CSV-fil
    let csvData: string;
    try {
      csvData = await fs.readFile(csvPath, 'utf-8');
    } catch (error) {
      return NextResponse.json({ error: 'Recipe file not found' }, { status: 404 });
    }

    const csvRecipes = parseCSV(csvData);
    const recipeIndex = parseInt(params.id.replace('recipe-', '')) - 1;
    
    if (recipeIndex < 0 || recipeIndex >= csvRecipes.length) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Ta bort receptet
    const deletedRecipe = csvRecipes[recipeIndex];
    csvRecipes.splice(recipeIndex, 1);

    // Skriv tillbaka till CSV-fil
    const newCSVContent = writeCSV(csvRecipes);
    
    // Skapa backup av befintlig fil
    const backupPath = csvPath + '.backup.' + Date.now();
    await fs.copyFile(csvPath, backupPath);
    
    // Skriv den nya filen
    await fs.writeFile(csvPath, newCSVContent, 'utf-8');

    return NextResponse.json({ 
      message: 'Recipe deleted successfully',
      deletedRecipe: deletedRecipe['Recept-titel'],
      backupFile: backupPath
    });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
} 