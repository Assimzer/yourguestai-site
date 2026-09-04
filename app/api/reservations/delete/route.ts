import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { property_id, cle_unique } = await request.json();

  if (!property_id || !cle_unique) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // Vérifie que ce logement appartient bien à l'hôte connecté avant de
  // répercuter la suppression dans Airtable via n8n.
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  try {
    const res = await fetch(process.env.N8N_DELETE_RESERVATION_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: property.cle_unique_airtable,
        cle_unique,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Échec de la suppression" },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter n8n" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
