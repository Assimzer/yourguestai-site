import { createClient } from "@/lib/supabase/server";
import LogementsGrid from "./LogementsGrid";
import AddPropertyForm from "../AddPropertyForm";

export default async function LogementsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, nom, actif, ical_url")
    .eq("host_id", user!.id)
    .order("nom");

  if (error) {
    console.error("Erreur chargement properties:", error);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Vos logements</h1>
      <p className="mt-1 text-sm text-mist-400">
        Connectez un calendrier et activez LÉO pour chaque logement.
      </p>

      <div className="mt-6">
        <AddPropertyForm />
      </div>

      {error && (
        <p className="mt-6 text-sm text-warn">
          Impossible de charger vos logements pour le moment.
        </p>
      )}

      {!error && (!properties || properties.length === 0) && (
        <div className="mt-6 rounded-2xl border border-dashed border-night-600 px-6 py-12 text-center">
          <p className="text-sm text-mist-400">
            Aucun logement pour l&apos;instant.
          </p>
          <p className="mt-1 text-xs text-mist-500">
            Cliquez sur « Ajouter un logement » ci-dessus pour commencer.
          </p>
        </div>
      )}

      {properties && properties.length > 0 && (
        <LogementsGrid properties={properties} />
      )}
    </div>
  );
}
