import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserIdFromToken(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            return decoded.userId as string;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function PATCH(request: Request) {
    try {
        const headersList = headers();
        const authHeader = headersList.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Autentiseringstoken saknas' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const userId = getUserIdFromToken(token);

        if (!userId) {
            return NextResponse.json({ error: 'Ogiltig token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'Användaren hittades inte' }, { status: 404 });
        }
        
        const body = await request.json();
        const { name, email, currentPassword, newPassword } = body;
        
        let requiresNewToken = false;
        const dataToUpdate: Record<string, any> = {};

        // Hantera namn- och e-postuppdatering
        if (name && name !== user.name) {
            dataToUpdate.name = name;
            requiresNewToken = true;
        }
        if (email && email !== user.email) {
             const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return NextResponse.json({ error: 'E-postadressen används redan' }, { status: 409 });
            }
            dataToUpdate.email = email;
            requiresNewToken = true;
        }

        // Hantera lösenordsbyte
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Felaktigt nuvarande lösenord' }, { status: 401 });
            }
            dataToUpdate.password = await bcrypt.hash(newPassword, 10);
        } else if (currentPassword || newPassword) {
            return NextResponse.json({ error: 'Både nuvarande och nytt lösenord krävs' }, { status: 400 });
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json({ message: 'Inga ändringar att spara' }, { status: 200 });
        }
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        let newToken = null;
        if (requiresNewToken) {
            newToken = jwt.sign(
                { userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
        }

        const { password, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({ 
            message: 'Inställningarna har uppdaterats!', 
            user: userWithoutPassword,
            token: newToken 
        });

    } catch (error) {
        console.error('Fel vid uppdatering av inställningar:', error);
        return NextResponse.json({ error: 'Ett serverfel uppstod' }, { status: 500 });
    }
} 