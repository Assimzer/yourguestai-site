import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, ical_url } = await request.json();

  if (!property_id || !ical_url || !/^https?:\/\//.test(ical_url)) {
    return NextResponse.json({ error: "Lien iCal invalide" }, { status: 400 });
  }

  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (fetchError || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ ical_url })
    .eq("id", property_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Échec de l'enregistrement" },
      { status: 500 }
    );
  }

  // Déclenche la synchro immédiate côté n8n (le workflow existant :
  // Schedule Trigger → HTTP Request → regex → Airtable Upsert peut aussi
  // être appelé à la demande via ce même webhook, en plus de son
  // déclenchement planifié).
  try {
    await fetch(process.env.N8N_ICAL_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: property.cle_unique_airtable,
        ical_url,
      }),
    });
  } catch {
    // idem toggle-property : Supabase reste la source de vérité même si
    // la notification n8n échoue ponctuellement.
  }

  return NextResponse.json({ ok: true });
}
