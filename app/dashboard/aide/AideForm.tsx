"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "yourguestai@gmail.com";

export default function AideForm({ userEmail }: { userEmail: string }) {
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const corps = `${message}\n\n—\nEnvoyé depuis l'espace hôte YourGuestAI (${userEmail})`;
    const lien = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      sujet || "Demande d'aide"
    )}&body=${encodeURIComponent(corps)}`;

    window.location.href = lien;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-mist-400">
          Sujet
        </label>
        <input
          type="text"
          required
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          placeholder="Ex : problème avec mes réservations"
          className="w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-mist-400">
          Décrivez votre problème
        </label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Expliquez ce qui ne fonctionne pas, ce que vous avez essayé, et sur quel logement si besoin..."
          className="w-full resize-none rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-porch-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-porch-600"
      >
        Envoyer par email
      </button>

      <p className="text-xs text-mist-500">
        Ouvre votre application mail avec le message pré-rempli, adressé à{" "}
        {SUPPORT_EMAIL}.
      </p>
    </form>
  );
}
