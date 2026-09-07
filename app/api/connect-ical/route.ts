import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

// Bloque uniquement les cibles internes/privées (localhost, IP privées,
// lien-local, adresse de métadonnées cloud) — jamais utilisées par une
// vraie URL iCal Airbnb/Booking/autre plateforme — pour empêcher qu'un
// hôte force le serveur n8n à faire une requête vers le réseau interne
// (SSRF) via ce champ. Ne restreint aucun nom de domaine externe légitime.
function targetsPrivateNetwork(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;

  // IPv4 littérale
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // lien-local / métadonnées cloud
    if (a === 0) return true;
  }

  // IPv6 loopback / lien-local
  if (host === "::1" || host.startsWith("fe80:") || host.startsWith("[::1]")) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, ical_url } = await request.json();

  if (!property_id || !ical_url || !/^https?:\/\//.test(ical_url)) {
    return NextResponse.json({ error: "Lien iCal invalide" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(ical_url);
  } catch {
    return NextResponse.json({ error: "Lien iCal invalide" }, { status: 400 });
  }

  if (targetsPrivateNetwork(parsedUrl.hostname)) {
    return NextResponse.json({ error: "Lien iCal invalide" }, { status: 400 });
  }

  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (fetchError || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ ical_url })
    .eq("id", property_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Échec de l'enregistrement" },
      { status: 500 }
    );
  }

  // Déclenche la synchro immédiate côté n8n (le workflow existant :
  // Schedule Trigger → HTTP Request → regex → Airtable Upsert peut aussi
  // être appelé à la demande via ce même webhook, en plus de son
  // déclenchement planifié).
  try {
    await fetch(process.env.N8N_ICAL_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: property.cle_unique_airtable,
        ical_url,
      }),
    });
  } catch {
    // idem toggle-property : Supabase reste la source de vérité même si
    // la notification n8n échoue ponctuellement.
  }

  return NextResponse.json({ ok: true });
}
