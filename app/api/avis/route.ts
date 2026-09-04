import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Empêche Next.js de mettre en cache les appels fetch internes de cette route
// (Supabase et n8n) — sans ça, la liste des avis peut rester figée sur une
// ancienne version après un nouvel avis reçu par LÉO.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Flux : navigateur → cette route (vérifie session + ownership) →
//        webhook n8n sécurisé (interroge Airtable.Avis) →
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
    return NextResponse.json({ ok: true, avis: [] });
  }

  const idLogements = properties.map((p) => p.cle_unique_airtable);

  let n8nRes: Response;
  try {
    n8nRes = await fetch(process.env.N8N_AVIS_WEBHOOK_URL!, {
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
      { error: "Erreur n8n lors du chargement des avis" },
      { status: 502 }
    );
  }

  const data = await n8nRes.json();

  // Normalise (espaces + casse + caractères Unicode invisibles) avant de
  // comparer — même logique que /api/reservations et /api/messages, pour
  // les mêmes raisons (lookups Airtable parfois pollués par des caractères
  // invisibles).
  const INVISIBLE_CHARS = new RegExp(
    "[​-‍﻿ ⁠]",
    "g"
  );
  const normalize = (s: string) =>
    (s || "").normalize("NFKC").replace(INVISIBLE_CHARS, "").trim().toLowerCase();

  const byIdLogement = new Map(
    properties.map((p) => [normalize(p.cle_unique_airtable), p])
  );

  const avis = (data.avis ?? [])
    .map(
      (a: {
        id: string;
        id_logement: string;
        telephone?: string;
        note?: number;
        commentaire?: string;
        date?: string;
      }) => {
        const property = byIdLogement.get(normalize(a.id_logement));
        if (!property) return null;
        return {
          id: a.id,
          property_id: property.id,
          logement: property.nom,
          telephone: a.telephone ?? "",
          note: a.note ?? null,
          commentaire: a.commentaire ?? "",
          date: a.date ?? "",
        };
      }
    )
    .filter(Boolean);

  avis.sort((a: { date: string }, b: { date: string }) =>
    b.date.localeCompare(a.date)
  );

  return NextResponse.json(
    { ok: true, avis },
    { headers: { "Cache-Control": "no-store" } }
  );
}
