import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

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

    // If user must change password, issue reset token and short-circuit immediately
    if ((user as any).mustChangePassword && validPassword) {
      const token = (await prisma.passwordReset.upsert({
        where: { userId: (user as any).id },
        create: {
          userId: (user as any).id,
          token: crypto.randomBytes(32).toString('hex'),
          // kortare giltighet räcker för första inloggningen
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        },
        update: {
          token: crypto.randomBytes(32).toString('hex'),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          used: false
        }
      })).token;

      return NextResponse.json({ requirePasswordChange: true, resetUrl: `/reset-password?token=${encodeURIComponent(token)}` });
    }

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Felaktig email eller lösenord' },
        { status: 401 }
      );
    }

    await prisma.user.update({ where: { id: (user as any).id }, data: { lastLogin: new Date() } });

    // Create token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLanguage: user.preferredLanguage || null,
        nationality: user.nationality || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
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