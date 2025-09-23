import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email och lösenord krävs' },
        { status: 400 }
      );
    }

    const userRaw = await prisma.user.findUnique({ where: { email } });
    const user = userRaw as any;

    if (!user) {
      return NextResponse.json(
        { error: 'Felaktig email eller lösenord' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);

    // If user must change password, always redirect to reset flow
    // (even if password was entered wrong) to avoid dead-ends on first login.
    if ((user as any).mustChangePassword) {
      // Create reset token
      const token = (await prisma.passwordReset.upsert({
        where: { userId: (user as any).id },
        create: {
          userId: (user as any).id,
          token: crypto.randomBytes(32).toString('hex'),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dagar
        },
        update: {
          token: crypto.randomBytes(32).toString('hex'),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          used: false
        }
      })).token;

      return NextResponse.json({
        requirePasswordChange: true,
        resetUrl: `/reset-password?token=${encodeURIComponent(token)}`
      });
    }

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Felaktig email eller lösenord' },
        { status: 401 }
      );
    }

    await prisma.user.update({ where: { id: (user as any).id }, data: { lastLogin: new Date() } });

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLanguage: user.preferredLanguage || null,
        nationality: user.nationality || null
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user as any;

    const res = NextResponse.json({ user: userWithoutPassword, token });
    if (user.preferredLanguage) {
      const cookieVal = String(user.preferredLanguage).toLowerCase();
      res.headers.set('Set-Cookie', `lang=${cookieVal}; Path=/; Max-Age=31536000; SameSite=Lax`);
    }
    return res;
  } catch (error) {
    console.error('Inloggningsfel:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid inloggning' },
      { status: 500 }
    );
  }
} 