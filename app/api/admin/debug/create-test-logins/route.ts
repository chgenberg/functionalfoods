import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

type CourseSpec = {
  email: string;
  name: string;
  password: string;
  courseName: 'Functional Basics' | 'Functional Flow' | 'Functional Energy';
};

const TEST_ACCOUNTS: CourseSpec[] = [
  {
    email: 'test.basics@functionalfoods.se',
    name: 'Test Basics',
    password: 'BasicsTest2025!',
    courseName: 'Functional Basics'
  },
  {
    email: 'test.flow@functionalfoods.se',
    name: 'Test Flow',
    password: 'FlowTest2025!',
    courseName: 'Functional Flow'
  },
  {
    email: 'test.energy@functionalfoods.se',
    name: 'Test Energy',
    password: 'EnergyTest2025!',
    courseName: 'Functional Energy'
  }
];

export async function POST(req: NextRequest) {
  // Allow either admin cookie OR a one-time setup token via header/query
  const url = new URL(req.url);
  const tokenInQuery = url.searchParams.get('token');
  const tokenInHeader = req.headers.get('x-setup-token');
  const setupToken = process.env.ADMIN_SETUP_TOKEN;

  let isAuthorized = false;
  if (setupToken && (tokenInQuery === setupToken || tokenInHeader === setupToken)) {
    isAuthorized = true;
  } else {
    const auth = await requireAdminAuth(req);
    if (!((auth as any)?.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    isAuthorized = true;
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const overrideAccounts: CourseSpec[] | undefined = Array.isArray(body?.accounts) ? body.accounts : undefined;
    const accountsToCreate = overrideAccounts && overrideAccounts.length > 0 ? overrideAccounts : TEST_ACCOUNTS;

    const results: any[] = [];

    for (const spec of accountsToCreate) {
      // Ensure course exists
      const course = await prisma.courseProduct.findUnique({ where: { name: spec.courseName } });
      if (!course) {
        results.push({ email: spec.email, ok: false, error: `Course not found: ${spec.courseName}` });
        continue;
      }

      // Upsert user and set password
      const hashed = await bcrypt.hash(spec.password, 12);
      const user = await prisma.user.upsert({
        where: { email: spec.email },
        update: { name: spec.name, password: hashed, isActive: true, role: 'customer' },
        create: { email: spec.email, name: spec.name, password: hashed, role: 'customer', isActive: true }
      });

      // Grant purchase if missing
      const existing = await prisma.purchase.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } }
      });
      if (!existing) {
        await prisma.purchase.create({
          data: {
            userId: user.id,
            courseId: course.id,
            amount: course.price,
            status: 'completed',
            accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          }
        });
      } else if (existing.status !== 'completed' || !existing.accessExpiresAt) {
        await prisma.purchase.update({
          where: { id: existing.id },
          data: {
            status: 'completed',
            accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          }
        });
      }

      results.push({
        email: spec.email,
        password: spec.password,
        course: spec.courseName,
        loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ulrika-functional-foods-production.up.railway.app'}/login`
      });
    }

    return NextResponse.json({ ok: true, accounts: results });
  } catch (error: any) {
    console.error('create-test-logins error:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


