"use client";

import { useMemo, useState } from "react";

type Reservation = {
  id: string;
  cle_unique: string;
  property_id: string;
  logement: string;
  nom_voyageur: string;
  telephone_voyageur: string;
  date_debut: string;
  date_fin: string;
};

// Palette cyclique par logement (index dans la liste triee des logements) --
// couleurs choisies pour rester lisibles sur fond sombre et se distinguer
// nettement les unes des autres.
const LOGEMENT_COLORS = [
  "bg-porch-500/80 text-night-950",
  "bg-sky-500/80 text-night-950",
  "bg-amber-400/80 text-night-950",
  "bg-fuchsia-500/80 text-night-950",
  "bg-emerald-500/80 text-night-950",
  "bg-rose-500/80 text-night-950",
  "bg-indigo-400/80 text-night-950",
  "bg-lime-400/80 text-night-950",
];

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toDayString(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function formatDate(day: string) {
  if (!day) return "—";
  return new Date(`${day}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Grille du mois : renvoie un tableau de dates (objets Date) couvrant toutes
// les semaines completes affichees (du lundi precedant le 1er au dimanche
// suivant le dernier jour du mois), pour avoir des lignes de 7 jours propres.
function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // 0 = lundi
  const gridStart = new Date(year, month, 1 - startOffset);

  const lastOfMonth = new Date(year, month + 1, 0);
  const endOffset = (7 - ((lastOfMonth.getDay() + 6) % 7) - 1) % 7;
  const gridEnd = new Date(year, month + 1, lastOfMonth.getDate() + endOffset);

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function dateToDayString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarView({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Reservation | null>(null);

  const logements = useMemo(
    () => Array.from(new Set(reservations.map((r) => r.logement))).sort(),
    [reservations]
  );
  const colorByLogement = useMemo(() => {
    const map = new Map<string, string>();
    logements.forEach((l, i) => map.set(l, LOGEMENT_COLORS[i % LOGEMENT_COLORS.length]));
    return map;
  }, [logements]);

  const monthLabel = cursor.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const reservationsByDay = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const day of days) {
      const key = dateToDayString(day);
      const matches = reservations
        .filter((r) => {
          const start = toDayString(r.date_debut);
          const end = toDayString(r.date_fin) || start;
          return start && key >= start && key <= end;
        })
        .sort((a, b) => a.logement.localeCompare(b.logement));
      if (matches.length > 0) map.set(key, matches);
    }
    return map;
  }, [days, reservations]);

  const todayKey = dateToDayString(today);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-night-600 bg-night-900 p-4">
        <button
          type="button"
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          className="rounded-lg border border-night-600 px-3 py-1.5 text-sm text-mist-300 transition hover:bg-night-800"
        >
          ← Précédent
        </button>
        <p className="font-display text-lg capitalize text-white">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          className="rounded-lg border border-night-600 px-3 py-1.5 text-sm text-mist-300 transition hover:bg-night-800"
        >
          Suivant →
        </button>
      </div>

      {logements.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-night-600 bg-night-900 p-4">
          {logements.map((l) => (
            <div key={l} className="flex items-center gap-2 text-xs text-mist-300">
              <span className={`h-2.5 w-2.5 rounded-full ${colorByLogement.get(l)}`} />
              {l}
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-night-600 bg-night-900">
        <div className="grid grid-cols-7 border-b border-night-600 bg-night-800/50">
          {WEEKDAY_LABELS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-mist-500"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = dateToDayString(day);
            const isCurrentMonth = day.getMonth() === cursor.getMonth();
            const isToday = key === todayKey;
            const dayReservations = reservationsByDay.get(key) ?? [];
            const visible = dayReservations.slice(0, 3);
            const hiddenCount = dayReservations.length - visible.length;

            return (
              <div
                key={key}
                className={`flex min-h-[92px] flex-col gap-1 border-b border-r border-night-700/60 p-1.5 last:border-r-0 ${
                  isCurrentMonth ? "bg-night-900" : "bg-night-950/60"
                }`}
              >
                <span
                  className={`self-start rounded-full px-1.5 text-xs ${
                    isToday
                      ? "bg-porch-500 font-semibold text-night-950"
                      : isCurrentMonth
                        ? "text-mist-300"
                        : "text-mist-600"
                  }`}
                >
                  {day.getDate()}
                </span>

                <div className="flex flex-col gap-1">
                  {visible.map((r) => {
                    const start = toDayString(r.date_debut);
                    const end = toDayString(r.date_fin) || start;
                    const isStart = key === start;
                    const isEnd = key === end;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelected(r)}
                        title={`${r.logement}${r.nom_voyageur ? " — " + r.nom_voyageur : ""}`}
                        className={`truncate px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight transition hover:brightness-110 ${
                          colorByLogement.get(r.logement)
                        } ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""} ${
                          !isStart && !isEnd ? "" : ""
                        }`}
                      >
                        {r.nom_voyageur || r.logement}
                      </button>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <span className="px-1.5 text-[11px] text-mist-500">
                      +{hiddenCount} autre{hiddenCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-night-600 bg-night-900 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-lg text-white">{selected.logement}</p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Fermer"
                className="text-mist-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-mist-300">
              <p>
                <span className="text-mist-500">Voyageur : </span>
                {selected.nom_voyageur || "—"}
              </p>
              <p>
                <span className="text-mist-500">Téléphone : </span>
                {selected.telephone_voyageur || "—"}
              </p>
              <p>
                <span className="text-mist-500">Arrivée : </span>
                {formatDate(toDayString(selected.date_debut))}
              </p>
              <p>
                <span className="text-mist-500">Départ : </span>
                {formatDate(toDayString(selected.date_fin))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
