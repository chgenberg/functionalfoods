import fs from 'fs';
import path from 'path';
// @ts-expect-error pdf-parse has no types
import pdfParse from 'pdf-parse';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

// Ensure you have set OPENAI_API_KEY in your environment.
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PDF_PATH = path.join(process.cwd(), 'public', 'Functional_Foods Råvaror_Lista.pdf');

async function extractRawMaterialNames(): Promise<string[]> {
  console.log('Extracting text from PDF...');
  const dataBuffer = fs.readFileSync(PDF_PATH);
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text;

  console.log('Asking AI to extract raw material names from the text...');
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a text processing expert. Your task is to extract a list of raw material names from the provided text, which is from a PDF. The text contains names, types, and descriptions. You must identify ONLY the names of the raw materials (e.g., "Blåbär (vaccinium myrtillus)", "Lingon (vaccinium vitis-idaea)"). Ignore headers, descriptions, and types like "Naturlig". Some names might be split across multiple lines; you must merge them. Return the result as a single JSON object with a single key "materials" containing an array of strings. Example output: { "materials": ["Blåbär (vaccinium myrtillus)", "Lingon (vaccinium vitis-idaea)"] }`
      },
      {
        role: 'user',
        content: text
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.0,
  });

  const result = completion.choices[0].message.content;
  if (!result) {
    throw new Error('AI did not return a result for raw material extraction.');
  }

  try {
    const parsedJson = JSON.parse(result);
    const names = parsedJson.materials;
    if (Array.isArray(names)) {
      return names.filter((name: unknown) => typeof name === 'string' && name.length > 0);
    }
    throw new Error('The parsed JSON from AI does not contain a "materials" array.');
  } catch (error) {
    console.error("Failed to parse AI response:", result);
    throw new Error('Failed to parse the list of raw materials from the AI response.');
  }
}

async function generateDescription(name: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Skriv en kort (2–3 meningar) beskrivning på svenska av råvaran "${name}" med fokus på dess näringsmässiga fördelar och vanliga användningsområden.`
      }
    ],
    temperature: 0.7
  });
  return completion.choices[0].message.content?.trim() || '';
}

async function upsertRawMaterial(name: string, description: string) {
  await prisma.rawMaterial.upsert({
    where: { name },
    create: { name, description },
    update: { description, updatedAt: new Date() }
  });
}

async function main() {
  const names = await extractRawMaterialNames();
  console.log(`Found ${names.length} raw materials in PDF.`);

  for (const name of names) {
    try {
      console.log(`Processing: ${name}`);
      const description = await generateDescription(name);
      await upsertRawMaterial(name, description);
    } catch (err) {
      console.error(`Failed processing ${name}:`, err);
    }
  }

  await prisma.$disconnect();
  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 