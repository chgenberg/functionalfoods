import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

// GET - Get all FAQs (public endpoint)
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

