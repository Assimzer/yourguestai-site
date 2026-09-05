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

  const { property_id, nom } = await request.json();

  if (!property_id || typeof nom !== "string" || nom.trim().length < 2) {
    return NextResponse.json(
      { error: "Merci de donner un nom de logement (2 caractères min.)" },
      { status: 400 }
    );
  }

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const trimmedNom = nom.trim();

  const { error: updateError } = await supabase
    .from("properties")
    .update({ nom: trimmedNom })
    .eq("id", property_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Échec de la mise à jour" },
      { status: 500 }
    );
  }

  // Repercute le nouveau nom dans Airtable.Logements (champ "Name", utilise
  // pour l'affichage humain) ; id_logement (cle technique) ne change jamais.
  try {
    await fetch(process.env.N8N_UPDATE_PROPERTY_NAME_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: property.cle_unique_airtable,
        nom: trimmedNom,
      }),
    });
  } catch {
    // Le nom Supabase (source de verite cote site) est deja a jour meme si
    // la synchro Airtable echoue ; a surveiller.
  }

  return NextResponse.json({ ok: true, nom: trimmedNom });
}
