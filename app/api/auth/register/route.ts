import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import bcrypt from 'bcryptjs';

type LangCode = 'SV' | 'EN' | 'ES' | 'DE' | 'FR';

export async function POST(request: Request) {
  try {
    const { email, password, name, nationality, preferredLanguage } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email och lösenord krävs' },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'En användare med denna email finns redan' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Map preferredLanguage string -> enum string
    let langEnum: LangCode | undefined = undefined;
    const map: Record<string, LangCode> = { sv: 'SV', en: 'EN', es: 'ES', de: 'DE', fr: 'FR' };
    if (preferredLanguage && typeof preferredLanguage === 'string' && map[preferredLanguage.toLowerCase()]) {
      langEnum = map[preferredLanguage.toLowerCase()];
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: hashedPassword,
        role: 'customer',
        nationality,
        preferredLanguage: langEnum as any
      } as any
    });

    const { password: _, ...userWithoutPassword } = user as any;

    const res = NextResponse.json(userWithoutPassword);
    if (langEnum) {
      const cookieVal = (langEnum as string).toLowerCase();
      res.headers.set('Set-Cookie', `lang=${cookieVal}; Path=/; Max-Age=31536000; SameSite=Lax`);
    }
    return res;
  } catch (error) {
    console.error('Registreringsfel:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid registrering' },
      { status: 500 }
    );
  }
} 