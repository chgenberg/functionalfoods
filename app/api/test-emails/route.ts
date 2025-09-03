import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '../../lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Testar email-systemet...');
    
    const testEmail = 'ch.genberg@gmail.com';
    const testName = 'Christopher Genberg';
    
    const results = {
      orderEmail: false,
      reviewEmail: false,
      errors: [] as string[]
    };
    
    try {
      // 1. Test order confirmation with login credentials
      console.log('📧 Skickar orderbekräftelse med inloggningsuppgifter...');
      
      const orderData = {
        customerEmail: testEmail,
        customerName: testName,
        orderNumber: 'TEST-' + Date.now(),
        totalAmount: 2295,
        courses: [
          {
            name: 'Functional Energy',
            price: 2295
          }
        ],
        loginCredentials: {
          email: testEmail,
          password: 'TempPass123!',
          loginUrl: 'https://ulrika-functional-foods-production.up.railway.app/login'
        }
      };
      
      results.orderEmail = await emailService.sendOrderConfirmation(orderData);
      console.log(results.orderEmail ? '✅ Orderbekräftelse skickad!' : '❌ Fel vid orderbekräftelse');
      
    } catch (error) {
      results.errors.push(`Order email error: ${error}`);
      console.error('❌ Fel vid orderbekräftelse:', error);
    }
    
    try {
      // 2. Test review request email
      console.log('📧 Skickar recensionsförfrågan...');
      
      const reviewData = {
        email: testEmail,
        name: testName,
        courseName: 'Functional Energy',
        courseId: 'functional-energy',
        userId: 'test-user-123'
      };
      
      results.reviewEmail = await emailService.sendCourseReviewRequest(reviewData);
      console.log(results.reviewEmail ? '✅ Recensionsförfrågan skickad!' : '❌ Fel vid recensionsförfrågan');
      
    } catch (error) {
      results.errors.push(`Review email error: ${error}`);
      console.error('❌ Fel vid recensionsförfrågan:', error);
    }
    
    console.log('🎉 Email-test slutfört!');
    console.log(`📬 Kontrollera ${testEmail} för båda mejlen.`);
    
    return NextResponse.json({
      success: true,
      message: 'Email test completed',
      results,
      testEmail
    });
    
  } catch (error) {
    console.error('❌ Fel vid email-test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testEmail: 'ch.genberg@gmail.com'
    }, { status: 500 });
  }
} 