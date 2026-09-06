import type { SupabaseClient } from "@supabase/supabase-js";
import { normalize } from "@/lib/airtable/normalize";

export type Conversation = {
  telephone: string;
  logement: string;
  property_id: string;
  message_count: number;
  escalade_count: number;
  first_date: string;
  last_date: string;
  last_sens: string;
  statut_reservation: "EN_COURS" | "PROCHAIN" | "PASSE" | "INCONNU";
  // Identifiants Airtable exacts des messages de cette conversation. Sert a
  // la suppression : on demande a n8n de supprimer CES ids precis, plutot
  // que de lui faire rechercher par id_logement/telephone (une comparaison
  // de texte qui peut echouer silencieusement a cause d'un caractere
  // invisible cache dans la donnee Airtable).
  message_ids: string[];
};

export type LogementSummary = {
  logement: string;
  message_count: number;
  escalade_count: number;
};

export type DailyBucket = {
  date: string;
  message_count: number;
  escalade_count: number;
};

export type RecentEscalade = {
  logement: string;
  telephone: string;
  date: string;
};

type ReservationLike = {
  id_logement: string;
  telephone_voyageur?: string;
  date_debut?: string;
  date_fin?: string;
};

type Result =
  | {
      ok: true;
      messages: Conversation[];
      by_logement: LogementSummary[];
      daily: DailyBucket[];
      previous_period_message_count: number;
      recent_escalades: RecentEscalade[];
    }
  | { ok: false; error: string; status: number };

// Reproduit la logique de "Determiner statut1" cote n8n (EN_COURS / PROCHAIN
// / PASSE), mais evaluee par rapport a la date du dernier message de la
// conversation plutot qu'a "maintenant" : on veut le statut de la
// reservation au moment de l'echange, pas au moment ou l'hote consulte la
// page.
function statutReservation(
  reservations: ReservationLike[],
  logement: string,
  telephone: string,
  refDateIso: string
): Conversation["statut_reservation"] {
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

// Logique partagee entre app/api/messages/route.ts (rafraichissements et
// consommateurs client comme MessagesActivityChart/LogementsGrid) et
// app/dashboard/messages/page.tsx (rendu initial cote serveur).
export async function getMessagesData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>,
  userId: string
): Promise<Result> {
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, nom, cle_unique_airtable")
    .eq("host_id", userId);

  if (error) {
    return {
      ok: false,
      error: "Impossible de charger vos logements",
      status: 500,
    };
  }

  if (!properties || properties.length === 0) {
    return {
      ok: true,
      messages: [],
      by_logement: [],
      daily: [],
      previous_period_message_count: 0,
      recent_escalades: [],
    };
  }

  const idLogements = properties.map((p) => p.cle_unique_airtable);
  const webhookBody = JSON.stringify({ id_logements: idLogements });

  // Les deux webhooks n8n sont independants l'un de l'autre (tous deux ne
  // dependent que de idLogements) : on les lance en parallele plutot qu'en
  // sequence pour eviter d'attendre deux allers-retours reseau l'un apres
  // l'autre.
  const [messagesResult, reservationsResult] = await Promise.allSettled([
    fetch(process.env.N8N_MESSAGES_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: webhookBody,
    }),
    process.env.N8N_RESERVATIONS_WEBHOOK_URL
      ? fetch(process.env.N8N_RESERVATIONS_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
          },
          body: webhookBody,
        })
      : Promise.resolve(null),
  ]);

  if (messagesResult.status === "rejected") {
    return { ok: false, error: "Impossible de contacter n8n", status: 502 };
  }

  const n8nRes = messagesResult.value;
  if (!n8nRes.ok) {
    return {
      ok: false,
      error: "Erreur n8n lors du chargement des messages",
      status: 502,
    };
  }

  const data = await n8nRes.json();

  // Reservations necessaires pour deduire le statut (EN_COURS/PROCHAIN/PASSE)
  // de chaque conversation. Absence de reponse ou d'URL configuree =>
  // statut "INCONNU" pour tout le monde, page pas bloquee pour autant.
  let reservations: ReservationLike[] = [];
  if (reservationsResult.status === "fulfilled" && reservationsResult.value?.ok) {
    try {
      const resaData = await reservationsResult.value.json();
      reservations = resaData.reservations ?? [];
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
        property_id: property?.id ?? "",
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
      property_id: string;
      message_count: number;
      escalade_count: number;
      first_date: string;
      last_date: string;
      last_sens: string;
      message_ids: string[];
    }
  >();

  for (const m of rawMessages) {
    const key = `${m.telephone}__${m.logement}`;
    const existing = conversations.get(key);
    if (!existing) {
      conversations.set(key, {
        telephone: m.telephone,
        logement: m.logement,
        property_id: m.property_id,
        message_count: 1,
        escalade_count: m.escalade ? 1 : 0,
        first_date: m.date,
        last_date: m.date,
        last_sens: m.sens,
        message_ids: [m.id],
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
      existing.message_ids.push(m.id);
    }
  }

  const messages: Conversation[] = Array.from(conversations.values())
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
  const parLogement = new Map<string, LogementSummary>();
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
  const daily: DailyBucket[] = Array.from(dailyMap.entries()).map(([date, v]) => ({
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
  const recent_escalades: RecentEscalade[] = rawMessages
    .filter((m: { escalade: boolean }) => m.escalade)
    .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((m: { logement: string; telephone: string; date: string }) => ({
      logement: m.logement,
      telephone: m.telephone,
      date: m.date,
    }));

  return {
    ok: true,
    messages,
    by_logement,
    daily,
    previous_period_message_count,
    recent_escalades,
  };
}
