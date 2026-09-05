import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";
import { syncLogementQuantity } from "@/lib/stripe/syncLogementQuantity";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id } = await request.json();

  if (!property_id) {
    return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });
  }

  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (fetchError || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("properties")
    .delete()
    .eq("id", property_id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Échec de la suppression" },
      { status: 500 }
    );
  }

  try {
    await fetch(process.env.N8N_DELETE_PROPERTY_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: property.cle_unique_airtable,
      }),
    });
  } catch {
    // Suppression déjà effective côté Supabase ; échec de notification n8n à surveiller.
  }

  // Sync Stripe : un logement en moins, on répercute la quantity.
  try {
    await syncLogementQuantity(property.host_id);
  } catch {
    // Ne bloque pas la réponse à l'hôte si Stripe échoue ; à surveiller en prod.
  }

  return NextResponse.json({ ok: true });
}