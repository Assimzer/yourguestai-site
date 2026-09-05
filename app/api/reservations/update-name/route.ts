import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, cle_unique, nom_voyageur } = await request.json();

  if (!property_id || !cle_unique || typeof nom_voyageur !== "string") {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  // Vérifie que ce logement appartient bien à l'hôte connecté avant de
  // répercuter quoi que ce soit dans Airtable via n8n.
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  try {
    const res = await fetch(process.env.N8N_UPDATE_RESERVATION_NAME_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: property.cle_unique_airtable,
        cle_unique,
        nom_voyageur: nom_voyageur.trim(),
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Impossible de contacter n8n" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
