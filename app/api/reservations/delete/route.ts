import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, cle_unique } = await request.json();

  if (!property_id || !cle_unique) {
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

  const { error: deleteError } = await supabase
    .from("reservations")
    .delete()
    .eq("logement_id", property_id)
    .eq("cle_unique", cle_unique);

  if (deleteError) {
    return NextResponse.json(
      { error: "Échec de la suppression" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
