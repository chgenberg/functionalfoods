import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdminAuth } from "@/app/lib/admin-auth";

const prisma = new PrismaClient();

// GET - List all editable pages
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(req);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all page settings (keys starting with 'page_')
    const pageSettings = await prisma.siteSettings.findMany({
      where: {
        key: {
          startsWith: "page_",
        },
      },
    });

    // Parse JSON values
    const pages = pageSettings.map((setting) => ({
      pageId: setting.key.replace("page_", ""),
      content: JSON.parse(setting.value),
      updatedAt: setting.updatedAt,
    }));

    // Define known pages with defaults
    const knownPages = [
      {
        pageId: "brodboken",
        name: "Brödboken E-bok",
        description: "E-boken som säljs på /brodboken",
        path: "/brodboken",
      },
      {
        pageId: "paskbuffe",
        name: "Påskbuffé E-bok",
        description: "E-boken som säljs på /e-bocker/paskbuffe",
        path: "/e-bocker/paskbuffe",
      },
      {
        pageId: "boken",
        name: "Functional Foods Boken",
        description: "Den fysiska boken på /boken",
        path: "/boken",
      },
      {
        pageId: "functional-basics",
        name: "Functional Basics Kurs",
        description: "Grundkursen på /utbildning/functional-basics",
        path: "/utbildning/functional-basics",
      },
      {
        pageId: "functional-flow",
        name: "Functional Flow Kurs",
        description: "Flow-kursen på /utbildning/functional-flow",
        path: "/utbildning/functional-flow",
      },
      {
        pageId: "functional-energy",
        name: "Functional Energy Kurs",
        description: "Energi-kursen på /utbildning/functional-energy",
        path: "/utbildning/functional-energy",
      },
      {
        pageId: "hormonell-balans",
        name: "Hormonell Balans Kurs",
        description: "Hormonkursen på /utbildning/hormonell-balans",
        path: "/utbildning/hormonell-balans",
      },
    ];

    // Merge saved content with available pages
    const result = availablePages.map((page) => {
      const saved = pages.find((p) => p.pageId === page.pageId);
      return {
        ...page,
        content: saved?.content || null,
        updatedAt: saved?.updatedAt || null,
        hasCustomContent: !!saved,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  }
}
