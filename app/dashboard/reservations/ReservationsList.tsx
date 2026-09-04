"use client";

import { useEffect, useState } from "react";

type Reservation = {
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

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [codeCreatedId, setCodeCreatedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setReservations(data.reservations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function updateName(r: Reservation, nom: string) {
    // Ne rien faire si la valeur n'a pas changé (évite un appel réseau inutile
    // à chaque clic hors du champ).
    if (nom === r.nom_voyageur) return;

    setReservations((prev) =>
      prev.map((res) => (res.id === r.id ? { ...res, nom_voyageur: nom } : res))
    );
    setSavingId(r.id);
    setSavedId(null);

    try {
      const res = await fetch("/api/reservations/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: r.property_id,
          cle_unique: r.cle_unique,
          nom_voyageur: nom,
        }),
      });
      if (!res.ok) throw new Error();
      setSavedId(r.id);
      setTimeout(() => setSavedId((id) => (id === r.id ? null : id)), 2000);
    } catch {
      // Laisse la valeur affichée telle quelle mais n'affiche pas de
      // confirmation — l'hôte peut réessayer en cliquant à nouveau hors du champ.
    } finally {
      setSavingId(null);
    }
  }

  async function generateCode(r: Reservation) {
    setGeneratingId(r.id);
    try {
      const res = await fetch("/api/generate-conv-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: r.property_id,
          cle_unique: r.cle_unique,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de la génération");

      setReservations((prev) =>
        prev.map((res) =>
          res.id === r.id ? { ...res, code_conv: data.code_conv } : res
        )
      );
      setCodeCreatedId(r.id);
      setTimeout(() => setCodeCreatedId((id) => (id === r.id ? null : id)), 3000);
    } catch {
      // La réponse HTTP peut échouer alors que n8n a quand même écrit le
      // code côté Airtable — on recharge la liste depuis le serveur plutôt
      // que d'afficher une alerte technique à l'hôte.
      await load();
    } finally {
      setGeneratingId(null);
    }
  }

  async function deleteReservation(r: Reservation) {
    const confirmed = window.confirm(
      `Supprimer la réservation "${r.logement}" (${formatDate(r.date_debut)} — ${formatDate(r.date_fin)}) ? Cette action est définitive.`
    );
    if (!confirmed) return;

    setDeletingId(r.id);
    try {
      const res = await fetch("/api/reservations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: r.property_id,
          cle_unique: r.cle_unique,
        }),
      });
      if (!res.ok) throw new Error();
      setReservations((prev) => prev.filter((res) => res.id !== r.id));
    } catch {
      alert("Échec de la suppression. Réessayez dans un instant.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-mist-400">Chargement des réservations…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-warn">
        Impossible de charger les réservations : {error}
      </p>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-night-600 px-6 py-12 text-center">
        <p className="text-sm text-mist-400">Aucune réservation à venir.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reservations.map((r) => (
        <div
          key={r.id}
          className="rounded-2xl border border-night-600 bg-night-900 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-sm text-white">{r.logement}</p>
              <p className="mt-0.5 text-xs text-mist-400">
                Arrivée {formatDate(r.date_debut)} — Départ{" "}
                {formatDate(r.date_fin)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {r.code_conv ? (
                <span className="flex items-center gap-1 rounded-lg bg-night-800 px-3 py-1 font-mono text-xs text-porch-400">
                  {r.code_conv}
                </span>
              ) : (
                <button
                  onClick={() => generateCode(r)}
                  disabled={generatingId === r.id}
                  className="rounded-lg border border-night-600 px-3 py-1 text-xs text-mist-300 transition hover:bg-night-800 disabled:opacity-50"
                >
                  {generatingId === r.id ? "Génération…" : "Générer un code"}
                </button>
              )}
              <button
                onClick={() => deleteReservation(r)}
                disabled={deletingId === r.id}
                aria-label="Supprimer la réservation"
                className="rounded-lg border border-night-600 p-1.5 text-mist-500 transition hover:border-warn hover:text-warn disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          </div>

          <input
            type="text"
            defaultValue={r.nom_voyageur}
            placeholder="Nom du voyageur (optionnel)"
            onBlur={(e) => updateName(r, e.target.value)}
            className="mt-3 w-full rounded-lg border border-night-600 bg-night-950 px-3 py-2 text-sm text-white placeholder:text-mist-500 focus:border-porch-500 focus:outline-none"
          />
          {savingId === r.id && (
            <p className="mt-1.5 text-xs text-mist-500">Enregistrement…</p>
          )}
          {savedId === r.id && (
            <p className="mt-1.5 text-xs text-ok">Enregistré.</p>
          )}
          {codeCreatedId === r.id && (
            <p className="mt-1.5 text-xs text-ok">Code créé.</p>
          )}
        </div>
      ))}
    </div>
  );
}
