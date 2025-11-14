#!/usr/bin/env node
/**
 * Convert free recipes (via public API) to structured ingredient/instruction format.
 * Usage:
 *   node scripts/bulk-structure-recipes.js [limit=10]
 */

const BASE_URL = process.env.FF_BASE_URL || 'https://www.functionalfoods.se';
const LIMIT = Number(process.argv[2]) || 10;
const FETCH = globalThis.fetch;

function titleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildIngredientGroups(ingredients = []) {
  const groups = [];
  let current = { title: 'Ingredienser', items: [] };
  const headingRegex = /^[\p{L}\p{M}\s\-]+:$/u;

  ingredients.forEach((raw) => {
    if (!raw) return;
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (headingRegex.test(trimmed)) {
      if (current.items.length) groups.push(current);
      current = {
        title: titleCase(trimmed.replace(/:$/, '').trim()),
        items: [],
      };
      return;
    }

    current.items.push(trimmed);
  });

  if (current.items.length) groups.push(current);

  if (!groups.length && ingredients.length) {
    return [
      {
        title: 'Ingredienser',
        items: ingredients.filter(Boolean).map((ing) => ing.trim()),
      },
    ];
  }
  return groups;
}

function buildInstructionSteps(instructions) {
  if (!instructions) return [];
  const chunks = Array.isArray(instructions)
    ? instructions
    : String(instructions).split(/\r?\n+/);

  return chunks
    .map((step) =>
      step
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim()
    )
    .filter(Boolean);
}

async function fetchJson(url) {
  const res = await FETCH(url);
  if (!res.ok) {
    throw new Error(`Request failed ${res.status} ${url}`);
  }
  return res.json();
}

async function getCandidateSlugs(limit) {
  const slugs = [];
  let page = 1;
  const target = limit * 15;
  while (slugs.length < target && page <= 100) {
    const data = await fetchJson(
      `${BASE_URL}/api/recipes?free=true&limit=20&page=${page}`
    );
    console.log(
      `Fetched page ${page}: ${data.recipes?.length || 0} recipes (total collected ${slugs.length})`
    );
    const pageSlugs =
      data.recipes?.map((recipe) => recipe.slug).filter(Boolean) ?? [];
    pageSlugs.forEach((slug) => {
      if (!slugs.includes(slug) && slugs.length < target) {
        slugs.push(slug);
      }
    });
    if (!data.pagination?.hasMore) break;
    page += 1;
  }
  return slugs;
}

async function main() {
  const slugs = await getCandidateSlugs(LIMIT * 2);
  if (!slugs.length) {
    console.log('No free recipes found.');
    return;
  }

  const processed = [];

  for (const slug of slugs) {
    if (processed.length >= LIMIT) break;

    const detail = await fetchJson(`${BASE_URL}/api/recipes/${slug}`);

    const alreadyGrouped =
      detail.ingredientsStructured?.groups &&
      detail.ingredientsStructured.groups.length > 0;
    const alreadyStepped =
      detail.instructionsStructured?.steps &&
      detail.instructionsStructured.steps.length > 0;

    if (alreadyGrouped && alreadyStepped) {
      console.log(`Skipping ${slug} (already structured)`);
      continue;
    }

    const ingredientGroups = buildIngredientGroups(detail.ingredients || []);
    const instructionSteps = buildInstructionSteps(detail.instructions);

    if (!ingredientGroups.length && !instructionSteps.length) {
      console.log(`Skipping ${slug} – no data to structure.`);
      continue;
    }

    const payload = {
      title: detail.title,
      excerpt: detail.excerpt,
      content: detail.content,
      imageUrl: detail.imageUrl,
      imageAlt: detail.imageAlt,
      categories: detail.categories,
      ingredients: detail.ingredients,
      instructions: Array.isArray(detail.instructions)
        ? detail.instructions.join('\n')
        : detail.instructions,
      difficulty: detail.difficulty,
      prepTime: detail.prepTime,
      cookTime: detail.cookTime,
      totalTime: detail.totalTime,
      servings: detail.servings,
      nutrition: detail.nutrition,
      tips: detail.tips,
      tags: detail.tags,
      status: detail.status,
      isPremium: detail.isPremium,
      isFree: detail.isFree,
      imageMobileUrl: detail.imageMobileUrl,
      ingredientsStructured: ingredientGroups.length
        ? { groups: ingredientGroups }
        : null,
      instructionsStructured: instructionSteps.length
        ? { steps: instructionSteps }
        : null,
    };

    const res = await FETCH(`${BASE_URL}/api/recipes/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Failed to update ${slug}:`, res.status, errText);
      continue;
    }

    processed.push({
      slug,
      groups: ingredientGroups.length,
      steps: instructionSteps.length,
    });

    console.log(
      `✅ ${slug}: ${ingredientGroups.length} groups, ${instructionSteps.length} steps`
    );
  }

  console.log(
    `Finished. Structured ${processed.length} recipe(s):`,
    processed.map((p) => p.slug).join(', ')
  );
}

main().catch((err) => {
  console.error('Bulk structuring failed:', err);
  process.exitCode = 1;
});



