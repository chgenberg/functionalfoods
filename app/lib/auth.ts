import { prisma } from '@/app/lib/database';
import crypto from 'crypto';

export async function createResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dagar
  await prisma.passwordReset.upsert({
    where: { userId },
    create: { userId, token, expiresAt },
    update: { token, expiresAt, used: false }
  });
  return token;
}
