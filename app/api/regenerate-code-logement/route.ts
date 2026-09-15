import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id } = await request.json();
  if (!property_id) {
    return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });
  }

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  let codeLogement: string | null = null;
  let attempt = 0;
  while (attempt < 50) {
    let candidate = "LT";
    for (let i = 0; i < 4; i++) {
      candidate += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("code_logement", candidate)
      .maybeSingle();
    if (!existing) {
      codeLogement = candidate;
      break;
    }
    attempt += 1;
  }

  if (!codeLogement) {
    return NextResponse.json(
      { error: "Impossible de générer un code unique, réessayez." },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ code_logement: codeLogement })
    .eq("id", property_id);

  if (updateError) {
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, code_logement: codeLogement });
}
