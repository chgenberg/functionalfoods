import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
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
        process.env.JWT_SECRET || 'your-secret-key',
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
      process.env.JWT_SECRET || 'your-secret-key',
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
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Serverfel. Försök igen.' },
      { status: 500 }
    );
  }
} 