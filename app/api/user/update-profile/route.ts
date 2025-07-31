import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    // Get token from headers
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Ingen auktorisering' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // Get request body
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // Update name if provided
    if (name && name !== user.name) {
      updateData.name = name;
    }

    // Update email if provided and different
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return NextResponse.json({ error: 'E-postadressen används redan' }, { status: 400 });
      }
      
      updateData.email = email;
    }

    // Update password if provided
    if (newPassword) {
      // Verify current password first
      if (!currentPassword) {
        return NextResponse.json({ error: 'Nuvarande lösenord krävs' }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Felaktigt nuvarande lösenord' }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user if there are changes
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      return NextResponse.json({ 
        message: 'Profil uppdaterad',
        user: updatedUser 
      });
    }

    return NextResponse.json({ message: 'Inga ändringar gjordes' });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Fel vid uppdatering av profil' }, { status: 500 });
  }
}

// GET endpoint to fetch current user data
export async function GET(req: NextRequest) {
  try {
    // Get token from headers
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Ingen auktorisering' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        purchases: {
          include: {
            course: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Fel vid hämtning av profil' }, { status: 500 });
  }
} 