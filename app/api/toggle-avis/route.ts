import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

// Active/desactive l'envoi automatique (par n8n) du message de remerciement
// + demande d'avis a la fin du sejour, pour un logement donne. Pas de
// verification d'abonnement ici (contrairement a /api/toggle-property) :
// ce n'est pas une fonctionnalite facturee separement.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, demande_avis } = await request.json();

  if (!property_id || typeof demande_avis !== "boolean") {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("id, host_id")
    .eq("id", property_id)
    .single();

  if (fetchError || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ demande_avis })
    .eq("id", property_id);

  if (updateError) {
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, demande_avis });
}
