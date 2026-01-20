/**
 * Migration script: Sync existing courses to Course Builder format
 * 
 * This script reads existing course data from:
 * - CourseProduct
 * - MealPlanWeek
 * - CourseWeekMeta
 * - KnowledgeDocument
 * 
 * And creates builderData in CourseProduct.content so courses can be edited
 * via the Course Builder UI.
 * 
 * SAFE: Does NOT change isDraft status, courses remain published and functional.
 * 
 * Usage:
 *   node scripts/migrate-courses-to-builder.js --dry-run   # Preview changes
 *   node scripts/migrate-courses-to-builder.js --apply     # Apply changes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Course mapping: CourseProduct name -> course code used in MealPlanWeek/CourseWeekMeta
const COURSE_MAPPINGS = {
  'Functional Basics': 'basic',
  'Functional Flow': 'flow',
  'Functional Gut Health/Flow': 'flow',
  'Functional Energy': 'energy',
  'Functional Insulin balance/Energy': 'energy',
  'Hormonell Balans': 'hormone'
};

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

async function migrateCourses(dryRun = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 Course Builder Migration Script`);
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (preview only)' : '✅ APPLY CHANGES'}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Get all course products
    const courses = await prisma.courseProduct.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${courses.length} courses to process:\n`);

    for (const course of courses) {
      const courseCode = COURSE_MAPPINGS[course.name];
      
      if (!courseCode) {
        console.log(`⚠️  Skipping "${course.name}" - no course code mapping found\n`);
        continue;
      }

      console.log(`\n📚 Processing: ${course.name} (code: ${courseCode})`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Price: ${course.price} kr`);

      // Check if already has builderData
      const existingContent = course.content || {};
      if (existingContent.builderData) {
        console.log(`   ℹ️  Already has builderData - will update/merge`);
      }

      // Fetch MealPlanWeeks
      const mealPlanWeeks = await prisma.mealPlanWeek.findMany({
        where: { course: courseCode },
        orderBy: { weekNumber: 'asc' }
      });
      console.log(`   📅 Found ${mealPlanWeeks.length} meal plan weeks`);

      // Fetch CourseWeekMeta
      const weekMetas = await prisma.courseWeekMeta.findMany({
        where: { course: courseCode },
        orderBy: { weekNumber: 'asc' }
      });
      console.log(`   📋 Found ${weekMetas.length} week metadata entries`);

      // Fetch KnowledgeDocuments for this course
      const knowledgeDocs = await prisma.knowledgeDocument.findMany({
        where: {
          OR: [
            { course: courseCode },
            { courses: { has: courseCode } }
          ]
        },
        orderBy: [
          { weekNumber: 'asc' },
          { order: 'asc' }
        ]
      });
      console.log(`   📖 Found ${knowledgeDocs.length} knowledge documents`);

      // Build weeks array
      const weeksCount = Math.max(mealPlanWeeks.length, weekMetas.length, 6);
      const weeks = [];

      for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
        const mealPlan = mealPlanWeeks.find(w => w.weekNumber === weekNum);
        const meta = weekMetas.find(w => w.weekNumber === weekNum);
        const weekDocs = knowledgeDocs.filter(d => d.weekNumber === weekNum);

        // Build days from meal plan
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

          return {
            dayName,
            meals
          };
        });

        // Build knowledge documents for this week
        const knowledgeDocuments = weekDocs.map(doc => ({
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          type: 'knowledge'
        }));

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

      // Count total meals
      const totalMeals = weeks.reduce((sum, week) => {
        return sum + week.days.reduce((daySum, day) => {
          return daySum + Object.keys(day.meals).length;
        }, 0);
      }, 0);
      console.log(`   🍽️  Total meals: ${totalMeals}`);

      // Build the builderData
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
        currentStep: 5 // Already complete
      };

      // Prepare updated content
      const updatedContent = {
        ...existingContent,
        isDraft: false, // Keep as published!
        slug: courseCode,
        builderData
      };

      if (dryRun) {
        console.log(`\n   📝 Would save builderData with:`);
        console.log(`      - ${weeks.length} weeks`);
        console.log(`      - ${totalMeals} meals`);
        console.log(`      - ${knowledgeDocs.length} knowledge documents`);
      } else {
        // Apply the update
        await prisma.courseProduct.update({
          where: { id: course.id },
          data: {
            content: updatedContent
          }
        });
        console.log(`   ✅ Updated successfully!`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    if (dryRun) {
      console.log(`🔍 DRY RUN COMPLETE - No changes were made`);
      console.log(`\nTo apply changes, run:`);
      console.log(`   node scripts/migrate-courses-to-builder.js --apply`);
    } else {
      console.log(`✅ MIGRATION COMPLETE - All courses updated`);
      console.log(`\nCourses can now be edited via:`);
      console.log(`   /admin/course-builder`);
    }
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('\n❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/migrate-courses-to-builder.js [options]

Options:
  --dry-run   Preview changes without applying (default)
  --apply     Apply the migration
  --help, -h  Show this help message

This script syncs existing course data to the Course Builder format,
allowing courses to be edited via the admin Course Builder UI.
`);
  process.exit(0);
}

migrateCourses(dryRun)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
