// app/api/update-guide/route.ts
import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const body = await request.json();
  const { property_id } = body;

  if (!property_id) return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });

  // Vérifie ownership
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id, cle_unique_airtable")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id)
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });

  // Liste explicite des champs autorisés : évite qu'un champ arbitraire
  // envoyé par le client (ex: "id_logement") n'écrase la valeur vérifiée
  // ci-dessus et ne redirige la mise à jour vers le logement d'un autre hôte.
  const {
    adresse,
    photo_url,
    checkin_heure,
    checkout_heure,
    code_acces,
    wifi_nom,
    wifi_code,
    parking_info,
    parking_photo_url,
    equipements,
    equipements_photo_url,
    regles_maison,
    recommandations,
    contact_urgence,
  } = body;

  // Envoie au webhook n8n update-guide (POST)
  const res = await fetch(process.env.N8N_UPDATE_GUIDE_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
    },
    body: JSON.stringify({
      id_logement: property.cle_unique_airtable,
      adresse,
      photo_url,
      checkin_heure,
      checkout_heure,
      code_acces,
      wifi_nom,
      wifi_code,
      parking_info,
      parking_photo_url,
      equipements,
      equipements_photo_url,
      regles_maison,
      recommandations,
      contact_urgence,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "Erreur n8n" }, { status: 502 });

  return NextResponse.json({ ok: true });
}
