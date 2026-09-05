import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MessagesActivityChart from "./MessagesActivityChart";

export default async function DashboardOverview() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, actif")
    .eq("host_id", user!.id);

  const total = properties?.length ?? 0;
  const actifs = properties?.filter((p) => p.actif).length ?? 0;
  const enPause = total - actifs;

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Tableau de bord</h1>
      <p className="mt-1 text-sm text-mist-400">
        Vue d&apos;ensemble de vos logements et de LÉO.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Logements" value={total} />
        <StatCard label="LÉO actif" value={actifs} accent="ok" />
        <StatCard label="En pause" value={enPause} accent="mist" />
      </div>

      {total > 0 && <MessagesActivityChart />}

      {total === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-night-600 px-6 py-14 text-center">
          <p className="text-4xl">🏠</p>
          <p className="mt-4 text-sm font-medium text-white">
            Vous n&apos;avez créé aucun logement
          </p>
          <p className="mt-1 text-xs text-mist-500">
            Commencez par ajouter un logement pour activer LÉO.
          </p>
          <Link
            href="/dashboard/logements"
            className="mt-5 inline-block rounded-lg bg-porch-500 px-5 py-2.5 text-sm font-semibold text-night-950 transition hover:bg-porch-400"
          >
            Ajouter un logement
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <Link
            href="/dashboard/logements"
            className="text-sm text-porch-400 underline decoration-night-600 underline-offset-4 hover:text-porch-300"
          >
            Gérer mes logements →
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "ok" | "mist";
}) {
  return (
    <div className="rounded-2xl border border-night-600 bg-night-900 p-5">
      <p className="text-xs text-mist-400">{label}</p>
      <p
        className={`mt-2 font-display text-3xl ${
          accent === "ok" ? "text-ok" : accent === "mist" ? "text-mist-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
