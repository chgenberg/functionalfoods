import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

// IMPORTANT: Set OPENAI_API_KEY in environment. Do NOT hardcode secrets in code.
// Usage: OPENAI_API_KEY=sk-... ts-node scripts/translate_all.ts

const prisma = new PrismaClient();

const TARGETS = [
  { code: 'en', nameFld: 'name_en', descFld: 'description_en' },
  { code: 'es', nameFld: 'name_es', descFld: 'description_es' },
  { code: 'de', nameFld: 'name_de', descFld: 'description_de' },
  { code: 'fr', nameFld: 'name_fr', descFld: 'description_fr' },
] as const;

type Target = typeof TARGETS[number];

function chunkText(text: string, size = 6000): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function translateText(client: OpenAI, text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  const prompt = `Translate the following Swedish text to ${targetLang}. Keep formatting and paragraphs. Only return the translation.\n\nTEXT:\n${text}`;
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a professional translator.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });
  return res.choices?.[0]?.message?.content?.trim() || text;
}

async function translateLongText(client: OpenAI, text: string, targetLang: string): Promise<string> {
  const parts = chunkText(text);
  if (parts.length <= 1) return translateText(client, text, targetLang);
  const out: string[] = [];
  for (let idx = 0; idx < parts.length; idx++) {
    const part = parts[idx];
    const translated = await translateText(client, part, targetLang);
    out.push(translated);
  }
  return out.join('');
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set');
    process.exit(1);
  }
  const client = new OpenAI({ apiKey });

  // 1) Translate RawMaterial
  const raws = await prisma.rawMaterial.findMany();
  console.log(`Found ${raws.length} raw materials`);

  for (let i = 0; i < raws.length; i++) {
    const raw = raws[i] as any;
    console.log(`[RawMaterial ${i + 1}/${raws.length}] ${raw.name}`);
    const updates: Record<string, any> = {};
    for (const t of TARGETS) {
      if (!raw[t.nameFld]) {
        try { updates[t.nameFld] = await translateText(client, raw.name, t.code); } catch (e) { console.warn('Name translate failed', e); }
      }
      if (raw.description && !raw[t.descFld]) {
        try { updates[t.descFld] = await translateLongText(client, raw.description, t.code); } catch (e) { console.warn('Desc translate failed', e); }
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.rawMaterial.update({ where: { id: raw.id }, data: updates });
      console.log(`  Updated: ${Object.keys(updates).join(', ')}`);
    }
  }

  // 2) BlogPost (title, excerpt, content)
  const posts = await prisma.blogPost.findMany();
  console.log(`Found ${posts.length} blog posts`);
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i] as any;
    console.log(`[BlogPost ${i + 1}/${posts.length}] ${post.slug}`);
    const updates: Record<string, any> = {};
    for (const t of TARGETS) {
      const titleKey = `title_${t.code}`;
      const excerptKey = `excerpt_${t.code}`;
      const contentKey = `content_${t.code}`;
      try {
        if (!post[titleKey]) updates[titleKey] = await translateText(client, post.title, t.code);
        if (post.excerpt && !post[excerptKey]) updates[excerptKey] = await translateText(client, post.excerpt, t.code);
        if (post.content && !post[contentKey]) updates[contentKey] = await translateLongText(client, post.content, t.code);
      } catch (e) {
        console.warn('  Blog translation chunk failed', e);
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.blogPost.update({ where: { id: post.id }, data: updates });
      console.log(`  Updated: ${Object.keys(updates).join(', ')}`);
    }
  }

  // 3) Recipes (title, excerpt, instructions)
  const recipes = await prisma.recipe.findMany();
  console.log(`Found ${recipes.length} recipes`);
  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i] as any;
    console.log(`[Recipe ${i + 1}/${recipes.length}] ${r.slug}`);
    const updates: Record<string, any> = {};
    for (const t of TARGETS) {
      const tTitle = `title_${t.code}`;
      const tExcerpt = `excerpt_${t.code}`;
      const tInstr = `instructions_${t.code}`;
      try {
        if (!r[tTitle]) updates[tTitle] = await translateText(client, r.title, t.code);
        if (r.excerpt && !r[tExcerpt]) updates[tExcerpt] = await translateText(client, r.excerpt, t.code);
        if (r.instructions && !r[tInstr]) updates[tInstr] = await translateLongText(client, r.instructions, t.code);
      } catch (e) {
        console.warn('  Recipe translation chunk failed', e);
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.recipe.update({ where: { id: r.id }, data: updates });
      console.log(`  Updated: ${Object.keys(updates).join(', ')}`);
    }
  }

  console.log('Done.');
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); }); 