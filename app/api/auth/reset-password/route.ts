import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import bcrypt from 'bcryptjs';

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
  }
}