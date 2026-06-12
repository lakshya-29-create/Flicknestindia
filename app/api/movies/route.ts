import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { MovieRow } from "@/lib/supabase";

// ============================================================================
// GET /api/movies — list movies with optional filters
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "upvotes";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const allowedSortColumns = ["upvotes", "created_at", "release_year", "title"];
    if (!allowedSortColumns.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sortBy. Allowed: ${allowedSortColumns.join(", ")}` },
        { status: 400 }
      );
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      return NextResponse.json(
        { error: "sortOrder must be 'asc' or 'desc'" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("movies")
      .select("*", { count: "exact" });

    if (genre) query = query.eq("genre", genre);
    if (search) query = query.ilike("title", `%${search}%`);
    if (featured === "true") query = query.eq("is_featured", true);
    else if (featured === "false") query = query.eq("is_featured", false);

    query = query.order(sortBy as any, { ascending: sortOrder === "asc" });

    const end = offset + limit - 1;
    query = query.range(offset, end);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data: data as MovieRow[],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// POST /api/movies — submit a new movie
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["title", "genre", "description", "what_it_means"];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json(
          { error: `${field} is required and must be a non-empty string` },
          { status: 422 }
        );
      }
    }

    if (body.release_year !== undefined && body.release_year !== null) {
      const year = Number(body.release_year);
      if (!Number.isInteger(year) || year < 1888 || year > 2030) {
        return NextResponse.json(
          { error: "release_year must be an integer between 1888 and 2030" },
          { status: 422 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("movies")
      .insert({
        title: body.title.trim(),
        genre: body.genre.trim(),
        description: body.description.trim(),
        what_it_means: body.what_it_means.trim(),
        submitted_by: body.submitted_by?.trim() || "",
        poster_url: body.poster_url?.trim() || "",
        trailer_url: body.trailer_url?.trim() || "",
        release_year: body.release_year ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data as MovieRow }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
