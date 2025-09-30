const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertRecipe() {
  const slug = 'asiatisk-kycklingfars-med-gronkal';
  const data = {
    title: 'Asiatisk kycklingfärs med grönkål',
    slug,
    excerpt: 'Snabb kycklingfärsrätt med grönkål, teriyaki och granatäpple.',
    prepTime: '20 minuter',
    servings: 2,
    ingredients: [
      '0.75 st paprika',
      '5 cm purjolök',
      '2 st grönkålsblad',
      '0.5 st morot',
      '0.5 klyfta vitlök',
      '1 tsk färsk ingefära',
      '1 tsk olivolja',
      '300 g kycklingfärs',
      'salt och svartpeppar',
      '2 msk teriyakisås',
      '1 msk färsk koriander',
      '1 msk granatäppelkärnor (topping)'
    ],
    instructions: `1. Hacka paprika i små tärningar.\n2. Skär purjolök och grönkål i strimlor.\n3. Skala och hacka morot i små tärningar.\n4. Skala och riv vitlök och ingefära.\n5. Hacka koriander.\n6. Hetta upp en stekpanna med olivolja och bryn färsen.\n7. Tillsätt paprika, morot, purjolök, vitlök och ingefära och stek i några minuter.\n8. Krydda med salt, peppar och teriyakisås.\n9. Lägg i koriander och grönkål och stek 1 minut till.\n10. Servera i skålar och toppa med granatäppelkärnor.`,
    nutrition: {
      perServing: { energy: 259, carbohydrates: 12, fat: 37, protein: 37, fiber: 4 }
    },
    categories: ['Middag'],
    tags: ['grönkålsblad','färsk ingefära','granatäppelkärnor'],
    isPremium: false,
    isFree: true,
  };
  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (existing) {
    await prisma.recipe.update({ where: { slug }, data });
    return existing.id;
  } else {
    const created = await prisma.recipe.create({ data });
    return created.id;
  }
}

async function setWeek() {
  try {
    const slug = 'asiatisk-kycklingfars-med-gronkal';
    await upsertRecipe();
    // Update Basic week 6 Sunday dinner
    const row = await prisma.mealPlanWeek.findUnique({ where: { course_weekNumber: { course: 'basic', weekNumber: 6 } } });
    const days = row?.days || {};
    days['Söndag'] = days['Söndag'] || {};
    days['Söndag'].dinner = {
      name: 'Asiatisk kycklingfärs med grönkål',
      recipeLink: `/kunskapsbank/recept/${slug}`
    };
    await prisma.mealPlanWeek.upsert({
      where: { course_weekNumber: { course: 'basic', weekNumber: 6 } },
      update: { days },
      create: { course: 'basic', weekNumber: 6, title: 'Vecka 6', days }
    });
    console.log('✅ Vecka 6 söndag middag uppdaterad.');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

setWeek();
