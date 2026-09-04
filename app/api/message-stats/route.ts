import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Seule porte d'entrée pour le nombre de messages répondus par LÉO sur un
// logement. Remplace l'ancien appel direct navigateur → n8n qui exposait
// l'URL du webhook et le secret dans le bundle client.
export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const property_id = searchParams.get("property_id");
  if (!property_id) {
    return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });
  }

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id, nom, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  try {
    const res = await fetch(process.env.N8N_STATS_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      // On envoie les deux conventions possibles (ancien format propertyId/nom
      // utilisé avant la sécurisation de cet appel, et le nouveau id_logement)
      // tant que le champ exact attendu par ce workflow n8n n'est pas confirmé.
      body: JSON.stringify({
        propertyId: property.nom,
        id_logement: property.cle_unique_airtable,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ count: 0 });
    }

    const data = await res.json();
    return NextResponse.json({ count: data.count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}