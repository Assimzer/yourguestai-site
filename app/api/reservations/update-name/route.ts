import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, cle_unique, nom_voyageur, date_debut, date_fin } = await request.json();

  if (!property_id || !cle_unique) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const update: Record<string, string> = {};
  if (typeof nom_voyageur === "string") update.nom_voyageur = nom_voyageur.trim();
  if (typeof date_debut === "string" && date_debut) update.date_debut = date_debut;
  if (typeof date_fin === "string" && date_fin) update.date_fin = date_fin;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
  }

  if (update.date_debut && update.date_fin && update.date_fin < update.date_debut) {
    return NextResponse.json({ error: "La date de départ doit être après la date d'arrivée" }, { status: 400 });
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
    .update(update)
    .eq("logement_id", property_id)
    .eq("cle_unique", cle_unique);

  if (updateError) {
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
