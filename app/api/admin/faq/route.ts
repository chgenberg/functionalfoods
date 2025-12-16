import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

const FAQ_KEY = 'faq_content';

// Default FAQs (used as fallback)
const DEFAULT_FAQS = [
  {
    id: '1',
    question: 'Vem står bakom sajten?',
    answer: 'Functional Foods drivs av kostrådgivaren och kokboksförfattaren Ulrika Davidsson och hennes team på Ulrikas Kickstart AB.'
  },
  {
    id: '2',
    question: 'Hur skiljer sig era program från vanliga kost- och receptsajter?',
    answer: 'Ulrika har kreerat och lagat upp alla functional foods‑recept som ingår i kurserna, gjort måltidsplaner och inköpslistor – allt är planerat och förberett för dig. Coachningen sker av Ulrika och hennes team.'
  },
  {
    id: '3',
    question: 'Vilka kurser erbjuder ni?',
    answer: 'Functional Basics – grunderna i functional foods och hållbara matvanor. Functional Gut Health/Flow – fokus på tarmflora, antiinflammatorisk kost och bättre matsmältning. Functional insulin balance/Energy – stabilisera blodsockret och få jämn energi.'
  },
  {
    id: '4',
    question: 'Ingår personlig coaching?',
    answer: 'Ja, Ulrika och hennes team coachar i kurserna söndag–fredag. Live‑ och Q&A‑träffar sker regelbundet.'
  },
  {
    id: '5',
    question: 'Vilka betalningssätt accepterar ni?',
    answer: 'Vi använder Stripe samt SVEA som betalningslösning. Du kan betala med kort, Swish, faktura samt delbetalning.'
  },
  {
    id: '6',
    question: 'Har ni öppet köp?',
    answer: 'Vi följer distanshandelslagen. Som privatkund har du 14 dagars ångerrätt från att du fått bokningsbekräftelse/leverans. Ångerrätten upphör efter 14 dagar eller när du tagit del av kursen om det sker tidigare. Kontakta oss på info@functionalfoods.se inom 14 dagar eller innan du påbörjar kursen.'
  },
  {
    id: '7',
    question: 'Kan jag köpa kursen som present?',
    answer: 'Ja. Välj "Ge bort som gåva" i kassan så får du ett presentkort via e‑post.'
  },
  {
    id: '8',
    question: 'Hur kontaktar jag er?',
    answer: 'info@ulrikadavidsson.se'
  },
  {
    id: '9',
    question: 'Kan jag använda mitt friskvårdsbidrag?',
    answer: 'Ja. Spara kvittot från "Mitt konto" och lämna till din arbetsgivare, eller köp via din friskvårdsleverantör (Epassi, Benefix, Wellnet, Benefits).'
  }
];

// GET - Get all FAQs
export async function GET(req: NextRequest) {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: FAQ_KEY }
    });

    if (!setting) {
      return NextResponse.json({ faqs: DEFAULT_FAQS });
    }

    return NextResponse.json({ faqs: JSON.parse(setting.value) });
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    return NextResponse.json({ faqs: DEFAULT_FAQS });
  }
}

// PUT - Update all FAQs
export async function PUT(req: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { faqs } = await req.json();

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: 'FAQs must be an array' }, { status: 400 });
    }

    // Validate FAQ structure
    for (const faq of faqs) {
      if (!faq.question || !faq.answer) {
        return NextResponse.json({ error: 'Each FAQ must have question and answer' }, { status: 400 });
      }
    }

    // Ensure each FAQ has an ID
    const faqsWithIds = faqs.map((faq, index) => ({
      id: faq.id || `faq-${Date.now()}-${index}`,
      question: faq.question,
      answer: faq.answer
    }));

    await prisma.siteSettings.upsert({
      where: { key: FAQ_KEY },
      update: {
        value: JSON.stringify(faqsWithIds),
        type: 'json'
      },
      create: {
        key: FAQ_KEY,
        value: JSON.stringify(faqsWithIds),
        type: 'json',
        description: 'FAQ content for the Q&A page'
      }
    });

    return NextResponse.json({ success: true, faqs: faqsWithIds });
  } catch (error) {
    console.error('Failed to update FAQs:', error);
    return NextResponse.json({ error: 'Failed to update FAQs' }, { status: 500 });
  }
}

// DELETE - Reset to defaults
export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.siteSettings.delete({
      where: { key: FAQ_KEY }
    }).catch(() => {
      // Ignore if doesn't exist
    });

    return NextResponse.json({ success: true, message: 'FAQs reset to defaults' });
  } catch (error) {
    console.error('Failed to reset FAQs:', error);
    return NextResponse.json({ error: 'Failed to reset FAQs' }, { status: 500 });
  }
}

