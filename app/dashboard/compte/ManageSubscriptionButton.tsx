"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Erreur ouverture portail:", data.error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="rounded-xl border border-night-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "Ouverture..." : "Gérer mon abonnement"}
    </button>
  );
}
