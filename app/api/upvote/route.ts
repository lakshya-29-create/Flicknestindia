import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// ============================================================================
// POST /api/upvote — increment upvotes for a movie via RPC
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movie_id } = body;

    if (!movie_id || typeof movie_id !== "string") {
      return NextResponse.json(
        { error: "movie_id is required and must be a string" },
        { status: 422 }
      );
    }

    const { error } = await supabaseAdmin.rpc("increment_upvote", {
      movie_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data, error: fetchError } = await supabaseAdmin
      .from("movies")
      .select("upvotes")
      .eq("id", movie_id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      upvotes: (data as { upvotes: number }).upvotes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
