import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Verify admin authentication for API routes
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: AdminUser;
  error?: string;
}> {
  try {
    // Try cookie-based auth first (for server-side requests)
    const cookieStore = cookies();
    let token = cookieStore.get('adminToken')?.value;
    
    // Fallback to Authorization header (for client-side requests)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return {
        isAuthenticated: false,
        error: 'No authentication token provided'
      };
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (jwtError) {
      return {
        isAuthenticated: false,
        error: 'Invalid or expired token'
      };
    }

    // Check if user exists and has admin role
    if (decoded.isDemo && decoded.email === 'admin@functionalfoods.se') {
      // Demo admin account
      return {
        isAuthenticated: true,
        user: {
          id: 'admin',
          email: 'admin@functionalfoods.se',
          name: 'Admin User',
          role: 'admin'
        }
      };
    }

    // Real admin user - check database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user || user.role.toLowerCase() !== 'admin') {
      return {
        isAuthenticated: false,
        error: 'User not found or insufficient permissions'
      };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role
      }
    };

  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication verification failed'
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Middleware wrapper for admin-only routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: AdminUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const auth = await verifyAdminAuth(request);
    
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, auth.user);
  };
}

/**
 * Create admin session token
 */
export function createAdminToken(user: AdminUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
} 