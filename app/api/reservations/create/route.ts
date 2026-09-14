import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, nom_voyageur, telephone_voyageur, date_debut, date_fin } =
    await request.json();

  if (!property_id || !date_debut || !date_fin) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
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

  const { error: insertError } = await supabase.from("reservations").insert({
    logement_id: property_id,
    nom_voyageur: nom_voyageur || null,
    telephone_voyageur: telephone_voyageur || null,
    date_debut,
    date_fin,
    cle_unique: randomUUID(),
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Échec de la création" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
