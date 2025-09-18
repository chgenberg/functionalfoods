import { emailService } from '../app/lib/email.ts';

async function testEmails() {
  console.log('🧪 Testar email-systemet...');
  
  const testEmail = 'ch.genberg@gmail.com';
  const testName = 'Christopher Genberg';
  
  try {
    // 1. Test order confirmation with login credentials
    console.log('\n📧 Skickar orderbekräftelse med inloggningsuppgifter...');
    
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
    
    const orderEmailSent = await emailService.sendOrderConfirmation(orderData);
    console.log(orderEmailSent ? '✅ Orderbekräftelse skickad!' : '❌ Fel vid orderbekräftelse');
    
    // 2. Test review request email
    console.log('\n📧 Skickar recensionsförfrågan...');
    
    const reviewData = {
      email: testEmail,
      name: testName,
      courseName: 'Functional Energy',
      courseId: 'functional-energy',
      userId: 'test-user-123'
    };
    
    const reviewEmailSent = await emailService.sendCourseReviewRequest(reviewData);
    console.log(reviewEmailSent ? '✅ Recensionsförfrågan skickad!' : '❌ Fel vid recensionsförfrågan');
    
    console.log('\n🎉 Email-test slutfört!');
    console.log(`📬 Kontrollera ${testEmail} för båda mejlen.`);
    
  } catch (error) {
    console.error('❌ Fel vid email-test:', error);
  }
}

// Kör testet
testEmails(); 