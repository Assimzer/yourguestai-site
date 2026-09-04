import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Empêche Next.js de mettre en cache les appels fetch internes de cette route
// (Supabase et n8n) — sans ça, la liste des logements peut rester figée sur
// une ancienne version, causant des correspondances property_id incohérentes.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Flux : navigateur → cette route (vérifie session + ownership) →
//        webhook n8n sécurisé (interroge Airtable.Reservations) →
//        réponse enrichie avec le property_id Supabase de chaque logement.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, nom, cle_unique_airtable")
    .eq("host_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Impossible de charger vos logements" },
      { status: 500 }
    );
  }

  if (!properties || properties.length === 0) {
    return NextResponse.json({ ok: true, reservations: [] });
  }

  const idLogements = properties.map((p) => p.cle_unique_airtable);

  let n8nRes: Response;
  try {
    n8nRes = await fetch(process.env.N8N_RESERVATIONS_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({ id_logements: idLogements }),
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter n8n" },
      { status: 502 }
    );
  }

  if (!n8nRes.ok) {
    return NextResponse.json(
      { error: "Erreur n8n lors du chargement des réservations" },
      { status: 502 }
    );
  }

  const data = await n8nRes.json();

  // Normalise (espaces + casse + caractères Unicode invisibles) avant de
  // comparer : Airtable peut renvoyer un champ lookup avec un espace
  // insécable, un espace zéro-largeur ou un BOM invisible à l'œil, que
  // .trim() seul ne supprime pas — d'où des égalités qui échouent sans
  // raison apparente.
  const normalize = (s: string) =>
    (s || "")
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF\u00A0\u2060]/g, "")
      .trim()
      .toLowerCase();

  // Ré-associe chaque réservation à l'id Supabase du logement (nécessaire
  // pour les vérifications d'ownership des routes update-name / generate-code).
  const byIdLogement = new Map(
    properties.map((p) => [normalize(p.cle_unique_airtable), p])
  );

  const reservations = (data.reservations ?? []).map(
    (r: {
      id: string;
      cle_unique: string;
      id_logement: string;
      nom_voyageur?: string;
      telephone_voyageur?: string;
      code_conv?: string;
      date_debut?: string;
      date_fin?: string;
    }) => {
      const property = byIdLogement.get(normalize(r.id_logement));
      return {
        id: r.id,
        cle_unique: r.cle_unique,
        property_id: property?.id ?? "",
        logement: property?.nom ?? r.id_logement,
        nom_voyageur: r.nom_voyageur ?? "",
        telephone_voyageur: r.telephone_voyageur ?? "",
        code_conv: r.code_conv ?? "",
        date_debut: r.date_debut ?? "",
        date_fin: r.date_fin ?? "",
      };
    }
  );

  reservations.sort((a: { date_debut: string }, b: { date_debut: string }) =>
    a.date_debut.localeCompare(b.date_debut)
  );

  return NextResponse.json(
    { ok: true, reservations },
    { headers: { "Cache-Control": "no-store" } }
  );
}