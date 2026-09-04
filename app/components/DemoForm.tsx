"use client";

import { useState } from "react";

export default function DemoForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      nom: (form.elements.namedItem("nom") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      nb_logements: (form.elements.namedItem("nb_logements") as HTMLInputElement)
        .value,
    };

    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-ok/30 bg-ok/10 px-5 py-4 text-sm text-white">
        Demande envoyée. On vous répond sous 24h pour caler une démo en direct.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        name="nom"
        type="text"
        required
        placeholder="Votre nom"
        className="flex-1 rounded-xl border border-night-600 bg-night-900 px-4 py-3 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Votre email"
        className="flex-1 rounded-xl border border-night-600 bg-night-900 px-4 py-3 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
      />
      <input
        name="nb_logements"
        type="number"
        min={1}
        placeholder="Nb logements"
        className="w-full sm:w-36 rounded-xl border border-night-600 bg-night-900 px-4 py-3 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-porch-500 px-6 py-3 text-sm font-semibold text-night-950 transition hover:bg-porch-400 disabled:opacity-60"
      >
        {status === "sending" ? "Envoi..." : "Réserver une démo"}
      </button>
      {status === "error" && (
        <p className="text-sm text-warn">
          Un souci est survenu — réessayez ou écrivez-nous directement.
        </p>
      )}
    </form>
  );
}
