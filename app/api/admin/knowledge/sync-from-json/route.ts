import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course } = await req.json();
    
    if (!course || !['basic', 'flow', 'energy'].includes(course)) {
      return NextResponse.json({ 
        error: 'Invalid course. Must be basic, flow, or energy' 
      }, { status: 400 });
    }

    // Load JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', `knowledge-documents-${course}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        error: `JSON file not found: knowledge-documents-${course}.json` 
      }, { status: 404 });
    }

    const jsonDocs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (const doc of jsonDocs) {
      try {
        // Check if document exists
        const existing = await (prisma as any).knowledgeDocument?.findUnique({
          where: { slug: doc.slug }
        });

        const docData = {
          title: doc.title,
          slug: doc.slug,
          content: doc.content || '',
          headerImage: doc.headerImage || null,
          relatedImages: doc.relatedImages || null,
          keyTakeaways: doc.keyTakeaways || null,
          readTime: doc.readTime || 5,
          course: doc.course || course,
          courses: doc.courses || [course],
          order: doc.order || 0,
          weekNumber: doc.weekNumber || null,
        };

        if (existing) {
          // Update existing document
          await (prisma as any).knowledgeDocument?.update({
            where: { slug: doc.slug },
            data: docData
          });
          updated++;
        } else {
          // Create new document
          await (prisma as any).knowledgeDocument?.create({
            data: docData
          });
          created++;
        }
      } catch (error: any) {
        errors++;
        errorDetails.push(`${doc.slug}: ${error.message}`);
        console.error(`Error syncing document ${doc.slug}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${jsonDocs.length} documents from ${course} JSON file`,
      stats: {
        total: jsonDocs.length,
        created,
        updated,
        errors
      },
      errorDetails: errors > 0 ? errorDetails : undefined
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error: any) {
    console.error('Error syncing knowledge documents:', error);
    return NextResponse.json({ 
      error: 'Failed to sync documents',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to check sync status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = ['basic', 'flow', 'energy'];
    const status = [];

    for (const course of courses) {
      const filePath = path.join(process.cwd(), 'public', 'data', `knowledge-documents-${course}.json`);
      
      if (fs.existsSync(filePath)) {
        const jsonDocs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Count how many exist in DB
        const dbDocs = await (prisma as any).knowledgeDocument?.count({
          where: {
            OR: [
              { course: course },
              { courses: { has: course } }
            ]
          }
        });

        status.push({
          course,
          jsonCount: jsonDocs.length,
          dbCount: dbDocs || 0,
          needsSync: jsonDocs.length !== dbDocs
        });
      }
    }

    return NextResponse.json({ 
      status,
      totalInJson: status.reduce((sum, s) => sum + s.jsonCount, 0),
      totalInDb: status.reduce((sum, s) => sum + s.dbCount, 0)
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error: any) {
    console.error('Error checking sync status:', error);
    return NextResponse.json({ 
      error: 'Failed to check status',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

