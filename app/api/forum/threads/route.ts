import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import { resolveModel } from '@/app/lib/ai';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Create OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Function to check if content is related to functional foods and health
async function isRelevantForAI(title: string, content: string): Promise<boolean> {
  if (!openai) return false;
  
  const prompt = `
Analysera följande forum-tråd och avgör om den handlar om functional foods, holistisk hälsa, näringsämnen, kosttillskott, eller relaterade hälsoteman som Ulrika Davidsson skulle kunna svara på som expert.

Titel: "${title}"
Innehåll: "${content}"

Svara endast med "JA" om tråden handlar om:
- Functional foods
- Näringsämnen och vitaminer
- Kosttillskott
- Holistisk hälsa
- Matsmältning
- Energi och trötthet
- Sömn och återhämtning
- Stress och mental hälsa
- Inflammationsreducering
- Tarmhälsa
- Hormonal balans
- Detox och rening
- Immunförsvar
- Antioxidanter
- Specifika livsmedel och deras hälsoeffekter

Svara med "NEJ" om tråden handlar om:
- Medicinska diagnoser
- Specifika sjukdomar
- Mediciner och behandlingar
- Kirurgi
- Akuta hälsoproblem
- Personliga problem utan hälsoaspekt
- Tekniska frågor
- Kursfrågor eller administrativt

Svara endast med JA eller NEJ.
`;

  try {
    const response = await openai.chat.completions.create({
      model: resolveModel('gpt-5-mini'),
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
      temperature: 0.1,
    });

    const result = response.choices[0]?.message?.content?.trim().toLowerCase();
    return result === 'ja';
  } catch (error) {
    console.error('Error checking AI relevance:', error);
    return false;
  }
}

// Function to generate AI response
async function generateAIResponse(title: string, content: string): Promise<string | null> {
  if (!openai) return null;

  const prompt = `
Du är Ulrika AI:sson, en AI-assistent baserad på Ulrika Davidssons expertis inom functional foods och holistisk hälsa. Du svarar på forum-trådar med värdefulla, personaliserade råd.

VIKTIGT: 
- Börja alltid ditt svar med "🤖 Ulrika AI:sson svarar:"
- Gör det tydligt att du är en AI-assistent
- Ge aldrig medicinska diagnoser eller behandlingsråd
- Hänvisa till läkare vid allvarliga hälsoproblem
- Fokusera på functional foods, livsstil och holistisk hälsa
- Var varm, stödjande och professionell
- Använd svensk terminologi
- Ge konkreta, praktiska råd

Trådens titel: "${title}"
Trådens innehåll: "${content}"

Svara med ett hjälpsamt, personligt svar som Ulrika AI:sson. Inkludera:
1. Erkännande av personens situation
2. 2-3 konkreta functional food-rekommendationer
3. Praktiska livsstilsråd
4. Uppmuntran att fortsätta diskussionen
5. Påminnelse om att konsultera läkare vid behov

Håll svaret mellan 200-400 ord.
`;

  try {
    const response = await openai.chat.completions.create({
      model: resolveModel('gpt-5-mini'),
      messages: [
        {
          role: "system",
          content: "Du är Ulrika AI:sson, en AI-assistent baserad på Ulrika Davidssons expertis inom functional foods och holistisk hälsa. Du ger alltid hjälpsamma, säkra råd och gör det tydligt att du är en AI."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return null;
  }
}

// Function to create AI bot reply
async function createAIReply(threadId: string, content: string) {
  try {
    // Create or get AI bot user
    let aiUser = await prisma.user.findFirst({
      where: { email: 'ai@ulrikafunctionalfoods.com' }
    });

    if (!aiUser) {
      aiUser = await prisma.user.create({
        data: {
          email: 'ai@ulrikafunctionalfoods.com',
          name: 'Ulrika AI:sson',
          password: 'ai-bot-no-login', // This account cannot be used for login
        }
      });
    }

    // Create the AI reply
    await prisma.forumReply.create({
      data: {
        content,
        authorId: aiUser.id,
        threadId
      }
    });

    console.log(`AI bot replied to thread ${threadId}`);
  } catch (error) {
    console.error('Error creating AI reply:', error);
  }
}

// GET /api/forum/threads - Get all threads with optional category filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') {
      orderBy = { views: 'desc' };
    } else if (sort === 'replies') {
      orderBy = { replies: { _count: 'desc' } };
    }

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const threads = await prisma.forumThread.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        },
        _count: {
          select: { replies: true, likes: true }
        },
        replies: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

// POST /api/forum/threads - Create new thread
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const { title, content, categoryId } = await request.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const thread = await prisma.forumThread.create({
      data: {
        title,
        content,
        authorId: decoded.userId,
        categoryId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        },
        _count: {
          select: { replies: true, likes: true }
        }
      }
    });

    // Check if AI should respond to this thread
    if (openai) {
      // Run AI check in background (don't wait for it)
      (async () => {
        try {
          const isRelevant = await isRelevantForAI(title, content);
          
          if (isRelevant) {
            // Wait a bit to seem more natural (2-5 minutes)
            const delay = Math.floor(Math.random() * 180000) + 120000; // 2-5 minutes
            
            setTimeout(async () => {
              const aiResponse = await generateAIResponse(title, content);
              if (aiResponse) {
                await createAIReply(thread.id, aiResponse);
              }
            }, delay);
          }
        } catch (error) {
          console.error('Error in AI background processing:', error);
        }
      })();
    }

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
} 