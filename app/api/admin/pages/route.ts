import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdminAuth } from "@/app/lib/admin-auth";

const prisma = new PrismaClient();
const KNOWN_PAGES = [
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

function safeParseJson(value: unknown): any | null {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value;
  return null;
}

function humanize(pageId: string): string {
  return pageId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function emptyKnownPages() {
  return KNOWN_PAGES.map((page) => ({
    ...page,
    content: null,
    updatedAt: null,
    hasCustomContent: false,
  }));
}

// GET - List all editable pages
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(req);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all page settings (keys starting with 'page_')
    // Fallback to known pages only if DB query fails.
    let pageSettings: Array<{
      key: string;
      value: unknown;
      updatedAt: Date | null;
    }> = [];

    try {
      pageSettings = await prisma.siteSettings.findMany({
        where: {
          key: {
            startsWith: "page_",
          },
        },

        select: {
          key: true,
          value: true,
          updatedAt: true,
        },
      });
    } catch (dbError) {
      console.error("Failed to query page settings:", dbError);
      return NextResponse.json(emptyKnownPages());
    }

    // Parse JSON values safely so one bad row does not break the whole admin view
    const pages = pageSettings
      .map((setting) => {
        const parsed = safeParseJson(setting.value);
        if (parsed === null) {
          console.warn(
            `⚠️ Skipping invalid page JSON for key "${setting.key}"`,
          );
          return null;
        }
        return {
          pageId: setting.key.replace("page_", ""),
          content: parsed,
          updatedAt: setting.updatedAt,
        };
      })
      .filter(Boolean) as Array<{
      pageId: string;
      content: any | null;
      updatedAt: Date | null;
    }>;

    const knownPageIds = new Set(KNOWN_PAGES.map((p) => p.pageId));

    // Unknown pages (created via page_<id> but not yet in known list)
    const unknownPages = pages

      }));

    // Merge saved content with known + dynamic pages
    const result = [...KNOWN_PAGES, ...unknownPages].map((page) => {
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
