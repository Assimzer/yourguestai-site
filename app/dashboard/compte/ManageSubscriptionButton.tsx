"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleManage() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Erreur inconnue");
      }
      window.location.href = data.url;
    } catch (e) {
      console.error("Erreur ouverture portail:", e);
      setError("Impossible d'ouvrir le portail Stripe pour le moment. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleManage}
        disabled={loading}
        className="rounded-xl border border-night-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Ouverture..." : "Gérer mon abonnement"}
      </button>
      {error && <p className="mt-2 text-xs text-warn">{error}</p>}
    </div>
  );
}
