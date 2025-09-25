import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { PrismaClient } from '@prisma/client';
import { emailService } from '@/app/lib/email';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if ((auth as any)?.status === 401) return auth as unknown as NextResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const { filterCourseIds, previewOnly, limit } = body as { filterCourseIds?: string[]; previewOnly?: boolean; limit?: number };

    const where: any = { role: 'customer', isActive: true };
    if (filterCourseIds && Array.isArray(filterCourseIds) && filterCourseIds.length > 0) {
      where.purchases = { some: { courseId: { in: filterCourseIds } } };
    }

    const users = await prisma.user.findMany({
      where,
      take: limit && Number.isFinite(limit) ? Number(limit) : undefined
    });

    if (previewOnly) {
      return NextResponse.json({ count: users.length, sample: users.slice(0, 5).map(u => ({ id: u.id, email: u.email })) });
    }

    // Process in small batches to avoid rate limits
    const results: Array<{ email: string; ok: boolean; error?: string }> = [];
    for (const user of users) {
      try {
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
        const bcrypt = require('bcryptjs');
        const hashed = await bcrypt.hash(password, 12);

        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashed, mustChangePassword: true }
        });

        const ok = await emailService.sendTemporaryPasswordEmail({ email: user.email, name: user.name, password });
        results.push({ email: user.email, ok });
      } catch (e: any) {
        results.push({ email: user.email, ok: false, error: String(e?.message || e) });
      }
    }

    return NextResponse.json({ updated: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok), total: users.length });
  } catch (error) {
    console.error('bulk-reset-passwords error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


