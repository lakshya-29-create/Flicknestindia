import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// ============================================================================
// GET /api/og?title=...&genre=...&year=...&upvotes=...&submitted_by=...
// Generates a branded Flicknest social sharing card
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Untitled Film";
    const genre = searchParams.get("genre") || "Film";
    const year = searchParams.get("year") || "";
    const upvotes = searchParams.get("upvotes") || "0";
    const submittedBy = searchParams.get("submitted_by") || "";

    // Try to use @vercel/og — if not installed, return a static SVG card
    let ImageResponse: any;
    try {
      const og = await import("@vercel/og");
      ImageResponse = og.ImageResponse;
    } catch {
      // Fallback: return an SVG card
      return new NextResponse(
        generateFallbackSvg({ title, genre, year, upvotes, submittedBy }),
        {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        }
      );
    }

    const html = `
      <div tw="flex w-full h-full bg-[#070707] items-center justify-center relative overflow-hidden">
        <!-- Gradient background -->
        <div tw="absolute inset-0 bg-gradient-to-br from-[#8B0000] via-[#0a0a0a] to-[#FFD700]" />
        <div tw="absolute inset-0" style="background: radial-gradient(circle at 30% 40%, rgba(255,215,0,0.12) 0%, transparent 70%)" />
        <div tw="absolute inset-0" style="background: radial-gradient(circle at 70% 60%, rgba(139,0,0,0.15) 0%, transparent 60%)" />

        <!-- Film grain overlay pattern -->
        <div tw="absolute inset-0 opacity-[0.04]"
          style="background-image: repeating-conic-gradient(#fff 0.000001%, transparent 0.0002%, transparent 0.0004%)" />

        <!-- Card border -->
        <div tw="flex mx-12 my-8 flex-1 rounded-3xl border border-[#FFD700]/20 overflow-hidden relative">
          <!-- Left accent -->
          <div tw="w-2 bg-gradient-to-b from-[#8B0000] via-[#FFD700] to-[#FF6B00]" />

          <!-- Content -->
          <div tw="flex flex-col justify-center px-16 py-12 flex-1">
            <!-- Badge -->
            <div tw="flex items-center gap-3 mb-6">
              <span tw="px-3 py-1 text-sm text-[#FFD700] bg-[#FFD700]/10 rounded-full border border-[#FFD700]/30 font-bold uppercase tracking-wider">
                ${genre}
              </span>
              ${year ? `<span tw="text-sm text-white/40 font-medium">${year}</span>` : ""}
            </div>

            <!-- Title -->
            <h1 tw="text-7xl text-white font-bold leading-none tracking-tight m-0"
                style="font-family: 'Bebas Neue', sans-serif;">
              ${escapeHtml(title)}
            </h1>

            <!-- Divider -->
            <div tw="w-20 h-[2px] bg-gradient-to-r from-[#FFD700] to-[#FF6B00] my-6" />

            <!-- Bottom row -->
            <div tw="flex items-center justify-between">
              <div tw="flex items-center gap-4">
                ${submittedBy ? `<span tw="text-white/40 text-base">Curated by <span tw="text-white/60">${escapeHtml(submittedBy)}</span></span>` : ""}
              </div>
              <div tw="flex items-center gap-2">
                <span tw="text-[#FFD700] text-2xl">▲</span>
                <span tw="text-[#FFD700] text-3xl font-bold">${upvotes}</span>
              </div>
            </div>
          </div>

          <!-- Right decorative element -->
          <div tw="absolute right-0 top-0 bottom-0 w-32 opacity-[0.03]"
            style="background: linear-gradient(135deg, transparent 0%, #FFD700 50%, #8B0000 100%)" />
        </div>

        <!-- Brand -->
        <div tw="absolute bottom-8 right-12 flex items-center gap-2">
          <span tw="text-2xl text-transparent bg-clip-text font-bold"
                style="background-image: linear-gradient(135deg, #8B0000, #FFD700, #FF6B00); font-family: 'Bebas Neue', sans-serif;">
            Flicknest
          </span>
        </div>
      </div>
    `;

    const imageResponse = new ImageResponse(html, {
      width: 1200,
      height: 630,
      emoji: "twemoji",
    });

    return imageResponse;
  } catch {
    return new NextResponse("Failed to generate image", { status: 500 });
  }
}

// ============================================================================
// Helpers
// ============================================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const escapeHtml = escapeXml;

function generateFallbackSvg({
  title,
  genre,
  year,
  upvotes,
  submittedBy,
}: {
  title: string;
  genre: string;
  year: string;
  upvotes: string;
  submittedBy: string;
}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B0000" />
        <stop offset="50%" stop-color="#0a0a0a" />
        <stop offset="100%" stop-color="#FFD700" />
      </linearGradient>
      <linearGradient id="divider" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFD700" />
        <stop offset="100%" stop-color="#FF6B00" />
      </linearGradient>
      <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#8B0000" />
        <stop offset="50%" stop-color="#FFD700" />
        <stop offset="100%" stop-color="#FF6B00" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <rect x="48" y="32" width="1104" height="566" rx="24" fill="none" stroke="rgba(255,215,0,0.2)" stroke-width="1" />
    <rect x="48" y="32" width="8" height="566" rx="4" fill="url(#divider)" />
    <rect x="96" y="80" rx="12" width="${genre.length * 14 + 48}" height="36" fill="rgba(255,215,0,0.1)" stroke="rgba(255,215,0,0.3)" stroke-width="1" />
    <text x="112" y="104" fill="#FFD700" font-size="16" font-family="sans-serif" font-weight="bold">${escapeXml(genre)}</text>
    ${year ? `<text x="${112 + genre.length * 14 + 60}" y="104" fill="rgba(255,255,255,0.4)" font-size="16" font-family="sans-serif">${year}</text>` : ""}
    <text x="96" y="200" fill="white" font-size="72" font-family="sans-serif" font-weight="bold">${escapeXml(title)}</text>
    <rect x="96" y="250" width="80" height="3" rx="1.5" fill="url(#divider)" />
    ${submittedBy ? `<text x="96" y="400" fill="rgba(255,255,255,0.4)" font-size="18" font-family="sans-serif">Curated by <tspan fill="rgba(255,255,255,0.6)">${escapeXml(submittedBy)}</tspan></text>` : ""}
    <text x="1024" y="400" fill="#FFD700" font-size="36" font-family="sans-serif" font-weight="bold">▲ ${upvotes}</text>
    <text x="960" y="580" fill="url(#text)" font-size="32" font-family="sans-serif" font-weight="bold">Flicknest</text>
  </svg>`;
}
