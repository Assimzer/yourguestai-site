"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

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

// Une réservation est incluse si son séjour chevauche la plage [from, to]
// choisie (comparaison sur le jour civil, au format "YYYY-MM-DD").
function overlapsDateRange(debut: string, fin: string, from: string, to: string) {
  if (!from && !to) return true;
  const start = debut ? debut.slice(0, 10) : "";
  const end = fin ? fin.slice(0, 10) : start;
  if (to && start && start > to) return false;
  if (from && end && end < from) return false;
  return true;
}

const PAGE_SIZE = 10;

type Property = { id: string; nom: string };

export default function ReservationsList({
  initialReservations,
  initialError,
  properties,
}: {
  // Rendu initial fourni par le Server Component parent (un seul aller-retour
  // au chargement de la page, plutot qu'un fetch client + spinner) ; `load()`
  // reste utilise pour les rafraichissements apres une action (suppression,
  // generation de code...).
  initialReservations: Reservation[];
  initialError: string | null;
  properties: Property[];
}) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [codeCreatedId, setCodeCreatedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newPropertyId, setNewPropertyId] = useState(properties[0]?.id ?? "");
  const [newNomVoyageur, setNewNomVoyageur] = useState("");
  const [newTelephone, setNewTelephone] = useState("");
  const [newDateDebut, setNewDateDebut] = useState("");
  const [newDateFin, setNewDateFin] = useState("");

  async function createReservation(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: newPropertyId,
          nom_voyageur: newNomVoyageur,
          telephone_voyageur: newTelephone,
          date_debut: newDateDebut,
          date_fin: newDateFin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de la création");

      setNewNomVoyageur("");
      setNewTelephone("");
      setNewDateDebut("");
      setNewDateFin("");
      setShowCreateForm(false);
      await load();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setCreating(false);
    }
  }

  const [logementFilter, setLogementFilter] = useState("tous");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

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

  const logements = useMemo(
    () => Array.from(new Set(reservations.map((r) => r.logement))).sort(),
    [reservations]
  );

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (logementFilter !== "tous" && r.logement !== logementFilter) return false;
      if (!overlapsDateRange(r.date_debut, r.date_fin, dateFrom, dateTo)) return false;
      return true;
    });
  }, [reservations, logementFilter, dateFrom, dateTo]);

  const hasActiveFilters =
    logementFilter !== "tous" || Boolean(dateFrom) || Boolean(dateTo);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [logementFilter, dateFrom, dateTo]);

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

  const createSection = (
    <div className="rounded-2xl border border-night-600 bg-night-900 p-4">
      <button
        type="button"
        onClick={() => setShowCreateForm((v) => !v)}
        className="text-sm font-medium text-porch-400 hover:text-porch-300"
      >
        {showCreateForm ? "Annuler" : "+ Nouvelle réservation"}
      </button>

      {showCreateForm && (
        <form onSubmit={createReservation} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-mist-400">Logement</span>
            <select
              required
              value={newPropertyId}
              onChange={(e) => setNewPropertyId(e.target.value)}
              className="rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-white"
            >
              <option value="" disabled>
                Choisir un logement
              </option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mist-400">Arrivée</span>
              <input
                type="date"
                required
                value={newDateDebut}
                onChange={(e) => setNewDateDebut(e.target.value)}
                className="rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mist-400">Départ</span>
              <input
                type="date"
                required
                value={newDateFin}
                onChange={(e) => setNewDateFin(e.target.value)}
                className="rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>

          <input
            type="text"
            value={newNomVoyageur}
            onChange={(e) => setNewNomVoyageur(e.target.value)}
            placeholder="Nom du voyageur (optionnel)"
            className="rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-white placeholder:text-mist-500"
          />
          <input
            type="tel"
            value={newTelephone}
            onChange={(e) => setNewTelephone(e.target.value)}
            placeholder="Téléphone du voyageur (optionnel)"
            className="rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-white placeholder:text-mist-500"
          />

          {createError && <p className="text-xs text-warn">{createError}</p>}

          <button
            type="submit"
            disabled={creating || !newPropertyId}
            className="self-start rounded-lg bg-porch-500 px-4 py-2 text-sm font-semibold text-night-950 transition hover:bg-porch-400 disabled:opacity-50"
          >
            {creating ? "Création…" : "Créer la réservation"}
          </button>
        </form>
      )}
    </div>
  );

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {createSection}
        <div className="rounded-2xl border border-dashed border-night-600 px-6 py-12 text-center">
          <p className="text-sm text-mist-400">Aucune réservation à venir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {createSection}

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-night-600 bg-night-900 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-mist-400">Logement</span>
          <select
            value={logementFilter}
            onChange={(e) => setLogementFilter(e.target.value)}
            className="rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-sm text-white"
          >
            <option value="tous">Tous les logements</option>
            {logements.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-mist-400">Du</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-sm text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-mist-400">Au</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-sm text-white"
          />
        </label>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setLogementFilter("tous");
              setDateFrom("");
              setDateTo("");
            }}
            className="pb-1.5 text-xs text-mist-400 underline hover:text-white"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-night-600 px-6 py-12 text-center">
          <p className="text-sm text-mist-400">
            Aucune réservation ne correspond à ces filtres.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {paginated.map((r) => (
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

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-night-600 px-3 py-1.5 text-xs text-mist-300 transition hover:bg-night-800 disabled:opacity-40"
              >
                Précédent
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                    p === currentPage
                      ? "border-porch-500 bg-porch-500/20 text-porch-400"
                      : "border-night-600 text-mist-300 hover:bg-night-800"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="rounded-lg border border-night-600 px-3 py-1.5 text-xs text-mist-300 transition hover:bg-night-800 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
