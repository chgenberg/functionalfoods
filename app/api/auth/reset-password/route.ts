import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token saknas' }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!reset) {
      return NextResponse.json({ valid: false, error: 'Ogiltig eller utgången länk' }, { status: 400 });
    }

    return NextResponse.json({ valid: true, email: reset.user.email });
  } catch (error) {
    console.error('Reset GET error:', error);
    return NextResponse.json({ valid: false, error: 'Serverfel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token och nytt lösenord krävs' }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!reset) {
      return NextResponse.json({ error: 'Ogiltig eller utgången länk' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashed, mustChangePassword: false }
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true }
      })
    ]);

    return NextResponse.json({ message: 'Lösenordet har uppdaterats' });
  } catch (error) {
    console.error('Reset POST error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper to create a reset token (for future use)
export async function createResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
  await prisma.passwordReset.upsert({
    where: { userId },
    create: { userId, token, expiresAt },
    update: { token, expiresAt, used: false }
  });
  return token;
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRateLimit, authRateLimit } from '@/app/lib/rate-limit';
import { logInfo, logWarn, logError } from '@/app/lib/monitoring';

const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password
 * Reset user password with valid token
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, authRateLimit, async () => {
    try {
      const { token, password } = await request.json();
      
      // Validate input
      if (!token || !password) {
        return NextResponse.json({
          error: 'Token och lösenord krävs'
        }, { status: 400 });
      }
      
      if (password.length < 6) {
        return NextResponse.json({
          error: 'Lösenordet måste vara minst 6 tecken långt'
        }, { status: 400 });
      }
      
      logInfo('Password reset attempt', { token: token.substring(0, 8) + '...' });
      
      // Find and validate reset token
      const resetRequest = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true }
      });
      
      if (!resetRequest) {
        logWarn('Invalid password reset token used', { token: token.substring(0, 8) + '...' });
        return NextResponse.json({
          error: 'Ogiltig eller utgången återställningslänk'
        }, { status: 400 });
      }
      
      // Check if token is expired
      if (new Date() > resetRequest.expiresAt) {
        logWarn('Expired password reset token used', { 
          userId: resetRequest.userId,
          expiredAt: resetRequest.expiresAt 
        });
        
        // Clean up expired token
        await prisma.passwordReset.delete({
          where: { id: resetRequest.id }
        });
        
        return NextResponse.json({
          error: 'Återställningslänken har gått ut. Begär en ny återställning.'
        }, { status: 400 });
      }
      
      // Check if token has already been used
      if (resetRequest.used) {
        logWarn('Already used password reset token', { userId: resetRequest.userId });
        return NextResponse.json({
          error: 'Denna återställningslänk har redan använts'
        }, { status: 400 });
      }
      
      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Update password and mark token as used in transaction
      await prisma.$transaction(async (tx) => {
        // Update user password
        await tx.user.update({
          where: { id: resetRequest.userId },
          data: { 
            password: hashedPassword,
            updatedAt: new Date()
          }
        });
        
        // Mark token as used
        await tx.passwordReset.update({
          where: { id: resetRequest.id },
          data: { used: true }
        });
      });
      
      logInfo('Password successfully reset', { 
        userId: resetRequest.userId,
        email: resetRequest.user.email 
      });
      
      return NextResponse.json({
        success: true,
        message: 'Lösenordet har återställts. Du kan nu logga in med ditt nya lösenord.'
      });
      
    } catch (error) {
      logError('Password reset failed', { error });
      
      return NextResponse.json({
        error: 'Ett tekniskt fel uppstod. Försök igen senare.'
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  });
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Validate reset token (for frontend to check if token is valid)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({
        valid: false,
        error: 'Token saknas'
      }, { status: 400 });
    }
    
    // Find reset token
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { email: true } } }
    });
    
    if (!resetRequest) {
      return NextResponse.json({
        valid: false,
        error: 'Ogiltig återställningslänk'
      });
    }
    
    // Check if expired
    if (new Date() > resetRequest.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: 'Återställningslänken har gått ut'
      });
    }
    
    // Check if already used
    if (resetRequest.used) {
      return NextResponse.json({
        valid: false,
        error: 'Denna länk har redan använts'
      });
    }
    
    return NextResponse.json({
      valid: true,
      email: resetRequest.user.email,
      expiresAt: resetRequest.expiresAt
    });
    
  } catch (error) {
    logError('Token validation failed', { error });
    
    return NextResponse.json({
      valid: false,
      error: 'Ett tekniskt fel uppstod'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 