import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { resolveModel } from '@/app/lib/ai';

const prisma = new PrismaClient();

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

// Lista över ämnen för blogginlägg
const blogTopics = [
  'Vad menas egentligen med "functional foods"?',
  'Historien bakom funktionell mat – från 1980-talets Japan till dagens EU-definitioner',
  'Så läser du en hälsopåståenden-etikett utan att bli lurad',
  'Lingon som nordiskt "superbär" – påverkan på blodsocker och tarmflora',
  'Probiotika vs. prebiotika: skillnader, synergieffekter och bästa källor',
  'Adaptogener 101 – vad gör ashwagandha, reishi & co. för stress?',
  'Omega-3 från alger: hållbart alternativ till fiskolja',
  'Kefir, kimchi, kombucha – fermenterade stjärnor för maghälsa',
  'Betaglukaner i havre: därför sänker de kolesterol',
  'Funktionella drycker: boom eller bubbla? Marknadstrender 2025',
  'Gurkmeja & curcumin – antiinflammatoriskt eller bara hype?',
  'Plant-based protein med extra mervärden: ärtas, hampa och lupin',
  'Hur påverkar choklad med högt kakaoinnehåll hjärnan?',
  'Resistenta stärkelser – kalla potatisar som prebiotiskt vapen',
  'Personlig nutrition: DNA-tester möter functional food-recept',
  'Blåbärsantocyaniner och synskärpa – vad säger forskningen?',
  'Regelverket kring Novel Foods i EU – en snabbguide',
  'Är "biohacking-kaffe" med MCT-olja mer än en trend?',
  'Funktionellt snack: frystorkade grönsaker med vitaminboost',
  'Collagenpeptider – hud, leder eller placebo?',
  'Svenska havets superalg: knöltång som jod- och fiberkälla',
  'Fytoöstrogener i linfrön – vän eller fiende?',
  'Träning + nitratrika rödbetor: prestationshöjare på naturlig väg',
  'Hur påverkar surdegsgärning mineralupptaget i fullkornsbröd?',
  'Regenerativt jordbruk och funktionella råvaror – ett hållbarhetsperspektiv',
  'Grönte-katechiner och fettförbränning: evidens eller överdrift?',
  'Mikrobiom-vänliga desserter – recept som både smakar och gör gott',
  'CBD-infuserad mat: juridik, säkerhet och framtidspotential i Sverige',
  'Resveratrol i druvskal: anti-aging i verkligheten?',
  'Functional pet food – när hundens matskål blir high-tech',
  'Blodsocker­vänliga bakverk med baljväxtmjöl',
  'Hög-fenolisk olivolja och hjärt-kärlhälsa',
  'Fytonäringsämnen i rödkål – mer än bara C-vitamin',
  'Smarta förpackningar som förlänger probiotikans hållbarhet',
  'Koll på kolin – det bortglömda näringsämnet i ägg och alg',
  'Kan functional food minska klimatskam? Konsumentpsykologi',
  'Postbiotika – nästa våg efter pro- och prebiotika',
  'Nootropiska ingredienser: lion\'s mane, L-teanin & koffein i samspel',
  'Havtorn: C-vitaminbomb för immunförsvaret',
  'Selenberikade grödor – nödvändigt i Norden?',
  'Funktionell mat för klimakteriet: soja, flax & polyfenoler',
  'Allergensäkra innovationer: garanterat nöt- och glutenfritt men näringsrikt',
  'Hur väl fungerar mikroinkapsling av vitaminer i idrottsnutrition?',
  'Från biprodukt till booster: polyfenoler ur äppelpressrester',
  'Glykemiskt index vs. glykemisk belastning – praktisk guide',
  'Sötpotatisfibers resistenta stärkelse i low-carb-bröd',
  'Matcha vs. sencha – funktionella skillnader i grönt te',
  'Bevaka blodsockret: CGM-trenden möter funktionell kost',
  'Mental hälsa och tarm-hjärna-axeln: mat som påverkar humöret',
  'Framtidens skolmat: näringstät och funktionsfokuserad',
  'Startup-case: svenska bolag som lyckats med funktionella livsmedel'
];

// Funktion för att skapa en slug från titel
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Funktion för att generera meta-beskrivning
function generateMetaDescription(content: string): string {
  // Ta första stycket och begränsa till 160 tecken
  const firstParagraph = content.split('\n\n')[0];
  const cleaned = firstParagraph.replace(/[#*]/g, '').trim();
  
  if (cleaned.length <= 160) {
    return cleaned;
  }
  
  return cleaned.substring(0, 157) + '...';
}

export async function POST(req: NextRequest) {
  try {
    // Kontrollera att det är en giltig förfrågan
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Välj ett slumpmässigt ämne
    const randomTopic = blogTopics[Math.floor(Math.random() * blogTopics.length)];

    // Generera blogginlägg med OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-5-mini'),
      messages: [
        {
          role: "system",
          content: `Du är Ulrika Davidsson, en expert på functional foods och hälsokost. Skriv ett professionellt blogginlägg på svenska om det givna ämnet. Blogginlägget ska vara:

- Cirka 1000 ord
- Informativt och vetenskapligt grundat
- Skrivet i en personlig och engagerande ton
- Strukturerat med underrubriker (använd ## för H2)
- Innehålla praktiska tips och råd
- Referera till aktuell forskning där relevant
- Avsluta med en uppmaning till läsaren

Skriv endast innehållet, ingen titel eller meta-information.`
        },
        {
          role: "user",
          content: `Skriv ett blogginlägg om: ${randomTopic}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Kunde inte generera innehåll');
    }

    // Skapa slug och meta-beskrivning
    const slug = createSlug(randomTopic);
    const excerpt = generateMetaDescription(content);

    // Hämta admin-användare
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      throw new Error('Ingen admin-användare hittades');
    }

    // Kontrollera att slug inte redan finns
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json({ 
        message: 'Blogginlägg med detta ämne finns redan',
        topic: randomTopic 
      });
    }

    // Skapa och publicera blogginlägg
    const blogPost = await prisma.blogPost.create({
      data: {
        title: randomTopic,
        slug: slug,
        content: content,
        excerpt: excerpt,
        coverImage: '/images/blog-placeholder.jpg', // Standardbild
        published: true,
        publishedAt: new Date(),
        authorId: adminUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Blogginlägg skapat och publicerat',
      post: {
        id: blogPost.id,
        title: blogPost.title,
        slug: blogPost.slug,
        publishedAt: blogPost.publishedAt
      }
    });

  } catch (error) {
    console.error('Fel vid generering av blogginlägg:', error);
    return NextResponse.json(
      { error: 'Kunde inte generera blogginlägg' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint för manuell testning
export async function GET() {
  return NextResponse.json({
    message: 'Automatisk blogginlägg-generator',
    availableTopics: blogTopics.length,
    usage: 'POST med Bearer token för att generera inlägg'
  });
} 