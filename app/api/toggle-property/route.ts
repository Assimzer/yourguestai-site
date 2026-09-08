import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";
import { syncLogementQuantity } from "@/lib/stripe/syncLogementQuantity";
import { notifyN8nToggle } from "@/lib/n8n/notifyToggle";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, actif } = await request.json();

  if (!property_id || typeof actif !== "boolean") {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (fetchError || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  // Bloque uniquement l'ACTIVATION si le host n'a pas d'abonnement actif
  // ou en essai — la désactivation reste toujours autorisée, sinon un host
  // dont l'abonnement expire ne pourrait plus rien couper lui-même.
  if (actif) {
    const { data: host } = await supabase
      .from("hosts")
      .select("statut_abonnement, stripe_customer_id")
      .eq("id", user.id)
      .single();

    const hasAccess =
      Boolean(host?.stripe_customer_id) &&
      (host?.statut_abonnement === "actif" || host?.statut_abonnement === "essai");

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Un abonnement actif est requis pour activer un logement" },
        { status: 402 }
      );
    }
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ actif })
    .eq("id", property_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Échec de la mise à jour" },
      { status: 500 }
    );
  }

  try {
    await notifyN8nToggle(property.cle_unique_airtable, actif);
  } catch {
    // Statut déjà à jour côté Supabase ; échec de notification n8n à surveiller.
  }

  try {
    await syncLogementQuantity(property.host_id);
  } catch {
    // Ne bloque pas la réponse à l'hôte si Stripe échoue ; à surveiller en prod.
  }

  return NextResponse.json({ ok: true, actif });
}