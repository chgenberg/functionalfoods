import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { emailService } from '../../../lib/email';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    console.log('🔄 Running course completion review reminder cron job...');
    
    // Find users who completed courses but haven't left reviews
    // Consider a course "completed" if purchased more than 6 weeks ago (course duration)
    const sixWeeksAgo = new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const completedPurchases = await prisma.purchase.findMany({
      where: {
        status: 'completed',
        createdAt: {
          lte: sixWeeksAgo, // Course should be completed by now
          gte: oneWeekAgo   // Don't send reminders for very old purchases
        }
      },
      include: {
        user: true,
        course: true
      }
    });
    
    let emailsSent = 0;
    let errors = 0;
    
    for (const purchase of completedPurchases) {
      try {
        // Check if user already left a review for this course
        const existingReview = await prisma.courseReview.findUnique({
          where: {
            userId_courseId: {
              userId: purchase.userId,
              courseId: purchase.courseId
            }
          }
        });
        
        if (existingReview) {
          console.log(`⏭️  User ${purchase.user.email} already reviewed ${purchase.course.name}`);
          continue;
        }
        
        // Check if we already sent a reminder recently (within last 2 weeks)
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const recentEmailCheck = await prisma.courseReview.findFirst({
          where: {
            userId: purchase.userId,
            courseId: purchase.courseId,
            createdAt: {
              gte: twoWeeksAgo
            }
          }
        });
        
        if (recentEmailCheck) {
          console.log(`⏭️  Recent reminder already sent to ${purchase.user.email} for ${purchase.course.name}`);
          continue;
        }
        
        // Send review request email
        const emailSent = await emailService.sendCourseReviewRequest({
          email: purchase.user.email,
          name: purchase.user.name || purchase.user.email.split('@')[0],
          courseId: purchase.courseId,
          courseName: purchase.course.name,
          userId: purchase.userId
        });
        
        if (emailSent) {
          emailsSent++;
          console.log(`✅ Review reminder sent to ${purchase.user.email} for ${purchase.course.name}`);
          
          // Create a placeholder review record to track that we sent the email
          await prisma.courseReview.create({
            data: {
              userId: purchase.userId,
              courseId: purchase.courseId,
              answers: { emailSent: true, reminderSentAt: new Date().toISOString() },
              consent: false,
              source: 'EMAIL',
              status: 'PENDING'
            }
          });
        } else {
          errors++;
          console.log(`❌ Failed to send review reminder to ${purchase.user.email}`);
        }
        
      } catch (error) {
        errors++;
        console.error(`❌ Error processing review reminder for user ${purchase.user.email}:`, error);
      }
    }
    
    console.log(`🎉 Review reminder cron job completed: ${emailsSent} emails sent, ${errors} errors`);
    
    return NextResponse.json({
      success: true,
      emailsSent,
      errors,
      message: `Sent ${emailsSent} review reminders`
    });
    
  } catch (error) {
    console.error('❌ Error in review reminder cron job:', error);
    return NextResponse.json(
      { error: 'Failed to process review reminders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 