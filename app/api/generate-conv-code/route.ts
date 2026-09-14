import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I/O/0/1, ambigus à l'oral/écrit

function generateCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

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

  // Génère un code jusqu'à en trouver un qui ne soit pas déjà pris (la
  // contrainte UNIQUE sur reservations.code_conv est le vrai garde-fou ;
  // cette boucle évite juste de dépendre systématiquement d'un retry sur
  // conflit pour les cas simples).
  let code = generateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from("reservations")
      .select("id")
      .eq("code_conv", code)
      .maybeSingle();
    if (!existing) break;
    code = generateCode();
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update({ code_conv: code })
    .eq("logement_id", property_id)
    .eq("cle_unique", cle_unique);

  if (updateError) {
    return NextResponse.json(
      { error: "Échec de la génération du code" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, code_conv: code });
}
