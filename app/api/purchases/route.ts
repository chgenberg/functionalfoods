import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PaymentService, PaymentRequest } from '../../lib/payment';
import { emailService } from '../../lib/email';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const paymentService = new PaymentService();

const SUPPORTED = ['sv', 'en', 'es', 'de', 'fr'] as const;
type Lang = typeof SUPPORTED[number];
const M: Record<Lang, Record<string,string>> = {
  sv: {
    noItems: 'Inga produkter i beställningen',
    noMethod: 'Ingen betalningsmetod vald',
    needCustomer: 'Kunduppgifter (email och namn) krävs för gästköp',
    mustCreate: 'Du måste skapa ett konto för att genomföra köpet. Markera "Skapa ett konto åt mig" eller logga in om du redan har ett konto.',
    notFound: 'En eller flera kurser hittades inte',
    alreadyOwn: 'Du äger redan följande kurser: ',
    successNew: 'Köp genomfört framgångsrikt! Ett konto har skapats åt dig.',
    success: 'Köp genomfört framgångsrikt!',
    payFailed: 'Betalningen misslyckades',
    errCreate: 'Ett fel uppstod vid köp'
  },
  en: {
    noItems: 'No items in the order',
    noMethod: 'No payment method selected',
    needCustomer: 'Customer details (email and name) are required for guest checkout',
    mustCreate: 'You must create an account to complete the purchase. Check "Create an account for me" or log in if you already have one.',
    notFound: 'One or more courses were not found',
    alreadyOwn: 'You already own the following courses: ',
    successNew: 'Purchase completed successfully! An account has been created for you.',
    success: 'Purchase completed successfully!',
    payFailed: 'Payment failed',
    errCreate: 'An error occurred while processing the purchase'
  },
  es: {
    noItems: 'No hay productos en el pedido',
    noMethod: 'No se seleccionó método de pago',
    needCustomer: 'Se requieren datos del cliente (correo y nombre) para la compra como invitado',
    mustCreate: 'Debes crear una cuenta para completar la compra. Marca "Crear una cuenta para mí" o inicia sesión si ya tienes una.',
    notFound: 'No se encontró uno o más cursos',
    alreadyOwn: 'Ya posees los siguientes cursos: ',
    successNew: '¡Compra completada con éxito! Se ha creado una cuenta para ti.',
    success: '¡Compra completada con éxito!',
    payFailed: 'El pago falló',
    errCreate: 'Ocurrió un error al procesar la compra'
  },
  de: {
    noItems: 'Keine Produkte in der Bestellung',
    noMethod: 'Keine Zahlungsmethode ausgewählt',
    needCustomer: 'Kundendaten (E-Mail und Name) sind für den Gastkauf erforderlich',
    mustCreate: 'Du musst ein Konto erstellen, um den Kauf abzuschließen. Wähle "Konto für mich erstellen" oder melde dich an, wenn du bereits eines hast.',
    notFound: 'Ein oder mehrere Kurse wurden nicht gefunden',
    alreadyOwn: 'Du besitzt bereits folgende Kurse: ',
    successNew: 'Kauf erfolgreich abgeschlossen! Es wurde ein Konto für dich erstellt.',
    success: 'Kauf erfolgreich abgeschlossen!',
    payFailed: 'Zahlung fehlgeschlagen',
    errCreate: 'Beim Kauf ist ein Fehler aufgetreten'
  },
  fr: {
    noItems: 'Aucun article dans la commande',
    noMethod: 'Aucun mode de paiement sélectionné',
    needCustomer: 'Les informations client (e‑mail et nom) sont requises pour le paiement invité',
    mustCreate: 'Vous devez créer un compte pour finaliser l’achat. Cochez « Créer un compte pour moi » ou connectez‑vous si vous en avez déjà un.',
    notFound: 'Un ou plusieurs cours sont introuvables',
    alreadyOwn: 'Vous possédez déjà les cours suivants : ',
    successNew: 'Achat effectué avec succès ! Un compte a été créé pour vous.',
    success: 'Achat effectué avec succès !',
    payFailed: 'Le paiement a échoué',
    errCreate: "Une erreur s'est produite lors de l'achat"
  }
};
function getLang(request: Request): Lang {
  const hdr = (request as any).headers?.get?.('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (m ? m[1] : '').toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val) ? (val as Lang) : 'sv';
}

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
    const lang = getLang(request);
    const body = await request.json();
    const { items, paymentMethod, customerInfo, createAccount = false } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: M[lang].noItems },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: M[lang].noMethod },
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
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
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
          { error: M[lang].needCustomer },
          { status: 400 }
        );
      }

      // Normalize email to lowercase
      const normalizedEmail = customerInfo.email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        // User already exists - use existing user regardless of createAccount setting
        user = existingUser;
        console.log(`Using existing user: ${existingUser.email}`);
      } else {
        // User doesn't exist - create new user if createAccount is true
        if (createAccount) {
          generatedPassword = generateRandomPassword();
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);
          
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: customerInfo.name,
              password: hashedPassword,
              role: 'customer',
              isActive: true
            }
          });
          isNewUser = true;
          console.log(`Created new user: ${user.email}`);
        } else {
          // User doesn't exist and doesn't want to create account
          return NextResponse.json(
            { error: M[lang].mustCreate },
            { status: 400 }
          );
        }
      }
    }

    // Validate and fetch courses
    const courseIds = items
      .filter(item => item.type === 'course')
      .map(item => item.name);

    const courses = await prisma.courseProduct.findMany({
      where: { name: { in: courseIds } },
      select: {
        id: true,
        name: true,
        price: true,
        basePrice: true,
        salePrice: true,
        saleStartsAt: true,
        saleEndsAt: true
      }
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { error: M[lang].notFound },
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
        { error: `${M[lang].alreadyOwn}${ownedCourses.join(', ')}` },
        { status: 400 }
      );
    }

    // Helper to get effective price (salePrice when active)
    const now = new Date();
    const getEffectivePrice = (c: any): number => {
      let price = typeof c.basePrice === 'number' ? c.basePrice : (c.price || 0);
      const hasSale = typeof c.salePrice === 'number';
      const saleActive = hasSale && (!c.saleStartsAt || now >= c.saleStartsAt) && (!c.saleEndsAt || now <= c.saleEndsAt);
      if (saleActive) price = c.salePrice as number;
      return price;
    };

    // Calculate total amount using effective price
    const totalAmount = items.reduce((sum, item) => {
      const course = courses.find(c => c.name === item.name);
      return sum + (course ? getEffectivePrice(course) * item.quantity : 0);
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
                const unitPrice = course ? getEffectivePrice(course) : 0;
                return {
              courseId: course?.id,
              name: item.name,
                  price: unitPrice,
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
      const purchases = [] as any[];
      for (const item of items) {
        if (item.type === 'course') {
          const course = courses.find(c => c.name === item.name);
          if (course) {
            const unitPrice = getEffectivePrice(course);
            const purchase = await prisma.purchase.create({
              data: {
                userId: user.id,
                courseId: course.id,
                amount: unitPrice * item.quantity,
                status: 'completed',
                orderId: order.id,
                accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              } as any,
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
            price: getEffectivePrice(c)
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
          process.env.JWT_SECRET!,
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
          ? M[lang].successNew
          : M[lang].success
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
        error: paymentResult.error || M[lang].payFailed,
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
      { error: M[getLang(request)].errCreate },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 