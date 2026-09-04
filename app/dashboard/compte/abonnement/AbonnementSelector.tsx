"use client";

import { useMemo, useState } from "react";

function pricePerLogement(quantity: number) {
  if (quantity >= 5) return 13;
  if (quantity >= 3) return 16;
  return 19.9;
}

function tierLabel(quantity: number) {
  if (quantity >= 5) return "5 logements et +";
  if (quantity >= 3) return "3 à 4 logements";
  return "1 à 2 logements";
}

function formatEuros(value: number) {
  return value.toFixed(2).replace(".", ",") + " €";
}

export default function AbonnementSelector() {
  const [quantity, setQuantity] = useState(1);
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthlyUnitPrice = pricePerLogement(quantity);
  const unitPrice = annual ? monthlyUnitPrice * 0.8 : monthlyUnitPrice;
  const total = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);
  const annualTotal = total * 12;

  function updateQuantity(next: number) {
    setQuantity(Math.min(50, Math.max(1, next)));
  }

  async function handleSubscribe() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          interval: annual ? "year" : "month",
        }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
      }
    } catch {
      setError("Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
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

      <div className="mt-6 rounded-2xl border border-night-600 bg-night-900 p-6">
        <p className="text-sm text-mist-400">{tierLabel(quantity)}</p>

        <p className="mt-3 font-display text-4xl text-white">
          {formatEuros(unitPrice)}
          <span className="text-base font-body text-mist-500">
            {" "}
            /logement/mois
          </span>
        </p>
        {annual && (
          <p className="mt-1 text-xs text-mist-500">
            Facturé annuellement — {formatEuros(annualTotal)} / an
          </p>
        )}

        <div className="mt-6">
          <label className="text-sm text-mist-400">Nombre de logements</label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-night-600 text-lg text-white transition hover:border-porch-500"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => updateQuantity(Number(e.target.value))}
              className="h-10 w-16 rounded-xl border border-night-600 bg-night-800 text-center text-white"
            />
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-night-600 text-lg text-white transition hover:border-porch-500"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-night-800 pt-5">
          <span className="text-sm text-mist-400">
            {annual ? "Total mensuel équivalent" : "Total mensuel estimé"}
          </span>
          <span className="font-display text-xl text-white">
            {formatEuros(total)}
          </span>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-porch-500 px-5 py-3 text-sm font-semibold text-night-950 transition hover:bg-porch-400 disabled:opacity-50"
        >
          {loading ? "Redirection..." : "Confirmer l'abonnement"}
        </button>
      </div>
    </div>
  );
}
