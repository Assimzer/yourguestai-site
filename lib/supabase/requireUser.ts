import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Garde-fou partage pour toutes les routes API : cree le client Supabase,
// verifie la session, et renvoie soit {supabase, user} soit une reponse 401
// prete a etre retournee telle quelle. Centraliser ce check reduit le risque
// qu'une future route oublie de verifier l'authentification (chaque route
// existante le faisait deja individuellement, mais sans filet commun).
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return { supabase, user };
}

export function isAuthError<T extends { user: unknown }>(
  result: NextResponse | T
): result is NextResponse {
  return result instanceof NextResponse;
}
