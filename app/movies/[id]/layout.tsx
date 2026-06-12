import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { MovieRow } from "@/lib/supabase";

// ============================================================================
// generateMetadata — dynamic OG tags for social sharing
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const { data } = await supabaseAdmin
      .from("movies")
      .select("*")
      .eq("id", params.id)
      .single();

    const movie = data as MovieRow | null;

    if (!movie) {
      return {
        title: "Film Not Found — Flicknest",
        description: "This film doesn't exist in our collection.",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://flicknest.vercel.app");
const ogUrl = new URL("/api/og", siteUrl);
    ogUrl.searchParams.set("title", movie.title);
    ogUrl.searchParams.set("genre", movie.genre);
    if (movie.release_year) ogUrl.searchParams.set("year", String(movie.release_year));
    ogUrl.searchParams.set("upvotes", String(movie.upvotes));
    if (movie.submitted_by) ogUrl.searchParams.set("submitted_by", movie.submitted_by);

    return {
      title: `${movie.title} — Flicknest`,
      description:
        movie.what_it_means ||
        movie.description ||
        "Explore this film on Flicknest — where every film has a story worth telling.",
      openGraph: {
        title: `${movie.title} — A Flicknest Film`,
        description:
          movie.what_it_means?.slice(0, 160) ||
          movie.description?.slice(0, 160) ||
          "Discover the deeper meaning behind this film.",
        type: "article",
        siteName: "Flicknest",
        images: [
          {
            url: ogUrl.toString(),
            width: 1200,
            height: 630,
            alt: `${movie.title} — Flicknest`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${movie.title} — Flicknest`,
        description:
          movie.what_it_means?.slice(0, 160) || movie.description?.slice(0, 160) || "",
        images: [ogUrl.toString()],
      },
    };
  } catch {
    return {
      title: "Flicknest — Cinema Redefined",
      description: "A cinematic film discovery platform.",
    };
  }
}

// ============================================================================
// Layout — wraps the client page component
// ============================================================================

export default function MovieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
