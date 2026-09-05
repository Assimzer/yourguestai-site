import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";
import { getMessagesData } from "@/lib/messages/getMessagesData";

// Voir app/api/reservations/route.ts pour le detail de ces deux reglages :
// sans eux, la liste des logements peut rester figee sur une ancienne version.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const result = await getMessagesData(supabase, user.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    {
      ok: true,
      messages: result.messages,
      by_logement: result.by_logement,
      daily: result.daily,
      previous_period_message_count: result.previous_period_message_count,
      recent_escalades: result.recent_escalades,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
