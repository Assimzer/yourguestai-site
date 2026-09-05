import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";
import { getReservationsData } from "@/lib/reservations/getReservationsData";

// Empêche Next.js de mettre en cache les appels fetch internes de cette route
// (Supabase et n8n) — sans ça, la liste des logements peut rester figée sur
// une ancienne version, causant des correspondances property_id incohérentes.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Flux : navigateur → cette route (vérifie session + ownership) →
//        webhook n8n sécurisé (interroge Airtable.Reservations) →
//        réponse enrichie avec le property_id Supabase de chaque logement.
export async function GET() {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const result = await getReservationsData(supabase, user.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    { ok: true, reservations: result.reservations },
    { headers: { "Cache-Control": "no-store" } }
  );
}
