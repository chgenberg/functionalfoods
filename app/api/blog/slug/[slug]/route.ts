import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SUPPORTED = ['sv','en','es','de','fr'] as const;
type Lang = typeof SUPPORTED[number];
function getLang(req: NextRequest): Lang {
  const hdr = req.headers.get('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (m ? m[1] : '').toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val as Lang) ? (val as Lang) : 'sv';
}
function pick(obj: any, base: string, lang: Lang) {
  if (lang === 'sv') return obj[base];
  const k = `${base}_${lang}`;
  return obj[k] || obj[base];
}

// GET a single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const lang = getLang(request);
    const { slug } = params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { name: true, email: true } } },
    });

    if (!post) return NextResponse.json({ error: "Inlägget hittades inte" }, { status: 404 });

    const localized: any = { ...post };
    localized.title = pick(post, 'title', lang);
    localized.excerpt = pick(post, 'excerpt', lang);
    localized.content = pick(post, 'content', lang);

    return NextResponse.json({ post: localized });
  } catch (error) {
    console.error("Fel vid hämtning av blogginlägg:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// UPDATE a blog post by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { title, content, published } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Titel och innehåll krävs" }, { status: 400 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: {
        title,
        content,
        published: published !== undefined ? published : true,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Fel vid uppdatering av blogginlägg:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 