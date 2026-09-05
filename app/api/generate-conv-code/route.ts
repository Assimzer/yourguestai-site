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

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  let n8nRes: Response;
  try {
    n8nRes = await fetch(process.env.N8N_GENERATE_CODE_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: property.cle_unique_airtable,
        cle_unique,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter n8n" },
      { status: 502 }
    );
  }

  if (!n8nRes.ok) {
    return NextResponse.json(
      { error: "Échec de la génération du code" },
      { status: 502 }
    );
  }

  const rawBody = await n8nRes.text();
  let data: { code_conv?: string };
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json(
      { error: `Réponse n8n non-JSON: ${rawBody.slice(0, 200)}` },
      { status: 502 }
    );
  }

  if (!data.code_conv) {
    return NextResponse.json(
      { error: "Réponse invalide de n8n (pas de code_conv)" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, code_conv: data.code_conv });
}