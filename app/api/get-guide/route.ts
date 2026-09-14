// app/api/get-guide/route.ts
import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

const GUIDE_COLUMNS =
  "adresse, photo_url, checkin_heure, checkout_heure, instructions_arrivee, code_acces, wifi_nom, wifi_code, parking_info, parking_photo_url, equipements, equipements_photo_url, regles_maison, recommandations, contact_urgence";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const property_id = searchParams.get("property_id");
  if (!property_id) return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });

  const { data: property, error } = await supabase
    .from("properties")
    .select(`host_id, ${GUIDE_COLUMNS}`)
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id)
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });

  const { host_id, ...fields } = property;
  void host_id;
  return NextResponse.json({ fields });
}
