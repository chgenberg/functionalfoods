import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/app/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  // Disable legacy endpoint in production unless explicitly allowed
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_LOGIN !== 'true') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    const { email, password } = await request.json();

    // Validera input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-post och lösenord krävs' },
        { status: 400 }
      );
    }

    // Kolla om det är demo-kontot
    if (email === 'admin@functionalfoods.se' && password === 'admin123') {
      // Skapa JWT token
      const token = sign(
        { 
          userId: 'admin',
          email: 'admin@functionalfoods.se',
          role: 'admin',
          isDemo: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        token,
        user: {
          id: 'admin',
          email: 'admin@functionalfoods.se',
          name: 'Admin',
          role: 'admin',
          isDemo: true
        }
      });
    }

    // Kolla i databasen för riktiga admin-användare
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Ogiltiga inloggningsuppgifter' },
        { status: 401 }
      );
    }

    // Verifiera lösenord
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Ogiltiga inloggningsuppgifter' },
        { status: 401 }
      );
    }

    // Skapa JWT token
    const token = sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ett fel uppstod' },
      { status: 500 }
    );
  }
} 