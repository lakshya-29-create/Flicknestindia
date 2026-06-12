/**
 * Flicknest — Seed Script
 * =========================
 * This script applies the seed data (genres + movies catalog) to your
 * Supabase database. Run it when you want to populate or reset the
 * sample data.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed.ts
 *
 * Or via Supabase CLI (recommended):
 *   supabase db reset
 *
 * The seed file is located at:
 *   supabase/seed.sql
 *
 * Make sure your .env.local has the following variables set:
 *   NEXT_PUBLIC_SUPABASE_URL=your_project_url
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Flicknest — Seed Data                    ║
╚══════════════════════════════════════════════════════════════╝

To apply the seed data, you have two options:

Option 1 — Supabase CLI (recommended for local dev):
  supabase start        # Boot local Supabase stack
  supabase db reset     # Apply migrations + seed data

Option 2 — Direct SQL (production / remote):
  psql $DATABASE_URL -f supabase/seed.sql

The seed includes:
• 10 genres with emoji and color hex codes
• 20+ community-curated movies across all genres
  - Drama, Thriller, Sci-Fi, Romance, Action
  - Horror, Documentary, Animation, Comedy, World Cinema
`);
