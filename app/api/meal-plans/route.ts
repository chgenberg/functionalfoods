import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans as basicMealPlans, flowMealPlans, energyMealPlans } from '@/app/data/mealPlans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseRaw = (searchParams.get('course') || 'basic').toLowerCase();
    const weekNumber = parseInt(searchParams.get('week') || '1', 10);

    // Normalize course name to database slug format
    const course = (courseRaw.includes('flow') || courseRaw === 'flow')
      ? 'flow'
      : (courseRaw.includes('energy') || courseRaw.includes('insulin') || courseRaw === 'energy')
      ? 'energy'
      : (courseRaw === 'hormone' || courseRaw === 'hormonell-balans')
      ? 'hormone'
      : (courseRaw === 'prova-pa-vecka')
      ? 'prova-pa-vecka'
      : 'basic';

    // ALWAYS check database first - this ensures Course Builder edits take precedence
    const dbRow = await (prisma as any).mealPlanWeek?.findUnique({
      where: { course_weekNumber: { course, weekNumber } }
    });

    // For hormone and prova-pa-vecka: DB only (no static fallback)
    if (course === 'hormone' || course === 'prova-pa-vecka') {
      if (dbRow && dbRow.days && Object.keys(dbRow.days).length > 0) {
        return NextResponse.json({ 
          title: dbRow.title || `Vecka ${weekNumber}`, 
          days: dbRow.days,
          source: 'database'
        }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ title: `Vecka ${weekNumber}`, days: {}, source: 'empty' }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // For basic/flow/energy: Check if DB has data with actual meals
    // If DB has been updated via Course Builder (has non-empty days), use it
    if (dbRow && dbRow.days && Object.keys(dbRow.days).length > 0) {
      // Check if any day has actual meals (not just empty objects)
      const hasActualMeals = Object.values(dbRow.days).some((day: any) => 
        day && typeof day === 'object' && Object.keys(day).length > 0
      );
      
      if (hasActualMeals) {
        console.log(`📊 Using database meal plan for ${course} week ${weekNumber}`);
        return NextResponse.json({ 
          title: dbRow.title || `Vecka ${weekNumber}`, 
          days: dbRow.days,
          source: 'database'
        }, { headers: { 'Cache-Control': 'no-store' } });
      }
    }

    // Fall back to static data for basic/flow/energy
    const map = course === 'basic' ? basicMealPlans : course === 'flow' ? flowMealPlans : energyMealPlans;
    const weekKey = `week${weekNumber}` as keyof typeof map;
    const staticWeek = (map as any)[weekKey];

    if (staticWeek) {
      return NextResponse.json({
        title: dbRow?.title || staticWeek.title || `Vecka ${weekNumber}`,
        days: staticWeek.days,
        source: 'static'
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Final fallback to DB row if static doesn't exist
    if (dbRow) {
      return NextResponse.json({ 
        title: dbRow.title || `Vecka ${weekNumber}`, 
        days: dbRow.days || {},
        source: 'database-fallback'
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ title: `Vecka ${weekNumber}`, days: {}, source: 'empty' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Meal Plans API error:', e);
    return NextResponse.json({ title: '', days: {}, source: 'error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    await prisma.$disconnect();
  }
} 