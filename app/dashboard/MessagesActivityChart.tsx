"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Daily = { date: string; message_count: number; escalade_count: number };
type Escalade = { logement: string; telephone: string; date: string };

const PORCH = "#E8A33D";
const WARN = "#E8735A";
const GRID = "#1E2740";
const AXIS_TEXT = "#8B93A7";

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function formatEscaladeDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesActivityChart() {
  const [daily, setDaily] = useState<Daily[] | null>(null);
  const [previousCount, setPreviousCount] = useState(0);
  const [recentEscalades, setRecentEscalades] = useState<Escalade[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/messages", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDaily(data.daily ?? []);
        setPreviousCount(data.previous_period_message_count ?? 0);
        setRecentEscalades(data.recent_escalades ?? []);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return null;
  if (!daily) {
    return (
      <div className="mt-6 h-[220px] animate-pulse rounded-2xl border border-night-600 bg-night-900" />
    );
  }

  const totalMessages = daily.reduce((s, d) => s + d.message_count, 0);
  const totalEscalades = daily.reduce((s, d) => s + d.escalade_count, 0);

  if (totalMessages === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-night-600 px-6 py-10 text-center">
        <p className="text-sm text-mist-400">
          Aucun message sur les 14 derniers jours.
        </p>
      </div>
    );
  }

  const delta =
    previousCount > 0
      ? Math.round(((totalMessages - previousCount) / previousCount) * 100)
      : null;

  const width = 700;
  const height = 200;
  const padTop = 24;
  const padBottom = 28;
  const padLeft = 28;
  const padRight = 8;
  const plotHeight = height - padTop - padBottom;
  const plotWidth = width - padLeft - padRight;

  // Echelle logarithmique fixe (plutot que dynamique sur le max du jour) :
  // les petits volumes du quotidien restent lisibles tout en laissant de la
  // place pour de futurs pics d'activite, avec des reperes a des valeurs
  // rondes plutot qu'un pourcentage abstrait.
  const Y_TICKS = [1, 5, 10, 25, 50, 100, 500];
  const maxCount = Math.max(1, ...daily.map((d) => d.message_count));
  const domainMax = Math.max(500, maxCount);
  const bandWidth = plotWidth / daily.length;
  const barWidth = Math.min(24, bandWidth * 0.55);

  const yFor = (count: number) =>
    (Math.log10(count + 1) / Math.log10(domainMax + 1)) * plotHeight;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-night-600 bg-night-900 p-5 lg:col-span-2">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-mist-400">Activité LÉO — 14 derniers jours</p>
            <p className="mt-1 flex items-baseline gap-2 font-display text-2xl text-white">
              {totalMessages}
              <span className="text-xs font-body text-mist-500">
                message{totalMessages > 1 ? "s" : ""}
              </span>
              {delta !== null && (
                <span
                  className={`text-xs font-body ${
                    delta >= 0 ? "text-ok" : "text-mist-400"
                  }`}
                >
                  {delta >= 0 ? "+" : ""}
                  {delta}% vs 14j précédents
                </span>
              )}
            </p>
          </div>
          {totalEscalades > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-warn">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: WARN }}
              />
              {totalEscalades} escalade{totalEscalades > 1 ? "s" : ""}
            </div>
          )}
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-4 w-full"
          role="img"
          aria-label={`Messages par jour sur les 14 derniers jours, ${totalMessages} messages au total`}
        >
          {Y_TICKS.filter((t) => t <= domainMax).map((t) => {
            const y = padTop + plotHeight - yFor(t);
            return (
              <g key={t}>
                <line
                  x1={padLeft}
                  x2={width - padRight}
                  y1={y}
                  y2={y}
                  stroke={GRID}
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill={AXIS_TEXT}
                >
                  {t}
                </text>
              </g>
            );
          })}

          {daily.map((d, i) => {
            const barHeight = Math.max(d.message_count > 0 ? 3 : 0, yFor(d.message_count));
            const x = padLeft + i * bandWidth + (bandWidth - barWidth) / 2;
            const yTop = padTop + plotHeight - barHeight;
            const showLabel = i === 0 || i === daily.length - 1 || i % 2 === 1;

            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={yTop}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={PORCH}
                >
                  <title>
                    {formatDayLabel(d.date)} — {d.message_count} message
                    {d.message_count > 1 ? "s" : ""}
                    {d.escalade_count > 0
                      ? ` (${d.escalade_count} escaladé${d.escalade_count > 1 ? "s" : ""})`
                      : ""}
                  </title>
                </rect>

                {d.escalade_count > 0 && (
                  <>
                    <circle
                      cx={x + barWidth / 2}
                      cy={yTop - 9}
                      r={4}
                      fill={WARN}
                      stroke="#0F1420"
                      strokeWidth={2}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={yTop - 16}
                      textAnchor="middle"
                      fontSize={10}
                      fill={AXIS_TEXT}
                    >
                      {d.escalade_count}
                    </text>
                  </>
                )}

                {showLabel && (
                  <text
                    x={x + barWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize={10}
                    fill={AXIS_TEXT}
                  >
                    {formatDayLabel(d.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-2xl border border-night-600 bg-night-900 p-5">
        <p className="text-xs text-mist-400">Escalades récentes</p>
        {recentEscalades.length === 0 ? (
          <p className="mt-3 text-sm text-mist-500">
            Aucune escalade récente.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {recentEscalades.map((e, i) => (
              <li key={`${e.telephone}-${e.date}-${i}`}>
                <Link
                  href="/dashboard/messages"
                  className="block rounded-xl border border-night-700 px-3 py-2 transition hover:border-warn/50"
                >
                  <p className="text-sm text-white">{e.logement}</p>
                  <p className="mt-0.5 text-xs text-mist-500">
                    {e.telephone || "Numéro inconnu"} · {formatEscaladeDate(e.date)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/dashboard/messages"
          className="mt-4 inline-block text-xs text-porch-400 underline decoration-night-600 underline-offset-4 hover:text-porch-300"
        >
          Voir toutes les conversations →
        </Link>
      </div>
    </div>
  );
}
