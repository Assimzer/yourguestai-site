import { createClient } from "@/lib/supabase/server";
import SubscribeButton from "./SubscribeButton";
import ManageSubscriptionButton from "./ManageSubscriptionButton";

export default async function ComptePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: host } = await supabase
    .from("hosts")
    .select(
      "email, statut_abonnement, created_at, logements_quantity, stripe_customer_id, nom_complet, telephone, nom_conciergerie"
    )
    .eq("id", user!.id)
    .single();

  const hasStripeSubscription = Boolean(host?.stripe_customer_id);

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Mon compte</h1>
      <p className="mt-1 text-sm text-mist-400">
        Informations liées à votre compte hôte.
      </p>

      <div className="mt-8 max-w-md rounded-2xl border border-night-600 bg-night-900 p-6">
        <Row label="Nom" value={host?.nom_complet || "—"} />
        <Row label="Email" value={host?.email ?? user?.email ?? "—"} />
        <Row label="Téléphone" value={host?.telephone || "—"} />
        {host?.nom_conciergerie && (
          <Row label="Conciergerie" value={host.nom_conciergerie} />
        )}
      <Row
        label="Statut"
        value={
        host?.statut_abonnement === "actif"
          ? "Actif"
          : host?.statut_abonnement === "essai"
          ? "Essai"
          : host?.statut_abonnement === "suspendu"
          ? "Suspendu"
          : "Non abonné"
        }
      
        />
        <Row
          label="Logements facturés"
          value={String(host?.logements_quantity ?? 0)}
        />
        <Row
          label="Membre depuis"
          value={
            host?.created_at
              ? new Date(host.created_at).toLocaleDateString("fr-FR")
              : "—"
          }
          last
        />
      </div>

      <div className="mt-6 max-w-md">
        {hasStripeSubscription ? (
          <ManageSubscriptionButton />
        ) : (
          <SubscribeButton />
        )}
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        last ? "" : "border-b border-night-800"
      }`}
    >
      <span className="text-sm text-mist-400">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}