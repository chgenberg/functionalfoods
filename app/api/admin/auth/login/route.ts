import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email och lösenord krävs' }, { status: 400 });
    }

    // Demo account - always works
    if (email === 'admin@functionalfoods.se' && password === 'admin123') {
      const token = jwt.sign(
        { 
          userId: 'demo-admin', 
          email: 'admin@functionalfoods.se', 
          role: 'admin',
          isDemo: true 
        },
        process.env.JWT_SECRET || 'functional-foods-secret-2025',
        { expiresIn: '24h' }
      );

      // Set HTTP-only cookie
      cookies().set('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 // 24 hours
      });

      return NextResponse.json({
        success: true,
        user: {
          id: 'demo-admin',
          email: 'admin@functionalfoods.se',
          name: 'Demo Admin',
          role: 'admin',
          isDemo: true
        }
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Ogiltiga inloggningsuppgifter' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Ogiltiga inloggningsuppgifter' }, { status: 401 });
    }

    // Check if user has admin role (case insensitive)
    if (user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Ingen behörighet' }, { status: 403 });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'functional-foods-secret-2025',
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    cookies().set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 