"use client";

import { useMemo, useState } from "react";

type Conversation = {
  telephone: string;
  logement: string;
  message_count: number;
  escalade_count: number;
  first_date: string;
  last_date: string;
  last_sens: string;
  statut_reservation: "EN_COURS" | "PROCHAIN" | "PASSE" | "INCONNU";
};

function formatRelative(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / 3_600_000;

  if (diffHours < 1) return "À l'instant";
  if (diffHours < 24) return `Il y a ${Math.floor(diffHours)}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatDuration(firstIso: string, lastIso: string) {
  if (!firstIso || !lastIso) return null;
  const diffMs = new Date(lastIso).getTime() - new Date(firstIso).getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return null;

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`;

  const days = Math.floor(hours / 24);
  return `${days}j${hours % 24 ? ` ${hours % 24}h` : ""}`;
}

function sensBadge(sens: string) {
  const s = sens.toLowerCase();
  if (s.includes("sortant")) {
    return { label: "LÉO a répondu", className: "bg-porch-500/20 text-porch-400" };
  }
  if (s.includes("entrant")) {
    return { label: "Voyageur a écrit", className: "bg-ok/20 text-ok" };
  }
  return { label: sens || "—", className: "bg-night-800 text-mist-400" };
}

function statutBadge(statut: Conversation["statut_reservation"]) {
  switch (statut) {
    case "EN_COURS":
      return { label: "En cours", className: "bg-ok/20 text-ok" };
    case "PROCHAIN":
      return { label: "À venir", className: "bg-porch-500/20 text-porch-400" };
    case "PASSE":
      return { label: "Terminé", className: "bg-night-800 text-mist-400" };
    default:
      return null;
  }
}

// Bornes de date au format "YYYY-MM-DD" (valeur d'un <input type="date">) :
// on compare sur le jour civil, pas l'heure exacte, pour que "du 1 au 5"
// inclue bien toute la journée du 5.
function withinDateRange(iso: string, from: string, to: string) {
  if (!iso) return !from && !to;
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export default function MessagesList({
  initialConversations,
  initialError,
}: {
  // Rendu initial fourni par le Server Component parent (un seul aller-retour
  // au chargement de la page, plutot qu'un fetch client + spinner).
  initialConversations: Conversation[];
  initialError: string | null;
}) {
  const [conversations] = useState<Conversation[]>(initialConversations);
  const [error] = useState<string | null>(initialError);

  const [logementFilter, setLogementFilter] = useState("tous");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [escaladeOnly, setEscaladeOnly] = useState(false);

  const logements = useMemo(
    () => Array.from(new Set(conversations.map((c) => c.logement))).sort(),
    [conversations]
  );

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (logementFilter !== "tous" && c.logement !== logementFilter) return false;
      if (escaladeOnly && c.escalade_count === 0) return false;
      if (!withinDateRange(c.last_date, dateFrom, dateTo)) return false;
      return true;
    });
  }, [conversations, logementFilter, dateFrom, dateTo, escaladeOnly]);

  const byLogement = useMemo(() => {
    const map = new Map<
      string,
      { logement: string; message_count: number; escalade_count: number }
    >();
    for (const c of filtered) {
      const existing = map.get(c.logement);
      if (!existing) {
        map.set(c.logement, {
          logement: c.logement,
          message_count: c.message_count,
          escalade_count: c.escalade_count,
        });
      } else {
        existing.message_count += c.message_count;
        existing.escalade_count += c.escalade_count;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.message_count - a.message_count);
  }, [filtered]);

  const hasActiveFilters =
    logementFilter !== "tous" || Boolean(dateFrom) || Boolean(dateTo) || escaladeOnly;

  if (error) {
    return (
      <p className="text-sm text-warn">
        Impossible de charger les messages : {error}
      </p>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-night-600 px-6 py-12 text-center">
        <p className="text-sm text-mist-400">Aucun échange pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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

        <label className="flex items-center gap-2 pb-1.5">
          <input
            type="checkbox"
            checked={escaladeOnly}
            onChange={(e) => setEscaladeOnly(e.target.checked)}
            className="h-4 w-4 rounded border-night-600 bg-night-800"
          />
          <span className="text-sm text-white">Escaladées uniquement</span>
        </label>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setLogementFilter("tous");
              setDateFrom("");
              setDateTo("");
              setEscaladeOnly(false);
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
            Aucune conversation ne correspond à ces filtres.
          </p>
        </div>
      ) : (
        <>
          {byLogement.length > 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {byLogement.map((l) => (
                <div
                  key={l.logement}
                  className="rounded-2xl border border-night-600 bg-night-900 p-4"
                >
                  <p className="text-xs text-mist-500">{l.logement}</p>
                  <p className="mt-1 font-display text-2xl text-white">
                    {l.message_count}
                    <span className="ml-1 text-xs font-body text-mist-500">
                      message{l.message_count > 1 ? "s" : ""}
                    </span>
                  </p>
                  {l.escalade_count > 0 && (
                    <p className="mt-1 text-xs text-warn">
                      {l.escalade_count} escalade{l.escalade_count > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {filtered.map((c) => {
              const badge = sensBadge(c.last_sens);
              const statut = statutBadge(c.statut_reservation);
              const duree = formatDuration(c.first_date, c.last_date);
              return (
                <div
                  key={`${c.telephone}-${c.logement}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-night-600 bg-night-900 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {c.telephone || "Numéro inconnu"}
                      <span className="ml-2 text-xs text-mist-500">{c.logement}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-mist-400">
                      {c.message_count} message{c.message_count > 1 ? "s" : ""}
                      {duree ? ` · ${duree}` : ""} · {formatRelative(c.last_date)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {statut && (
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${statut.className}`}
                      >
                        {statut.label}
                      </span>
                    )}
                    {c.escalade_count > 0 && (
                      <span className="rounded-full bg-warn/20 px-3 py-1 text-[11px] font-medium text-warn">
                        Escaladé
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
