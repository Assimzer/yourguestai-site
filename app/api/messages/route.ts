import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Voir app/api/reservations/route.ts pour le détail de ces deux réglages :
// sans eux, la liste des logements peut rester figée sur une ancienne version.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
    return NextResponse.json({ ok: true, messages: [] });
  }

  const idLogements = properties.map((p) => p.cle_unique_airtable);

  let n8nRes: Response;
  try {
    n8nRes = await fetch(process.env.N8N_MESSAGES_WEBHOOK_URL!, {
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
      { error: "Erreur n8n lors du chargement des messages" },
      { status: 502 }
    );
  }

  const data = await n8nRes.json();

  // Même nettoyage que pour les réservations : un champ lookup Airtable peut
  // contenir un caractère invisible (espace insécable, zéro-largeur, BOM)
  // qui casse une égalité stricte tout en semblant identique à l'œil.
  const normalize = (s: string) =>
    (s || "")
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF\u00A0\u2060]/g, "")
      .trim()
      .toLowerCase();

  const byIdLogement = new Map(
    properties.map((p) => [normalize(p.cle_unique_airtable), p])
  );

  const rawMessages = (data.messages ?? []).map(
    (m: {
      id: string;
      id_logement: string;
      telephone?: string;
      date?: string;
      sens?: string;
    }) => {
      const property = byIdLogement.get(normalize(m.id_logement));
      return {
        id: m.id,
        logement: property?.nom ?? m.id_logement,
        telephone: m.telephone ?? "",
        date: m.date ?? "",
        sens: m.sens ?? "",
      };
    }
  );

  // Regroupe par conversation (numéro + logement) plutôt que d'afficher
  // chaque ligne brute : plus lisible pour l'hôte, qui voit en un coup
  // d'œil qui a échangé avec LÉO récemment et pour quel logement.
  const conversations = new Map<
    string,
    {
      telephone: string;
      logement: string;
      message_count: number;
      last_date: string;
      last_sens: string;
    }
  >();

  for (const m of rawMessages) {
    const key = `${m.telephone}__${m.logement}`;
    const existing = conversations.get(key);
    if (!existing) {
      conversations.set(key, {
        telephone: m.telephone,
        logement: m.logement,
        message_count: 1,
        last_date: m.date,
        last_sens: m.sens,
      });
    } else {
      existing.message_count += 1;
      if (m.date > existing.last_date) {
        existing.last_date = m.date;
        existing.last_sens = m.sens;
      }
    }
  }

  const messages = Array.from(conversations.values()).sort((a, b) =>
    b.last_date.localeCompare(a.last_date)
  );

  return NextResponse.json(
    { ok: true, messages },
    { headers: { "Cache-Control": "no-store" } }
  );
}
