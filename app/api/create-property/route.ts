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

  // Code_Logement : identifiant court transmis au voyageur pour s'identifier
  // dès le premier message WhatsApp (ex. "LT047"). Unique tous logements
  // confondus, généré ici pour ne jamais dépendre d'Airtable.
  let codeLogement: string;
  {
    const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let attempt = 0;
    while (true) {
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
      if (attempt > 50) {
        return NextResponse.json(
          { error: "Impossible de générer un code logement unique, réessayez." },
          { status: 500 }
        );
      }
    }
  }

  const { data: property, error: insertError } = await supabase
    .from("properties")
    .insert({
      host_id: user.id,
      nom: nom.trim(),
      actif: false,
      cle_unique_airtable: slug,
      code_logement: codeLogement,
    })
    .select("id, nom, actif, ical_url, code_logement")
    .single();

  if (insertError || !property) {
    return NextResponse.json(
      { error: "Échec de la création du logement" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, property });
}
