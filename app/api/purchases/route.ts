import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PaymentService, PaymentRequest } from '../../lib/payment';
import { emailService } from '../../lib/email';

const prisma = new PrismaClient();
const paymentService = new PaymentService();

// Helper function to generate a random password
function generateRandomPassword(length: number = 8): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentMethod, customerInfo, createAccount = false } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Inga produkter i beställningen' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Ingen betalningsmetod vald' },
        { status: 400 }
      );
    }

    let user: any = null;
    let isNewUser = false;
    let generatedPassword: string | null = null;

    // Check if user is logged in
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
      } catch (error) {
        // Invalid token, continue as guest
      }
    }

    // If no logged in user, handle guest checkout
    if (!user) {
      if (!customerInfo || !customerInfo.email || !customerInfo.name) {
        return NextResponse.json(
          { error: 'Kunduppgifter (email och namn) krävs för gästköp' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: customerInfo.email }
      });

      if (existingUser) {
        user = existingUser;
      } else if (createAccount) {
        // Create new user account
        generatedPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        user = await prisma.user.create({
          data: {
            email: customerInfo.email,
            name: customerInfo.name,
            password: hashedPassword,
            role: 'customer',
            isActive: true
          }
        });
        isNewUser = true;
      } else {
        return NextResponse.json(
          { error: 'Användaren existerar redan. Vänligen logga in eller välj "Skapa konto".' },
          { status: 400 }
        );
      }
    }

    // Validate and fetch courses
    const courseIds = items
      .filter(item => item.type === 'course')
      .map(item => item.name);

    const courses = await prisma.courseProduct.findMany({
      where: {
        name: { in: courseIds }
      }
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { error: 'En eller flera kurser hittades inte' },
        { status: 404 }
      );
    }

    // Check if user already owns any of the courses
    const existingPurchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
        courseId: { in: courses.map(c => c.id) },
        status: 'completed'
      }
    });

    if (existingPurchases.length > 0) {
      const ownedCourses = existingPurchases.map(p => 
        courses.find(c => c.id === p.courseId)?.name
      ).filter(Boolean);
      
      return NextResponse.json(
        { error: `Du äger redan följande kurser: ${ownedCourses.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      const course = courses.find(c => c.name === item.name);
      return sum + (course ? course.price * item.quantity : 0);
    }, 0);

    // Generate unique order number
    const orderNumber = `UFF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'PENDING',
        totalAmount,
        currency: 'SEK',
        items: {
          create: items.map(item => {
            const course = courses.find(c => c.name === item.name);
            return {
              courseId: course?.id,
              name: item.name,
              price: course?.price || 0,
              quantity: item.quantity,
              type: item.type
            };
          })
        }
      },
      include: {
        items: true
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod,
        status: 'PENDING',
        amount: totalAmount,
        currency: 'SEK'
      }
    });

    // Process payment
    const paymentRequest: PaymentRequest = {
      amount: totalAmount,
      currency: 'SEK',
      items: items,
      customer: {
        userId: user.id,
        email: user.email,
        name: user.name || undefined
      },
      paymentMethod,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`
    };

    const paymentResult = await paymentService.processPayment(paymentRequest);

    // Update payment with result
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentResult.status === 'completed' ? 'COMPLETED' :
                paymentResult.status === 'failed' ? 'FAILED' :
                paymentResult.status === 'cancelled' ? 'CANCELLED' : 'PROCESSING',
        externalId: paymentResult.paymentId,
        gatewayResponse: paymentResult as any,
        processedAt: paymentResult.success ? new Date() : null,
      }
    });

    if (paymentResult.success && paymentResult.status === 'completed') {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' }
      });

      // Create Purchase records for backward compatibility
      const purchases = [];
      for (const item of items) {
        if (item.type === 'course') {
          const course = courses.find(c => c.name === item.name);
          if (course) {
            const purchase = await prisma.purchase.create({
              data: {
                userId: user.id,
                courseId: course.id,
                amount: course.price * item.quantity,
                status: 'completed',
                orderId: order.id
              },
              include: {
                course: true
              }
            });
            purchases.push(purchase);
          }
        }
      }

      // Send order confirmation email with optional login credentials
      try {
        const emailData: any = {
          customerEmail: user.email,
          customerName: user.name || user.email,
          orderNumber: order.orderNumber,
          totalAmount,
          courses: courses.map(c => ({
            name: c.name,
            price: c.price
          }))
        };

        // Include login credentials for new users
        if (isNewUser && generatedPassword) {
          emailData.loginCredentials = {
            email: user.email,
            password: generatedPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login`
          };
        }

        await emailService.sendOrderConfirmation(emailData);
        console.log('Order confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      // Generate JWT token for automatic login (for new users)
      let token = null;
      if (isNewUser) {
        token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );
      }

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'COMPLETED',
          totalAmount
        },
        payment: {
          id: payment.id,
          status: 'COMPLETED',
          paymentId: paymentResult.paymentId
        },
        purchases,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isNewUser
        },
        token, // JWT token for new users
        message: isNewUser 
          ? 'Köp genomfört framgångsrikt! Ett konto har skapats åt dig.' 
          : 'Köp genomfört framgångsrikt!'
      });

    } else if (paymentResult.redirectUrl) {
      // For payments that require redirect (Klarna, Stripe checkout etc.)
      return NextResponse.json({
        success: false,
        requiresRedirect: true,
        redirectUrl: paymentResult.redirectUrl,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'PENDING'
        },
        payment: {
          id: payment.id,
          status: 'PROCESSING'
        }
      });

    } else {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' }
      });

      return NextResponse.json({
        success: false,
        error: paymentResult.error || 'Betalningen misslyckades',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'CANCELLED'
        }
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid köp' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 