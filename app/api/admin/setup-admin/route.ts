import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Säkerhetskontroll: Kräv en hemlig nyckel
    const { secret } = await req.json();
    
    // Använd en hemlig nyckel för att skydda denna endpoint
    // Du kan sätta ADMIN_SETUP_SECRET i Railway miljövariabler
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || 'setup-admin-2024';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Kolla om det redan finns en admin-användare
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ulrikafunctionalfoods.se' }
    });

    if (existingAdmin && existingAdmin.role === 'admin') {
      return NextResponse.json({
        message: 'Admin-användare finns redan',
        email: 'admin@ulrikafunctionalfoods.se',
        note: 'Använd befintligt lösenord eller återställ det'
      });
    }

    // Skapa admin-användare med säkert lösenord
    const hashedPassword = await bcrypt.hash('UlrikaAdmin2024!', 10);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@ulrikafunctionalfoods.se' },
      update: {
        password: hashedPassword,
        role: 'admin',
        name: 'Ulrika Admin',
        isActive: true
      },
      create: {
        email: 'admin@ulrikafunctionalfoods.se',
        password: hashedPassword,
        role: 'admin',
        name: 'Ulrika Admin',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin-användare skapad!',
      credentials: {
        email: 'admin@ulrikafunctionalfoods.se',
        password: 'UlrikaAdmin2024!',
        note: '⚠️ VIKTIGT: Ändra lösenordet efter första inloggningen!'
      },
      loginUrl: '/admin/login'
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint för att kolla status (utan att skapa användare)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || 'setup-admin-2024';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Kolla om admin finns
    const adminExists = await prisma.user.findFirst({
      where: { 
        email: 'admin@ulrikafunctionalfoods.se',
        role: 'admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      adminExists: !!adminExists,
      admin: adminExists || null
    });

  } catch (error) {
    console.error('Error checking admin user:', error);
    return NextResponse.json(
      { error: 'Failed to check admin user' },
      { status: 500 }
    );
  }
}
