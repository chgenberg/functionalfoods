import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email och lösenord krävs' }, { status: 400 });
    }

    // Demo account (disabled by default). Enable only if ALLOW_DEMO_LOGIN=true
    if (process.env.ALLOW_DEMO_LOGIN === 'true' && email === 'admin@functionalfoods.se' && password === 'admin123') {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
      const token = jwt.sign(
        { 
          userId: 'demo-admin', 
          email: 'admin@functionalfoods.se', 
          role: 'admin',
          isDemo: true 
        },
        process.env.JWT_SECRET,
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.role !== 'admin' || !(await bcrypt.compare(password, user.password))) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Delay to prevent timing attacks
      return NextResponse.json({ success: false, error: 'Ogiltiga inloggningsuppgifter' }, { status: 401 });
    }

    // If successful, create JWT
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
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
    return NextResponse.json({ success: false, error: 'Ett serverfel uppstod' }, { status: 500 });
  }
} 