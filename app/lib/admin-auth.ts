import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AdminUser {
  userId: string;
  email: string;
  role: string;
  isDemo?: boolean;
}

export async function verifyAdminAuth(request?: NextRequest): Promise<AdminUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken');

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token.value, 
      process.env.JWT_SECRET || 'functional-foods-secret-2025'
    ) as AdminUser;

    // Check if it's a valid admin
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return null;
  }
}

export async function requireAdminAuth(request: NextRequest) {
  const admin = await verifyAdminAuth(request);
  
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  return admin;
}

// Helper to create an admin user if none exists
export async function ensureAdminUserExists() {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminExists) {
      // Create a default admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@functionalfoods.se',
          password: hashedPassword,
          name: 'Admin',
          role: 'admin',
          isActive: true
        }
      });
      
      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
} 