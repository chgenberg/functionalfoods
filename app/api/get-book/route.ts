import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Hitta den senaste genererade boken
    const booksDir = path.join(process.cwd(), 'books');
    
    // Check if books directory exists
    try {
      await fs.access(booksDir);
    } catch {
      return NextResponse.json(
        { error: 'Books directory not found' },
        { status: 404 }
      );
    }
    
    const bookDirs = await fs.readdir(booksDir);
    
    if (bookDirs.length === 0) {
      return NextResponse.json(
        { error: 'No books found' },
        { status: 404 }
      );
    }

    // Använd den senaste boken
    const latestBookDir = bookDirs[bookDirs.length - 1];
    const bookPath = path.join(booksDir, latestBookDir);
    
    // Läs alla kapitel
    const chapters = [];
    const files = await fs.readdir(bookPath);
    
    for (const file of files.sort()) {
      if (file.startsWith('chapter_')) {
        const content = await fs.readFile(path.join(bookPath, file), 'utf-8');
        chapters.push(content);
      }
    }

    return NextResponse.json({ chapters });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book content' },
      { status: 500 }
    );
  }
} 