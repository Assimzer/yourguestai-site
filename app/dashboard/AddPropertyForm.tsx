"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPropertyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/create-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Échec de la création.");
      setStatus("error");
      return;
    }

    setNom("");
    setOpen(false);
    setStatus("idle");
    router.refresh(); // recharge la liste des logements côté serveur
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-dashed border-night-600 px-4 py-2.5 text-sm font-medium text-mist-300 transition hover:border-porch-500 hover:text-porch-400"
      >
        <span className="text-porch-500">+</span> Ajouter un logement
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-night-600 bg-night-900 p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="text-xs text-mist-400">Nom du logement</label>
        <input
          type="text"
          required
          autoFocus
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: Airbnb Arbois, Studio centre-ville..."
          className="mt-1 w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
        />
        {status === "error" && (
          <p className="mt-1 text-xs text-warn">{errorMsg}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-porch-500 px-4 py-2 text-sm font-semibold text-night-950 transition hover:bg-porch-400 disabled:opacity-60"
        >
          {status === "loading" ? "Création..." : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setErrorMsg("");
          }}
          className="rounded-lg border border-night-600 px-4 py-2 text-sm text-mist-400 transition hover:text-white"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
