#!/usr/bin/env node

/**
 * Script: matchBasicMissingImagesFlexible.js
 * Purpose: Target ONLY Functional Basics recipes that currently lack images.
 *          Use GPT Vision with a candidate title list to select the best match per image.
 *          Then rename file to recipe slug (add -mobile for portrait) and update DB image fields.
 */

require('dotenv').config();
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();

// Hardcoded API key for this run (replace/remove after)
const apiKey = 'REMOVED_FOR_SECURITY';
const openai = new OpenAI({ apiKey });

const IMAGES_DIR = path.resolve('public', 'Bilder_basic');

function slugify(title) {
	return title
		.toLowerCase()
		.replace(/[åä]/g, 'a')
		.replace(/ö/g, 'o')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function levenshtein(a, b) {
	const an = a ? a.length : 0;
	const bn = b ? b.length : 0;
	if (an === 0) return bn; if (bn === 0) return an;
	const matrix = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
	for (let i = 0; i <= an; i++) matrix[i][0] = i;
	for (let j = 0; j <= bn; j++) matrix[0][j] = j;
	for (let i = 1; i <= an; i++) {
		for (let j = 1; j <= bn; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost
			);
		}
	}
	return matrix[an][bn];
}

async function getImageSize(filePath) {
	try {
		const sharp = require('sharp');
		const meta = await sharp(filePath).metadata();
		return { width: meta.width || 0, height: meta.height || 0 };
	} catch {
		return { width: 0, height: 0 };
	}
}

async function chooseTitleForImage(filePath, candidateTitles) {
	const b64 = await fsp.readFile(filePath, { encoding: 'base64' });
	const ext = path.extname(filePath).toLowerCase();
	const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
	const list = candidateTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');
	const prompt = `Du får en bild på en maträtt och en lista med möjliga recepttitlar (svenska).\n\nVälj EXAKT en titel från listan som bäst motsvarar rätten i bilden.\n\nRegler:\n- Svara ENBART med exakt titeltext som den står i listan.\n- Om inget passar: skriv INGEN.\n\nLista:\n${list}`;
	const resp = await openai.responses.create({
		model: 'gpt-4o-mini',
		input: [
			{
				role: 'user',
				content: [
					{ type: 'input_text', text: prompt },
					{ type: 'input_image', image_url: `data:${mime};base64,${b64}` }
				]
			}
		]
	});
	return (resp.output_text || '').trim();
}

function fallbackMatchByFilename(file, candidateTitles) {
	const base = path.basename(file, path.extname(file));
	const normalized = base.toLowerCase().replace(/[-_]+/g, ' ');
	let best = null; let bestScore = Infinity;
	for (const title of candidateTitles) {
		const t = title.toLowerCase();
		// prefer inclusion
		if (t.includes(normalized) || normalized.includes(t)) return title;
		const score = levenshtein(normalized, t);
		if (score < bestScore) { bestScore = score; best = title; }
	}
	return bestScore <= 8 ? best : null; // tolerate small distance
}

async function main() {
	// 1) Extract Basic slugs from app/data/mealPlans.ts (only the Basics block)
	const mealPlansPath = path.resolve('app', 'data', 'mealPlans.ts');
	const text = await fsp.readFile(mealPlansPath, 'utf8');
	const start = text.indexOf('export const mealPlans');
	const end = text.indexOf('export const flowMealPlans');
	const basicBlock = start >= 0 && end > start ? text.slice(start, end) : text;
	const re = /\/kunskapsbank\/recept\/([a-z0-9\-]+)/g;
	let m; const basicSlugs = new Set();
	while ((m = re.exec(basicBlock))) basicSlugs.add(m[1]);

	const basicSlugList = [...basicSlugs];
	if (basicSlugList.length === 0) {
		console.log('No Basic slugs found in mealPlans.');
		await prisma.$disconnect();
		return;
	}
	console.log(`Basic unique slugs: ${basicSlugList.length}`);

	// 2) Fetch recipes for these slugs that have no images
	const missingRecipes = await prisma.recipe.findMany({
		where: {
			slug: { in: basicSlugList },
			AND: [{ imageUrl: null }, { imageMobileUrl: null }]
		},
		select: { id: true, title: true, slug: true }
	});

	if (missingRecipes.length === 0) {
		console.log('All Basic recipes already have images.');
		await prisma.$disconnect();
		return;
	}
	console.log(`Missing images for ${missingRecipes.length} Basic recipes.`);

	// 3) Gather all image files to consider (process ALL files now)
	const files = await fsp.readdir(IMAGES_DIR);
	const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));

	// 4) Build candidate title list from DB (titles of missing recipes)
	let candidateTitles = missingRecipes.map(r => r.title);

	// 5) Iterate over images; let Vision pick best title; fallback to filename fuzzy
	for (const file of imageFiles) {
		try {
			if (candidateTitles.length === 0) break; // all filled
			const fullPath = path.join(IMAGES_DIR, file);

			let choice = await chooseTitleForImage(fullPath, candidateTitles);
			if (!choice || choice.toUpperCase().includes('INGEN')) {
				const fb = fallbackMatchByFilename(file, candidateTitles);
				choice = fb || choice;
			}
			if (!choice || choice.toUpperCase().includes('INGEN')) {
				console.log(`No confident match for ${file}`);
				continue;
			}

			const recipe = missingRecipes.find(r => r.title === choice);
			if (!recipe) {
				console.log(`Chosen title not in missing list for ${file}: ${choice}`);
				continue;
			}

			const { width, height } = await getImageSize(fullPath);
			const ext = path.extname(file).toLowerCase();
			const base = slugify(recipe.title);
			const newName = (height >= width) ? `${base}-mobile${ext}` : `${base}${ext}`;
			const newPath = path.join(IMAGES_DIR, newName);

			if (newPath !== fullPath && !fs.existsSync(newPath)) {
				await fsp.rename(fullPath, newPath).catch(() => {});
				console.log(`Renamed ${file} -> ${newName}`);
			}

			const imageUrl = `/Bilder_basic/${base}${ext}`;
			const imageMobileUrl = `/Bilder_basic/${base}-mobile${ext}`;
			const exists = async p => !!(await fsp.stat(path.join('public', p)).catch(() => null));

			const data = { imageAlt: recipe.title };
			if (await exists(imageUrl)) data.imageUrl = imageUrl;
			if (await exists(imageMobileUrl)) data.imageMobileUrl = imageMobileUrl;

			if (data.imageUrl || data.imageMobileUrl) {
				await prisma.recipe.update({ where: { id: recipe.id }, data });
				console.log('Updated', recipe.title, data);
				candidateTitles = candidateTitles.filter(t => t !== recipe.title);
			} else {
				console.log(`Files not found after rename for ${recipe.title}`);
			}
		} catch (e) {
			console.log('Error processing file', file, e.message);
		}
	}

	await prisma.$disconnect();
	console.log('Done flexible matching for Basic missing images.');
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); }); 