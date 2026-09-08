import type { SupabaseClient } from "@supabase/supabase-js";
import { normalize } from "@/lib/airtable/normalize";

export type Reservation = {
  id: string;
  cle_unique: string;
  property_id: string;
  logement: string;
  nom_voyageur: string;
  telephone_voyageur: string;
  code_conv: string;
  date_debut: string;
  date_fin: string;
};

type Result =
  | { ok: true; reservations: Reservation[] }
  | { ok: false; error: string; status: number };

// Logique partagee entre app/api/reservations/route.ts (rafraichissements
// cote client) et app/dashboard/reservations/page.tsx (rendu initial cote
// serveur, sans aller-retour reseau supplementaire).
export async function getReservationsData(
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
    return { ok: true, reservations: [] };
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
    return { ok: false, error: "Impossible de contacter n8n", status: 502 };
  }

  if (!n8nRes.ok) {
    return {
      ok: false,
      error: "Erreur n8n lors du chargement des réservations",
      status: 502,
    };
  }

  const data = await n8nRes.json();

  // Ré-associe chaque réservation à l'id Supabase du logement (nécessaire
  // pour les vérifications d'ownership des routes update-name / generate-code).
  const byIdLogement = new Map(
    properties.map((p) => [normalize(p.cle_unique_airtable), p])
  );

  // Sécurité : on ne fait pas confiance au filtrage de n8n. Même si
  // id_logements a été envoyé, on ne garde ici que les réservations dont le
  // logement appartient réellement à cet hôte — sinon un filtre cassé ou
  // absent côté n8n exposerait les réservations d'autres hôtes.
  const reservations: Reservation[] = (data.reservations ?? [])
    .filter((r: { id_logement: string }) =>
      byIdLogement.has(normalize(r.id_logement))
    )
    .map(
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
        const property = byIdLogement.get(normalize(r.id_logement))!;
        return {
          id: r.id,
          cle_unique: r.cle_unique,
          property_id: property.id,
          logement: property.nom,
          nom_voyageur: r.nom_voyageur ?? "",
          telephone_voyageur: r.telephone_voyageur ?? "",
          code_conv: r.code_conv ?? "",
          date_debut: r.date_debut ?? "",
          date_fin: r.date_fin ?? "",
        };
      }
    );

  reservations.sort((a, b) => a.date_debut.localeCompare(b.date_debut));

  return { ok: true, reservations };
}
