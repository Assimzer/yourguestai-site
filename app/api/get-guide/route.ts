// app/api/get-guide/route.ts
import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const property_id = searchParams.get("property_id");
  if (!property_id) return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });

  // Vérifie que le logement appartient bien à cet hôte + récupère le slug Airtable
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id)
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });

  // Appel au webhook n8n get-guide (GET avec query param)
  const url = new URL(process.env.N8N_GET_GUIDE_WEBHOOK_URL!);
  url.searchParams.set("id_logement", property.cle_unique_airtable);

  const res = await fetch(url.toString(), {
    headers: { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET! },
  });

  if (!res.ok) return NextResponse.json({ error: "Erreur n8n" }, { status: 502 });

  const data = await res.json();
  return NextResponse.json(data);
}
