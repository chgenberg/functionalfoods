import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { withRateLimit, authRateLimit } from '@/app/lib/rate-limit';
import { isValidEmail, generateSecureToken } from '@/app/lib/security';
import { emailService } from '@/app/lib/email';
import { logInfo, logWarn, logError } from '@/app/lib/monitoring';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password
 * Send password reset email to user
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, authRateLimit, async () => {
    try {
      const { email } = await request.json();
      
      // Validate input
      if (!email || !isValidEmail(email)) {
        return NextResponse.json({
          error: 'Ogiltig e-postadress'
        }, { status: 400 });
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      
      logInfo('Password reset requested', { email: normalizedEmail });
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      
      // Always return success to prevent email enumeration attacks
      const successResponse = {
        success: true,
        message: 'Om e-postadressen finns i vårt system kommer du att få instruktioner för lösenordsåterställning.'
      };
      
      if (!user) {
        logWarn('Password reset requested for non-existent email', { email: normalizedEmail });
        // Still return success to prevent enumeration
        return NextResponse.json(successResponse);
      }
      
      // Generate secure reset token
      const resetToken = generateSecureToken(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      // Store reset token in database
      await prisma.passwordReset.upsert({
        where: { userId: user.id },
        update: {
          token: resetToken,
          expiresAt,
          used: false,
          createdAt: new Date()
        },
        create: {
          userId: user.id,
          token: resetToken,
          expiresAt,
          used: false
        }
      });
      
      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
        logInfo('Password reset email sent', { 
          userId: user.id, 
          email: normalizedEmail 
        });
      } catch (emailError) {
        logError(emailError instanceof Error ? emailError : new Error('Failed to send password reset email'), { 
          userId: user.id,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
        logWarn('Password reset email send failure metadata', {
          email: normalizedEmail,
          error: emailError as any
        });
        
        // Don't expose email sending errors to user
        return NextResponse.json({
          error: 'Ett tekniskt fel uppstod. Försök igen senare.'
        }, { status: 500 });
      }
      
      return NextResponse.json(successResponse);
      
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Password reset request failed'), { 
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({
        error: 'Ett tekniskt fel uppstod. Försök igen senare.'
      }, { status: 500 });
    }
  });
} 