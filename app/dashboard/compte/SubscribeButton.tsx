"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/stripe/create-subscription", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Erreur création abonnement:", data.error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-night-900 disabled:opacity-50"
    >
      {loading ? "Redirection..." : "S'abonner"}
    </button>
  );
}
