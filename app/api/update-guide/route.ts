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
    .select("id, host_id")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id)
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });

  // Liste explicite des champs autorisés : évite qu'un champ arbitraire
  // envoyé par le client (ex: "host_id") n'écrase une valeur protégée et
  // ne redirige la mise à jour vers le logement d'un autre hôte.
  const {
    adresse,
    ville,
    photo_url,
    brand_logo_url,
    brand_color,
    checkin_heure,
    checkout_heure,
    instructions_arrivee,
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

  const { error: updateError } = await supabase
    .from("properties")
    .update({
      adresse,
      ville,
      photo_url,
      brand_logo_url,
      brand_color,
      checkin_heure,
      checkout_heure,
      instructions_arrivee,
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
    })
    .eq("id", property_id);

  if (updateError) return NextResponse.json({ error: "Erreur d'enregistrement" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
