import type { SupabaseClient } from "@supabase/supabase-js";

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
//
// Lit directement Supabase (table `reservations`) : plus de webhook n8n
// ici. `supabase` est le client scope a la session de l'hote (cree par
// requireUser()), donc les policies RLS de `reservations` (host_id via
// jointure sur properties) filtrent deja aux seules reservations de cet
// hote -- pas besoin de refiltrer manuellement cote JS.
export async function getReservationsData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>,
  _userId: string
): Promise<Result> {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, cle_unique, code_conv, nom_voyageur, telephone_voyageur, date_debut, date_fin, logement_id, properties(nom)"
    )
    .order("date_debut", { ascending: true });

  if (error) {
    return {
      ok: false,
      error: "Impossible de charger vos réservations",
      status: 500,
    };
  }

  const reservations: Reservation[] = (data ?? []).map(
    (r: {
      id: string;
      cle_unique: string;
      code_conv: string | null;
      nom_voyageur: string | null;
      telephone_voyageur: string | null;
      date_debut: string;
      date_fin: string;
      logement_id: string;
      properties: { nom: string } | { nom: string }[] | null;
    }) => {
      const property = Array.isArray(r.properties) ? r.properties[0] : r.properties;
      return {
        id: r.id,
        cle_unique: r.cle_unique,
        property_id: r.logement_id,
        logement: property?.nom ?? "",
        nom_voyageur: r.nom_voyageur ?? "",
        telephone_voyageur: r.telephone_voyageur ?? "",
        code_conv: r.code_conv ?? "",
        date_debut: r.date_debut ?? "",
        date_fin: r.date_fin ?? "",
      };
    }
  );

  return { ok: true, reservations };
}
