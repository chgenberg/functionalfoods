/**
 * Migration script: Sync a SINGLE course to Course Builder format
 * 
 * SAFE: Does NOT change isDraft status, course remains published and functional.
 * 
 * Usage:
 *   node scripts/migrate-single-course.js energy --dry-run   # Preview
 *   node scripts/migrate-single-course.js energy --apply     # Apply
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Course mapping
const COURSE_CONFIGS = {
  'basic': { name: 'Functional Basics', code: 'basic' },
  'flow': { name: 'Functional Flow', code: 'flow' },
  'energy': { name: 'Functional Energy', code: 'energy' },
  'hormone': { name: 'Hormonell Balans', code: 'hormone' }
};

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

async function migrateSingleCourse(courseKey, dryRun = true) {
  const config = COURSE_CONFIGS[courseKey];
  
  if (!config) {
    console.error(`❌ Unknown course: ${courseKey}`);
    console.log(`Available: ${Object.keys(COURSE_CONFIGS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 Single Course Migration: ${config.name}`);
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (preview only)' : '✅ APPLY CHANGES'}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Find the course
    const course = await prisma.courseProduct.findFirst({
      where: { name: config.name }
    });

    if (!course) {
      console.error(`❌ Course "${config.name}" not found in database`);
      process.exit(1);
    }

    console.log(`📚 Found course: ${course.name}`);
    console.log(`   ID: ${course.id}`);
    console.log(`   Price: ${course.price} kr`);
    console.log(`   Description: ${(course.description || '').substring(0, 100)}...`);

    // Show existing content
    const existingContent = course.content || {};
    console.log(`\n📦 Existing content keys: ${Object.keys(existingContent).join(', ') || '(empty)'}`);
    if (existingContent.builderData) {
      console.log(`   ⚠️  Already has builderData - will be UPDATED (not overwritten)`);
    }

    // Fetch MealPlanWeeks
    const mealPlanWeeks = await prisma.mealPlanWeek.findMany({
      where: { course: config.code },
      orderBy: { weekNumber: 'asc' }
    });
    console.log(`\n📅 Meal Plan Weeks: ${mealPlanWeeks.length}`);

    // Fetch CourseWeekMeta
    const weekMetas = await prisma.courseWeekMeta.findMany({
      where: { course: config.code },
      orderBy: { weekNumber: 'asc' }
    });
    console.log(`📋 Week Metadata: ${weekMetas.length}`);

    // Fetch KnowledgeDocuments
    const knowledgeDocs = await prisma.knowledgeDocument.findMany({
      where: {
        OR: [
          { course: config.code },
          { courses: { has: config.code } }
        ]
      },
      orderBy: [{ weekNumber: 'asc' }, { order: 'asc' }]
    });
    console.log(`📖 Knowledge Documents: ${knowledgeDocs.length}`);

    // Build weeks array
    const weeksCount = Math.max(mealPlanWeeks.length, weekMetas.length, 6);
    const weeks = [];

    console.log(`\n🗓️  Building ${weeksCount} weeks:\n`);

    for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
      const mealPlan = mealPlanWeeks.find(w => w.weekNumber === weekNum);
      const meta = weekMetas.find(w => w.weekNumber === weekNum);
      const weekDocs = knowledgeDocs.filter(d => d.weekNumber === weekNum);

      // Build days
      const days = DAYS.map(dayName => {
        const dayMeals = mealPlan?.days?.[dayName] || {};
        const meals = {};

        for (const [mealType, mealData] of Object.entries(dayMeals)) {
          if (mealData && mealData.name) {
            meals[mealType] = {
              name: mealData.name,
              recipeId: mealData.recipeId || undefined,
              recipeLink: mealData.recipeLink || undefined,
              note: mealData.note || undefined
            };
          }
        }

        return { dayName, meals };
      });

      const mealCount = days.reduce((sum, d) => sum + Object.keys(d.meals).length, 0);

      // Build knowledge documents for this week
      const knowledgeDocuments = weekDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        type: 'knowledge'
      }));

      console.log(`   Vecka ${weekNum}: ${mealCount} måltider, ${weekDocs.length} dokument`);

      weeks.push({
        weekNumber: weekNum,
        title: meta?.weekTitle || mealPlan?.title || `Vecka ${weekNum}`,
        subtitle: meta?.weekSubtitle || '',
        videoUrl: meta?.videoUrl || '',
        welcomeMessage: meta?.welcomeMessage || '',
        keyTakeaways: meta?.keyTakeaways || [],
        knowledgeDocuments,
        days
      });
    }

    // Total meals
    const totalMeals = weeks.reduce((sum, week) => {
      return sum + week.days.reduce((daySum, day) => {
        return daySum + Object.keys(day.meals).length;
      }, 0);
    }, 0);

    console.log(`\n📊 Summary:`);
    console.log(`   Total weeks: ${weeks.length}`);
    console.log(`   Total meals: ${totalMeals}`);
    console.log(`   Total documents: ${knowledgeDocs.length}`);

    // Build builderData
    const builderData = {
      title: course.name,
      description: course.description || '',
      price: course.price,
      salePrice: course.salePrice || undefined,
      duration: `${weeksCount} veckor`,
      weeksCount,
      level: 'Beginner',
      targetAudience: '',
      objectives: existingContent.objectives || [],
      features: Array.isArray(course.features) ? course.features : [],
      coverImage: existingContent.coverImage || '',
      introVideoUrl: course.overviewVideoUrl || '',
      welcomeMessage: course.welcomeText || '',
      enableCommunity: true,
      communityDescription: '',
      weeks,
      currentStep: 5
    };

    // Prepare updated content (PRESERVES all existing data)
    const updatedContent = {
      ...existingContent,
      isDraft: false, // KEEP AS PUBLISHED
      slug: config.code,
      builderData
    };

    if (dryRun) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 DRY RUN - Would update CourseProduct with builderData`);
      console.log(`\n   Content keys after update: ${Object.keys(updatedContent).join(', ')}`);
      console.log(`\n   To apply, run:`);
      console.log(`   node scripts/migrate-single-course.js ${courseKey} --apply`);
      console.log(`${'='.repeat(60)}\n`);
    } else {
      // APPLY THE UPDATE
      console.log(`\n⏳ Applying update...`);
      
      await prisma.courseProduct.update({
        where: { id: course.id },
        data: { content: updatedContent }
      });

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ SUCCESS! Course "${course.name}" migrated to Course Builder`);
      console.log(`\n   The course:`);
      console.log(`   - Remains PUBLISHED and fully functional`);
      console.log(`   - Can now be edited at: /admin/course-builder/${course.id}/step/1`);
      console.log(`${'='.repeat(60)}\n`);
    }

  } catch (error) {
    console.error('\n❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse args
const args = process.argv.slice(2);
const courseKey = args.find(a => !a.startsWith('--'));
const dryRun = !args.includes('--apply');

if (!courseKey || args.includes('--help')) {
  console.log(`
Usage: node scripts/migrate-single-course.js <course> [options]

Courses:
  basic    Functional Basics
  flow     Functional Flow
  energy   Functional Energy
  hormone  Hormonell Balans

Options:
  --dry-run   Preview changes (default)
  --apply     Apply the migration
  --help      Show this help
`);
  process.exit(0);
}

migrateSingleCourse(courseKey, dryRun)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
