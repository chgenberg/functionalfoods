import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/users/set-password
 * Body: { email: string, newPassword: string, mustChangePassword?: boolean }
 * Requires admin auth (adminToken cookie)
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { email, newPassword, mustChangePassword } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-postadress krävs' }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Lösenord måste vara minst 6 tecken' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: 'Användaren hittades inte' }, { status: 404 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        mustChangePassword: typeof mustChangePassword === 'boolean' ? mustChangePassword : false
      }
    });

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (error) {
    console.error('set-password error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}


