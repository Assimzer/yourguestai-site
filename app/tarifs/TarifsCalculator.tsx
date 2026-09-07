"use client";

import Link from "next/link";
import { useState } from "react";

const TIERS = [
  {
    range: "1 à 2 logements",
    label: "1-2",
    monthly: 19.9,
    yearly: 15.92,
    max: 2,
  },
  {
    range: "3 à 4 logements",
    label: "3-4",
    monthly: 16,
    yearly: 12.8,
    max: 4,
  },
  {
    range: "5 logements et +",
    label: "5+",
    monthly: 13,
    yearly: 10.4,
    max: Infinity,
  },
];

function tierFor(count: number) {
  return TIERS.find((t) => count <= t.max) ?? TIERS[TIERS.length - 1];
}

function formatPrice(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export default function TarifsCalculator() {
  const [count, setCount] = useState(3);
  const [annual, setAnnual] = useState(false);

  const tier = tierFor(count);
  const unitPrice = annual ? tier.yearly : tier.monthly;
  const total = unitPrice * count;

  return (
    <div>
      <div className="inline-flex items-center gap-3 rounded-full border border-night-600 bg-night-900 p-1.5">
        <button
          type="button"
          onClick={() => setAnnual(false)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !annual
              ? "bg-porch-500 text-night-950"
              : "text-mist-400 hover:text-white"
          }`}
        >
          Mensuel
        </button>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            annual
              ? "bg-porch-500 text-night-950"
              : "text-mist-400 hover:text-white"
          }`}
        >
          Annuel
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              annual
                ? "bg-night-950/20 text-night-950"
                : "bg-porch-500/20 text-porch-400"
            }`}
          >
            -20%
          </span>
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-night-600 bg-night-900 p-8">
        <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-mist-500">
          Combien de logements gérez-vous ?
        </p>
        <p className="mt-3 text-center font-display text-6xl text-white">
          {count}
        </p>
        <p className="text-center text-sm text-mist-500">
          logement{count > 1 ? "s" : ""}
        </p>

        <input
          type="range"
          min={1}
          max={30}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="mt-6 w-full accent-porch-500"
        />

        <div className="mt-6 grid grid-cols-3 gap-3">
          {TIERS.map((t) => {
            const active = tier.label === t.label;
            return (
              <div
                key={t.label}
                className={`rounded-xl border px-3 py-3 text-center transition ${
                  active
                    ? "border-porch-500 bg-porch-500/10"
                    : "border-night-700"
                }`}
              >
                <p className="font-mono text-[11px] uppercase tracking-wider text-mist-500">
                  {t.label} logts
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    active ? "text-porch-400" : "text-white"
                  }`}
                >
                  {formatPrice(annual ? t.yearly : t.monthly)} €/logt
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 border-t border-night-700 pt-6 text-center">
          <p className="flex items-baseline justify-center gap-2">
            <span className="font-display text-5xl text-white">
              {formatPrice(unitPrice)} €
            </span>
            <span className="text-sm text-mist-500">/mois/logement</span>
          </p>
          <p className="mt-2 text-sm text-mist-400">
            Soit {formatPrice(total)} € /mois pour {count} logement
            {count > 1 ? "s" : ""}
            {annual ? " — facturé annuellement" : ""}
          </p>
          <p className="mt-1 text-xs text-mist-500">
            {annual ? "Résiliable à tout moment" : "Sans engagement"} · Essai
            gratuit 14 jours
          </p>

          <Link
            href="/signup"
            className="mt-6 inline-block rounded-xl bg-porch-500 px-7 py-3.5 text-sm font-semibold text-night-950 shadow-glow transition hover:bg-porch-400"
          >
            Commencer l&apos;essai gratuit
          </Link>
          <p className="mt-3 text-xs text-mist-500">
            Mise en route en quelques minutes · Résiliable à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}
