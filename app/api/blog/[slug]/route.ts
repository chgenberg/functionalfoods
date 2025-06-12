import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET a single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Inlägget hittades inte" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Fel vid hämtning av blogginlägg:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
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
    const { title, content, status } = body;

    if (!title || !content || !status) {
      return NextResponse.json({ error: "Titel, innehåll och status krävs" }, { status: 400 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: {
        title,
        content,
        status,
        // Optional: create a new slug if title changes
        // slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[åä]/g, 'a').replace(/ö/g, 'o')
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Fel vid uppdatering av blogginlägg:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
} 