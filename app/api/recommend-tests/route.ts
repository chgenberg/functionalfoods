import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import stringSimilarity from "string-similarity";

interface Test {
  name: string;
  description: string;
  benefits?: string;
  source_url: string;
}

function parseTestFile(content: string): Test {
  const lines = content.split('\n');
  const test: any = {};
  
  lines.forEach(line => {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) {
      test[key] = value;
    }
  });
  
  return test as Test;
}

function calculateTestScore(test: Test, micronutrientResults: any): number {
  let score = 0;
  
  // Create a combined text field for searching
  const searchableText = `${test.name} ${test.description} ${test.benefits || ''}`.toLowerCase();
  
  // Match against micronutrient results
  Object.entries(micronutrientResults).forEach(([nutrient, status]: [string, any]) => {
    // If the nutrient is mentioned in the test description or benefits
    if (searchableText.includes(nutrient.toLowerCase())) {
      // If nutrient is low or deficient, increase score
      if (status.toLowerCase().includes('low') || status.toLowerCase().includes('deficient')) {
        score += 2;
      }
    }
  });
  
  // Additional scoring based on symptoms or conditions mentioned
  const symptoms = [
    'fatigue', 'headache', 'digestive', 'immune', 'skin', 'mood',
    'sleep', 'energy', 'stress', 'inflammation', 'gut', 'allergy'
  ];
  
  symptoms.forEach(symptom => {
    if (searchableText.includes(symptom)) {
      score += 1;
    }
  });
  
  return score;
}

function findBestTestMatch(gptName: string, tests: Test[]): Test | null {
  const names = tests.map(t => t.name);
  const { bestMatch } = stringSimilarity.findBestMatch(gptName, names);
  if (bestMatch.rating > 0.5) { // justera tröskel vid behov
    return tests.find(t => t.name === bestMatch.target) || null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { gptRecommended } = await request.json();
    const testsDir = path.join(process.cwd(), 'public', 'tests');
    const testFiles = fs.readdirSync(testsDir);

    const tests = testFiles
      .filter(file => file.endsWith('.txt'))
      .map(file => {
        const content = fs.readFileSync(path.join(testsDir, file), 'utf-8');
        return parseTestFile(content);
      });

    // Fuzzy matcha GPT:s rekommendationer mot dina tester
    const matchedTests = gptRecommended.map(name => {
      const match = findBestTestMatch(name, tests);
      return {
        gptName: name,
        ...match
      };
    });

    return NextResponse.json({ recommendedTests: matchedTests });
  } catch (error) {
    console.error('Error recommending tests:', error);
    return NextResponse.json(
      { error: 'Failed to recommend tests' },
      { status: 500 }
    );
  }
} 