"use client";

import { useEffect, useState } from "react";

type Avis = {
  id: string;
  property_id: string;
  logement: string;
  telephone: string;
  note: number | null;
  commentaire: string;
  date: string;
};

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Stars({ note }: { note: number | null }) {
  if (note === null) return <span className="text-xs text-mist-500">—</span>;
  return (
    <span className="text-sm text-porch-400" aria-label={`${note} sur 5`}>
      {"★".repeat(note)}
      <span className="text-mist-600">{"★".repeat(Math.max(0, 5 - note))}</span>
    </span>
  );
}

export default function AvisList() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/avis", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setAvis(data.avis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-mist-400">Chargement des avis…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-warn">
        Impossible de charger les avis : {error}
      </p>
    );
  }

  if (avis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-night-600 px-6 py-12 text-center">
        <p className="text-sm text-mist-400">
          Aucun avis reçu pour le moment.
        </p>
      </div>
    );
  }

  const moyenne =
    avis.filter((a) => a.note !== null).reduce((sum, a) => sum + (a.note ?? 0), 0) /
    (avis.filter((a) => a.note !== null).length || 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-night-600 bg-night-900 p-4">
        <p className="text-xs text-mist-400">Note moyenne sur LÉO</p>
        <p className="mt-1 font-display text-2xl text-white">
          {moyenne.toFixed(1)} / 5{" "}
          <span className="text-sm font-normal text-mist-400">
            ({avis.length} avis)
          </span>
        </p>
      </div>

      {avis.map((a) => (
        <div
          key={a.id}
          className="rounded-2xl border border-night-600 bg-night-900 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-sm text-white">{a.logement}</p>
              <p className="mt-0.5 text-xs text-mist-400">
                {formatDate(a.date)}
                {a.telephone ? ` — ${a.telephone}` : ""}
              </p>
            </div>
            <Stars note={a.note} />
          </div>

          {a.commentaire && (
            <p className="mt-3 text-sm text-mist-300">« {a.commentaire} »</p>
          )}
        </div>
      ))}
    </div>
  );
}
