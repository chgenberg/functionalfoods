import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Setup AI account with access to all courses
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const targetEmail = 'ai@ulrikafunctionalfoods.com';
    const targetPassword = 'FunctionalFoods1!';

    console.log(`🔧 Setting up AI account: ${targetEmail}`);

    // Hash password
    const hashedPassword = await bcrypt.hash(targetPassword, 10);

    // Get or create user
    let user = await prisma.user.findUnique({ where: { email: targetEmail } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name: 'AI Test Account',
          password: hashedPassword,
          role: 'customer',
          isActive: true
        }
      });
      console.log('✅ Created user:', user.email);
    } else {
      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Updated password for existing user');
    }

    // Get all course products
    const allCourses = await prisma.courseProduct.findMany();
    console.log(`📚 Found ${allCourses.length} courses`);

    const grantedCourses = [];
    
    for (const course of allCourses) {
      // Check if purchase already exists
      const existing = await prisma.purchase.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id
          }
        }
      });

      if (existing) {
        console.log(`⏭️  Already has: ${course.name}`);
        grantedCourses.push({ name: course.name, status: 'already_exists' });
      } else {
        // Create purchase
        await prisma.purchase.create({
          data: {
            userId: user.id,
            courseId: course.id,
            amount: 0,
            status: 'completed',
            accessExpiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
          }
        });
        console.log(`✅ Granted: ${course.name}`);
        grantedCourses.push({ name: course.name, status: 'granted' });
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'AI account setup complete',
      user: {
        email: user.email,
        name: user.name
      },
      courses: grantedCourses,
      totalCourses: allCourses.length
    });
  } catch (error) {
    console.error('Setup AI account error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

