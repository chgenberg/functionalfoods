import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Ingen auktorisering' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const body = await req.json();
    const { name, email, currentPassword, newPassword, addressLine1, addressLine2, postalCode, city, country } = body;

    const user: any = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });

    const updateData: any = {};

    if (name && name !== user.name) updateData.name = name;

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return NextResponse.json({ error: 'E-postadressen används redan' }, { status: 400 });
      updateData.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        console.error('❌ Password change attempt without current password for user:', user.email);
        return NextResponse.json({ error: 'Nuvarande lösenord krävs' }, { status: 400 });
      }
      
      // Trim whitespace from password (in case it was copied from email with spaces)
      const trimmedCurrentPassword = currentPassword.trim();
      
      console.log('🔐 Password verification attempt');
      console.log('   User:', user.email);
      console.log('   Current password provided length:', currentPassword.length);
      console.log('   Current password trimmed length:', trimmedCurrentPassword.length);
      console.log('   New password length:', newPassword.length);
      console.log('   Stored hash type:', user.password.substring(0, 7)); // Show bcrypt prefix
      console.log('   Stored hash length:', user.password.length);
      
      const isPasswordValid = await bcrypt.compare(trimmedCurrentPassword, user.password);
      
      if (!isPasswordValid) {
        console.error('❌ Password verification FAILED');
        console.error('   User:', user.email);
        console.error('   Tried password length:', trimmedCurrentPassword.length);
        console.error('   Hash in DB starts:', user.password.substring(0, 20));
        
        // Try without trimming (in case it's actually part of the password)
        const isPasswordValidUntrimmed = await bcrypt.compare(currentPassword, user.password);
        if (isPasswordValidUntrimmed) {
          console.log('✅ Password matched WITHOUT trimming!');
          updateData.password = await bcrypt.hash(newPassword, 12);
        } else {
          console.error('❌ Password also failed without trimming');
          return NextResponse.json({ error: 'Felaktigt nuvarande lösenord' }, { status: 400 });
        }
      } else {
        console.log('✅ Password verified successfully (with trimming)');
        updateData.password = await bcrypt.hash(newPassword, 12); // Match webhook's 12 rounds
      }
    }

    updateData.addressLine1 = addressLine1 ?? user.addressLine1;
    updateData.addressLine2 = addressLine2 ?? user.addressLine2;
    updateData.postalCode = postalCode ?? user.postalCode;
    updateData.city = city ?? user.city;
    updateData.country = country ?? user.country;

    // If password changed, clear mustChangePassword flag
    if (updateData.password) {
      updateData.mustChangePassword = false;
    }

    const updated: any = await prisma.user.update({ where: { id: userId }, data: updateData });

    const safeUser = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      createdAt: updated.createdAt,
      addressLine1: updated.addressLine1,
      addressLine2: updated.addressLine2,
      postalCode: updated.postalCode,
      city: updated.city,
      country: updated.country,
    };

    return NextResponse.json({ message: 'Profil uppdaterad', user: safeUser });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Fel vid uppdatering av profil' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Ingen auktorisering' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { purchases: { include: { course: true } } }
    });

    if (!user) return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      postalCode: user.postalCode,
      city: user.city,
      country: user.country,
      purchases: user.purchases
    };

    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Fel vid hämtning av profil' }, { status: 500 });
  }
} 