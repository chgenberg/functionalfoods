import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { bookTitle, topic, numChapters } = await request.json();

    // Validera input
    if (!bookTitle || !topic || !numChapters) {
      return NextResponse.json(
        { error: 'Alla fält måste fyllas i' },
        { status: 400 }
      );
    }

    // Kör Python-skriptet
    const scriptPath = path.join(process.cwd(), 'Ulrika_Lookalike', 'text_analyzer.py');
    const command = `python3 ${scriptPath} "${bookTitle}" "${topic}" ${numChapters}`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json(
        { error: 'Ett fel uppstod vid generering av texten' },
        { status: 500 }
      );
    }

    // Generera ett unikt ID för boken
    const bookId = Date.now().toString();

    return NextResponse.json({ 
      bookId,
      message: 'Boken har genererats framgångsrikt',
      output: stdout 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid generering av texten' },
      { status: 500 }
    );
  }
} 