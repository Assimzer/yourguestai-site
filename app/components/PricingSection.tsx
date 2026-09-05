"use client";

import { useState } from "react";
import Link from "next/link";

const pricing = [
  {
    range: "1 à 2 logements",
    monthly: "19,90 €",
    yearlyEquivalent: "15,92 €",
    yearlyTotal: "191,04 € / an",
    benefits: [
      "Adapté aux hôtes débutants qui gèrent 1-2 biens",
      "Mise en route en quelques minutes",
      "Support prioritaire par WhatsApp",
    ],
  },
  {
    range: "3 à 4 logements",
    monthly: "16 €",
    yearlyEquivalent: "12,80 €",
    yearlyTotal: "153,60 € / an",
    benefits: [
      "Pensé pour les hôtes qui gèrent un petit portefeuille",
      "Un livret d'accueil par logement, sans effort",
      "Réponses cohérentes sur tous vos biens",
    ],
  },
  {
    range: "5 logements et +",
    monthly: "13 €",
    yearlyEquivalent: "10,40 €",
    yearlyTotal: "124,80 € / an",
    benefits: [
      "Pensé pour les conciergeries multi-logements",
      "Tarif dégressif dès le 5e logement",
      "Un seul numéro WhatsApp pour tout gérer",
    ],
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-night-600 bg-night-900 p-1.5">
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
      {annual && (
        <p className="mt-3 text-xs text-mist-500">
          Prix garanti, bloqué pendant 12 mois.
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {pricing.map((t) => (
          <div
            key={t.range}
            className="flex flex-col rounded-2xl border border-night-600 bg-night-900 p-6"
          >
            <p className="text-sm text-mist-400">{t.range}</p>
            <p className="mt-3 font-display text-4xl text-white">
              {annual ? t.yearlyEquivalent : t.monthly}
              <span className="text-base font-body text-mist-500">
                {" "}
                /logement/mois
              </span>
            </p>
            {annual && (
              <p className="mt-1 text-xs text-mist-500">
                Facturé annuellement — {t.yearlyTotal}
              </p>
            )}
            <ul className="mt-6 flex flex-col gap-2 border-t border-night-800 pt-5 text-sm text-mist-400">
              {t.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 text-porch-400">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-6 rounded-xl bg-porch-500 px-5 py-3 text-center text-sm font-semibold text-night-950 transition hover:bg-porch-400"
            >
              Choisir cette offre
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
