import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

// POST /api/auth/reset-password — reset password with a valid token
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token och nytt lösenord krävs' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Lösenordet måste vara minst 6 tecken långt' }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() } }
    });
    if (!reset) {
      return NextResponse.json({ error: 'Ogiltig eller utgången länk' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { password: hashed, mustChangePassword: false } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } })
    ]);

    return NextResponse.json({ message: 'Lösenordet har uppdaterats' });
  } catch (error) {
    console.error('Reset POST error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/auth/reset-password?token=xxx — validate token
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ valid: false, error: 'Token saknas' }, { status: 400 });

    const reset = await prisma.passwordReset.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() } },
      include: { user: true }
    });
    if (!reset) return NextResponse.json({ valid: false, error: 'Ogiltig eller utgången länk' }, { status: 400 });

    return NextResponse.json({ valid: true, email: reset.user.email });
  } catch (error) {
    console.error('Reset GET error:', error);
    return NextResponse.json({ valid: false, error: 'Serverfel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper to create a reset token (for future use)
export async function createResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dagar
  await prisma.passwordReset.upsert({
    where: { userId },
    create: { userId, token, expiresAt },
    update: { token, expiresAt, used: false }
  });
  return token;
}