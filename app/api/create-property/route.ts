import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";

// Transforme "Airbnb Arbois" en "airbnb_arbois" — même format que les
// id_logement existants dans Airtable (minuscules, underscores, sans accent).
function slugify(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { nom } = await request.json();

  if (!nom || typeof nom !== "string" || nom.trim().length < 2) {
    return NextResponse.json(
      { error: "Merci de donner un nom de logement (2 caractères min.)" },
      { status: 400 }
    );
  }

  const baseSlug = slugify(nom.trim());
  if (!baseSlug) {
    return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
  }

  // Garantit l'unicité de cle_unique_airtable même si deux hôtes (ou le
  // même hôte) choisissent un nom identique : airbnb_arbois,
  // airbnb_arbois_2, airbnb_arbois_3...
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("cle_unique_airtable", slug)
      .maybeSingle();

    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}_${attempt}`;
    if (attempt > 50) {
      return NextResponse.json(
        { error: "Impossible de générer un identifiant unique, réessayez." },
        { status: 500 }
      );
    }
  }

  const { data: property, error: insertError } = await supabase
    .from("properties")
    .insert({
      host_id: user.id,
      nom: nom.trim(),
      actif: false, // désactivé tant que la fiche Airtable n'est pas complétée
      cle_unique_airtable: slug,
    })
    .select("id, nom, actif, ical_url")
    .single();

  if (insertError || !property) {
    return NextResponse.json(
      { error: "Échec de la création du logement" },
      { status: 500 }
    );
  }

  // Notifie n8n pour créer automatiquement la ligne correspondante dans
  // Airtable.Logements — vide au départ (id_logement + nom uniquement),
  // à compléter ensuite avec wifi/codes/règles depuis Airtable.
  try {
    await fetch(process.env.N8N_CREATE_PROPERTY_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        id_logement: slug,
        nom: nom.trim(),
        host_email: user.email,
      }),
    });
  } catch {
    // La ligne Supabase existe déjà (source de vérité pour le site) même
    // si la notification n8n échoue ; à surveiller en production.
  }

  return NextResponse.json({ ok: true, property });
}
