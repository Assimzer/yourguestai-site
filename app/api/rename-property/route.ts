import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, nom } = await request.json();

  if (!property_id || typeof nom !== "string" || nom.trim().length < 2) {
    return NextResponse.json(
      { error: "Merci de donner un nom de logement (2 caractères min.)" },
      { status: 400 }
    );
  }

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id")
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

  return NextResponse.json({ ok: true, nom: trimmedNom });
}
