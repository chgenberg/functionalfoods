const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APP_ID = process.env.EDAMAM_APP_ID;
const APP_KEY = process.env.EDAMAM_APP_KEY;

if (!APP_ID || !APP_KEY) {
	console.error('Missing EDAMAM_APP_ID or EDAMAM_APP_KEY');
	process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function toNumber(v) { const n = typeof v === 'number' ? v : Number(v); return Number.isFinite(n) ? n : null; }

function buildIngredients(recipe) {
	if (Array.isArray(recipe.ingredientsStructured) && recipe.ingredientsStructured.length > 0) {
		return recipe.ingredientsStructured.map(ing => {
			const parts = [ing.baseAmount || ing.amount, ing.baseUnit || ing.unit, ing.name].filter(Boolean);
			return parts.join(' ');
		}).filter(Boolean);
	}
	if (Array.isArray(recipe.ingredients)) return recipe.ingredients.filter(Boolean);
	return [];
}

function buildNutritionPayload(edamam, servings) {
	const total = {
		calories: toNumber(edamam?.calories) || 0,
		protein: toNumber(edamam?.totalNutrients?.PROCNT?.quantity) || 0,
		carbs: toNumber(edamam?.totalNutrients?.CHOCDF?.quantity) || 0,
		fat: toNumber(edamam?.totalNutrients?.FAT?.quantity) || 0,
	};
	const perServing = servings && servings > 0
		? {
			calories: Math.round(total.calories / servings),
			protein: Number((total.protein / servings).toFixed(1)),
			carbs: Number((total.carbs / servings).toFixed(1)),
			fat: Number((total.fat / servings).toFixed(1)),
		}
		: total;
	return { source: 'edamam', analyzedAt: new Date().toISOString(), servings: servings || null, raw: edamam, total, perServing };
}

async function analyzeOne(recipe) {
	const ingr = buildIngredients(recipe);
	if (ingr.length === 0) return { skipped: true, reason: 'no_ingredients' };
	const servings = recipe.servings || 4;
	const url = `https://api.edamam.com/api/nutrition-details?app_id=${APP_ID}&app_key=${APP_KEY}`;
	const payload = { title: recipe.title || 'Recipe', ingr, yield: servings };
	const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
	if (!res.ok) {
		const text = await res.text();
		return { failed: true, status: res.status, details: text.slice(0, 300) };
	}
	const data = await res.json();
	const nutrition = buildNutritionPayload(data, servings);
	await prisma.recipe.update({ where: { id: recipe.id }, data: { nutrition } });
	return { ok: true };
}

async function main() {
	const limitArg = process.argv.find(a => a.startsWith('--limit='));
	const limit = limitArg ? Number(limitArg.split('=')[1]) : null;
	const delayMs = Number(process.env.EDAMAM_DELAY_MS || 1100);

	const toProcess = await prisma.recipe.findMany({
		where: { OR: [ { nutrition: null }, { NOT: { nutrition: { path: ['perServing'], not: null } } } ] },
		select: { id: true, title: true, slug: true, ingredients: true, ingredientsStructured: true, servings: true }
	});
	const items = limit ? toProcess.slice(0, limit) : toProcess;
	console.log(`Backfilling nutrition for ${items.length} recipes... (delay ${delayMs}ms)`);

	let success = 0, skipped = 0, failed = 0;
	for (let i = 0; i < items.length; i++) {
		const r = items[i];
		try {
			const res = await analyzeOne(r);
			if (res.ok) success++; else if (res.skipped) skipped++; else failed++;
			if ((i+1) % 10 === 0) console.log(`Progress: ${i+1}/${items.length} (ok=${success}, skipped=${skipped}, failed=${failed})`);
		} catch (e) {
			failed++;
			console.log(`Error on ${r.slug}:`, String(e).slice(0,200));
		}
		await sleep(delayMs);
	}

	console.log(`Done. ok=${success}, skipped=${skipped}, failed=${failed}`);
	await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); }); 