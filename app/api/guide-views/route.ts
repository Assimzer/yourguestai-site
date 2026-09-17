import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Agrege les ouvertures du livret public par logement. La RLS de
// guide_views ne renvoie deja que les vues des logements de cet hote
// (policy "Host reads own guide views"), donc pas de filtre manuel a
// refaire ici.
export async function GET() {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("guide_views")
    .select("property_id, viewed_at");

  if (error) {
    return NextResponse.json({ error: "Impossible de charger les statistiques" }, { status: 500 });
  }

  const byProperty = new Map<string, { view_count: number; last_viewed_at: string }>();
  for (const row of data ?? []) {
    const existing = byProperty.get(row.property_id);
    if (!existing) {
      byProperty.set(row.property_id, { view_count: 1, last_viewed_at: row.viewed_at });
    } else {
      existing.view_count += 1;
      if (row.viewed_at > existing.last_viewed_at) existing.last_viewed_at = row.viewed_at;
    }
  }

  const views = Array.from(byProperty.entries()).map(([property_id, stats]) => ({
    property_id,
    ...stats,
  }));

  return NextResponse.json({ ok: true, views }, { headers: { "Cache-Control": "no-store" } });
}
