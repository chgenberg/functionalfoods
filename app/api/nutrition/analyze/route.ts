import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toNumber(value: any): number | null {
	const n = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(n) ? n : null;
}

function buildNutritionPayload(edamam: any, servings: number) {
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

	return {
		source: 'edamam',
		analyzedAt: new Date().toISOString(),
		servings: servings || null,
		raw: edamam,
		total,
		perServing,
	};
}

export async function POST(req: NextRequest) {
	const appId = process.env.EDAMAM_APP_ID;
	const appKey = process.env.EDAMAM_APP_KEY;
	if (!appId || !appKey) {
		return NextResponse.json({ error: 'Edamam keys not configured' }, { status: 500 });
	}

	try {
		const body = await req.json().catch(() => ({}));
		const slug = body.slug as string | undefined;
		let ingredients: string[] | undefined = body.ingredients;
		let servings: number | undefined = body.servings;

		let recipe: any = null;
		if (slug) {
			recipe = await prisma.recipe.findUnique({ where: { slug } });
			if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
			if (!ingredients) {
				if (Array.isArray(recipe.ingredientsStructured) && recipe.ingredientsStructured.length > 0) {
					ingredients = recipe.ingredientsStructured.map((ing: any) => {
						const parts = [ing.baseAmount || ing.amount, ing.baseUnit || ing.unit, ing.name].filter(Boolean);
						return parts.join(' ');
					}).filter(Boolean);
				} else if (Array.isArray(recipe.ingredients)) {
					ingredients = recipe.ingredients.filter(Boolean);
				}
			}
			if (!servings) servings = recipe.servings || 4;
		}

		if (!ingredients || ingredients.length === 0) {
			return NextResponse.json({ error: 'No ingredients to analyze' }, { status: 400 });
		}

		const url = `https://api.edamam.com/api/nutrition-details?app_id=${appId}&app_key=${appKey}`;
		const payload: any = { title: recipe?.title || 'Recipe', ingr: ingredients };
		if (servings) payload.yield = servings;

		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			const text = await res.text();
			return NextResponse.json({ error: 'Edamam request failed', details: text }, { status: 502 });
		}

		const data = await res.json();
		const nutrition = buildNutritionPayload(data, servings || 0);

		if (recipe) {
			await prisma.recipe.update({ where: { id: recipe.id }, data: { nutrition } });
		}

		return NextResponse.json({ nutrition });
	} catch (err) {
		console.error('Nutrition analyze error:', err);
		return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
} 