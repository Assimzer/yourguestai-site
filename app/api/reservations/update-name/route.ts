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

  // Vérifie que ce logement appartient bien à l'hôte connecté.
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update({ nom_voyageur: nom_voyageur.trim() })
    .eq("logement_id", property_id)
    .eq("cle_unique", cle_unique);

  if (updateError) {
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
