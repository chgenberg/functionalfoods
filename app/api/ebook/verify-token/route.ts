import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/database";

export const dynamic = "force-dynamic";

/**
 * POST /api/ebook/verify-token
 * Verify an e-book download token and return the download URL if valid
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token krävs" },
        { status: 400 },
      );
    }

    // Find the download token
    const downloadToken = await prisma.ebookDownload.findUnique({
      where: { token },
    });

    if (!downloadToken) {
      return NextResponse.json(
        { valid: false, error: "Ogiltig nedladdningskod" },
        { status: 404 },
      );
    }

    // Check if token has expired
    if (new Date() > downloadToken.expiresAt) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Nedladdningskoden har gått ut. Kontakta oss på info@functionalfoods.se för hjälp.",
        },
        { status: 410 },
      );
    }

    // Check if max downloads reached
    if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Max antal nedladdningar uppnått. Kontakta oss på info@functionalfoods.se för hjälp.",
        },
        { status: 403 },
      );
    }

    // Get the download URL based on ebookId
    let downloadPath = "";
    if (downloadToken.ebookId === "brodboken-2026") {
      downloadPath = "/baka-glutenfritt-ulrika-davidsson.pdf";
    }

    if (downloadToken.ebookId === "paskbuffe") {
      downloadPath = "/paskbuffe-ulrika-davidsson.pdf";
    }

    if (downloadToken.ebookId === "sota-godsaker") {
      downloadPath = "/sota-godsaker-ulrika-davidsson.pdf";
    }

    if (!downloadPath) {
      return NextResponse.json(
        { valid: false, error: "E-bok kunde inte hittas" },
        { status: 404 },
      );
    }

    // Update download count
    await prisma.ebookDownload.update({
      where: { id: downloadToken.id },
      data: {
        downloadCount: downloadToken.downloadCount + 1,
        lastDownloadAt: new Date(),
      },
    });

    console.log(
      `📥 E-book download: ${downloadToken.ebookName} for ${downloadToken.customerEmail} (download ${downloadToken.downloadCount + 1}/${downloadToken.maxDownloads})`,
    );

    return NextResponse.json({
      valid: true,
      ebookName: downloadToken.ebookName,
      downloadPath,
      downloadsRemaining:
        downloadToken.maxDownloads - downloadToken.downloadCount - 1,
    });
  } catch (error) {
    console.error("Error verifying ebook token:", error);
    return NextResponse.json(
      { valid: false, error: "Ett fel uppstod. Försök igen." },
      { status: 500 },
    );
  }
}
