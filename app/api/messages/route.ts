import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Voir app/api/reservations/route.ts pour le detail de ces deux reglages :
// sans eux, la liste des logements peut rester figee sur une ancienne version.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const INVISIBLE_CHARS_RE = new RegExp(
  "[​-‍﻿ ⁠]",
  "g"
);

// Meme nettoyage que dans /api/reservations : un champ lookup Airtable peut
// contenir un caractere invisible (espace insecable, zero-largeur, BOM) qui
// casse une egalite stricte tout en semblant identique a l'oeil.
function normalize(s: string) {
  return (s || "")
    .normalize("NFKC")
    .replace(INVISIBLE_CHARS_RE, "")
    .trim()
    .toLowerCase();
}

type Reservation = {
  id_logement: string;
  telephone_voyageur?: string;
  date_debut?: string;
  date_fin?: string;
};

// Reproduit la logique de "Determiner statut1" cote n8n (EN_COURS / PROCHAIN
// / PASSE), mais evaluee par rapport a la date du dernier message de la
// conversation plutot qu'a "maintenant" : on veut le statut de la
// reservation au moment de l'echange, pas au moment ou l'hote consulte la
// page.
function statutReservation(
  reservations: Reservation[],
  logement: string,
  telephone: string,
  refDateIso: string
): "EN_COURS" | "PROCHAIN" | "PASSE" | "INCONNU" {
  const ref = refDateIso ? new Date(refDateIso) : null;

  const candidates = reservations
    .filter(
      (r) =>
        normalize(r.telephone_voyageur || "") === normalize(telephone) &&
        r.date_debut &&
        r.date_fin
    )
    .map((r) => ({
      debut: new Date(r.date_debut!),
      fin: new Date(r.date_fin!),
    }));

  if (!ref || candidates.length === 0) return "INCONNU";

  const enCours = candidates.find((r) => ref >= r.debut && ref <= r.fin);
  if (enCours) return "EN_COURS";

  const prochaines = candidates
    .filter((r) => ref < r.debut)
    .sort((a, b) => a.debut.getTime() - b.debut.getTime());
  if (prochaines.length > 0) return "PROCHAIN";

  const passees = candidates
    .filter((r) => ref > r.fin)
    .sort((a, b) => b.fin.getTime() - a.fin.getTime());
  if (passees.length > 0) return "PASSE";

  return "INCONNU";
}

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
    return NextResponse.json({ ok: true, messages: [], by_logement: [] });
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

  // Charge les reservations en parallele : necessaires pour deduire le statut
  // (EN_COURS/PROCHAIN/PASSE) de chaque conversation. Absence de reponse ou
  // d'URL configuree => statut "INCONNU" pour tout le monde, page pas bloquee.
  let reservations: Reservation[] = [];
  if (process.env.N8N_RESERVATIONS_WEBHOOK_URL) {
    try {
      const resaRes = await fetch(process.env.N8N_RESERVATIONS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
        },
        body: JSON.stringify({ id_logements: idLogements }),
      });
      if (resaRes.ok) {
        const resaData = await resaRes.json();
        reservations = resaData.reservations ?? [];
      }
    } catch {
      // Statuts en INCONNU, le reste de la page reste fonctionnel.
    }
  }

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
      escalade?: boolean;
    }) => {
      const property = byIdLogement.get(normalize(m.id_logement));
      return {
        id: m.id,
        logement: property?.nom ?? m.id_logement,
        telephone: m.telephone ?? "",
        date: m.date ?? "",
        sens: m.sens ?? "",
        escalade: Boolean(m.escalade),
      };
    }
  );

  // Reservations : re-associe id_logement (Airtable) -> nom du logement
  // (Supabase), pour matcher sur le meme libelle que les messages.
  const resolvedReservations = reservations
    .map((r) => {
      const property = byIdLogement.get(normalize(r.id_logement));
      return {
        ...r,
        id_logement: property?.nom ?? r.id_logement,
      };
    })
    .filter((r) => r.id_logement);

  // Regroupe par conversation (numero + logement) plutot que d'afficher
  // chaque ligne brute : plus lisible pour l'hote, qui voit en un coup
  // d'oeil qui a echange avec LEO recemment et pour quel logement.
  const conversations = new Map<
    string,
    {
      telephone: string;
      logement: string;
      message_count: number;
      escalade_count: number;
      first_date: string;
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
        escalade_count: m.escalade ? 1 : 0,
        first_date: m.date,
        last_date: m.date,
        last_sens: m.sens,
      });
    } else {
      existing.message_count += 1;
      if (m.escalade) existing.escalade_count += 1;
      if (!existing.first_date || (m.date && m.date < existing.first_date)) {
        existing.first_date = m.date;
      }
      if (m.date > existing.last_date) {
        existing.last_date = m.date;
        existing.last_sens = m.sens;
      }
    }
  }

  const messages = Array.from(conversations.values())
    .map((c) => ({
      ...c,
      statut_reservation: statutReservation(
        resolvedReservations,
        c.logement,
        c.telephone,
        c.last_date
      ),
    }))
    .sort((a, b) => b.last_date.localeCompare(a.last_date));

  // Resume par logement : total messages + escalades sur la periode chargee
  // (affiche en haut de page pour une vue d'ensemble avant la liste detaillee).
  const parLogement = new Map<
    string,
    { logement: string; message_count: number; escalade_count: number }
  >();
  for (const c of messages) {
    const existing = parLogement.get(c.logement);
    if (!existing) {
      parLogement.set(c.logement, {
        logement: c.logement,
        message_count: c.message_count,
        escalade_count: c.escalade_count,
      });
    } else {
      existing.message_count += c.message_count;
      existing.escalade_count += c.escalade_count;
    }
  }

  const by_logement = Array.from(parLogement.values()).sort(
    (a, b) => b.message_count - a.message_count
  );

  // Serie temporelle (14 derniers jours) pour le graphique d'activite du
  // tableau de bord : un point par jour, meme les jours a 0 message, pour
  // que le graphique garde un axe regulier.
  const DAYS = 14;
  const dailyMap = new Map<string, { message_count: number; escalade_count: number }>();
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().slice(0, 10), { message_count: 0, escalade_count: 0 });
  }
  for (const m of rawMessages) {
    const day = (m.date || "").slice(0, 10);
    const bucket = dailyMap.get(day);
    if (!bucket) continue;
    bucket.message_count += 1;
    if (m.escalade) bucket.escalade_count += 1;
  }
  const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    message_count: v.message_count,
    escalade_count: v.escalade_count,
  }));

  // Periode precedente (J-28 a J-15), pour afficher une tendance (delta) a
  // cote du total de la periode en cours plutot qu'un chiffre isole.
  const previousStart = new Date(today);
  previousStart.setDate(previousStart.getDate() - (2 * DAYS - 1));
  const previousEnd = new Date(today);
  previousEnd.setDate(previousEnd.getDate() - DAYS);
  const previousStartStr = previousStart.toISOString().slice(0, 10);
  const previousEndStr = previousEnd.toISOString().slice(0, 10);
  let previous_period_message_count = 0;
  for (const m of rawMessages) {
    const day = (m.date || "").slice(0, 10);
    if (day && day >= previousStartStr && day <= previousEndStr) {
      previous_period_message_count += 1;
    }
  }

  // Dernieres escalades (toutes conversations confondues) : vue "a traiter"
  // en un coup d'oeil sur le tableau de bord. Le resume du probleme n'est
  // pas stocke dans Airtable (seul un indicateur booleen "escalade" existe
  // aujourd'hui) donc on ne peut afficher que logement + telephone + date ;
  // le lien renvoie vers la conversation complete pour le detail.
  const recent_escalades = rawMessages
    .filter((m: { escalade: boolean }) => m.escalade)
    .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((m: { logement: string; telephone: string; date: string }) => ({
      logement: m.logement,
      telephone: m.telephone,
      date: m.date,
    }));

  return NextResponse.json(
    {
      ok: true,
      messages,
      by_logement,
      daily,
      previous_period_message_count,
      recent_escalades,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
