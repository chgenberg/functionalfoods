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

async function translateText(client: OpenAI, text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  const prompt = `Translate the following Swedish text to ${targetLang}. Keep it concise and natural. Only return the translation.\n\nTEXT:\n${text}`;
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

  for (const raw of raws) {
    const updates: Record<string, any> = {};
    for (const t of TARGETS) {
      if (!(raw as any)[t.nameFld]) {
        updates[t.nameFld] = await translateText(client, raw.name, t.code);
      }
      if (raw.description && !(raw as any)[t.descFld]) {
        updates[t.descFld] = await translateText(client, raw.description, t.code);
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.rawMaterial.update({ where: { id: raw.id }, data: updates });
      console.log(`Updated raw material ${raw.name} with`, Object.keys(updates));
    }
  }

  // 2) Example: BlogPost (title, excerpt)
  const posts = await prisma.blogPost.findMany();
  console.log(`Found ${posts.length} blog posts`);
  for (const post of posts) {
    const updates: Record<string, any> = {};
    for (const t of TARGETS) {
      const titleKey = `title_${t.code}`;
      const excerptKey = `excerpt_${t.code}`;
      const contentKey = `content_${t.code}`;
      if (!(post as any)[titleKey]) updates[titleKey] = await translateText(client, post.title, t.code);
      if (post.excerpt && !(post as any)[excerptKey]) updates[excerptKey] = await translateText(client, post.excerpt, t.code);
      if (post.content && !(post as any)[contentKey]) updates[contentKey] = await translateText(client, post.content, t.code);
    }
    if (Object.keys(updates).length > 0) {
      await prisma.blogPost.update({ where: { id: post.id }, data: updates });
      console.log(`Updated post ${post.slug}`);
    }
  }

  // 3) Recipes
  const recipes = await prisma.recipe.findMany();
  console.log(`Found ${recipes.length} recipes`);
  for (const r of recipes) {
    const updates: Record<string, any> = {};
    for (const t of TARGETS) {
      const tTitle = `title_${t.code}`;
      const tExcerpt = `excerpt_${t.code}`;
      const tInstr = `instructions_${t.code}`;
      if (!(r as any)[tTitle]) updates[tTitle] = await translateText(client, r.title, t.code);
      if (r.excerpt && !(r as any)[tExcerpt]) updates[tExcerpt] = await translateText(client, r.excerpt, t.code);
      if (r.instructions && !(r as any)[tInstr]) updates[tInstr] = await translateText(client, r.instructions, t.code);
    }
    if (Object.keys(updates).length > 0) {
      await prisma.recipe.update({ where: { id: r.id }, data: updates });
      console.log(`Updated recipe ${r.slug}`);
    }
  }

  console.log('Done.');
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); }); 