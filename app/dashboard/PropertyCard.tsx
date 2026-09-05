"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Property = {
  id: string;
  nom: string;
  actif: boolean;
  ical_url: string | null;
};

export default function PropertyCard({
  property,
  messageCount = null,
}: {
  property: Property;
  // Passe par le parent (un seul fetch groupe via /api/messages) plutot que
  // par un fetch individuel ici : evite de multiplier les appels a
  // /api/message-stats (un par carte -> limite de debit Airtable atteinte
  // des 5-6 logements charges en meme temps).
  messageCount?: number | null;
}) {
  const router = useRouter();
  const [actif, setActif] = useState(property.actif);
  const [icalUrl, setIcalUrl] = useState(property.ical_url ?? "");
  const [toggling, setToggling] = useState(false);
  const [savingIcal, setSavingIcal] = useState(false);
  const [icalSaved, setIcalSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nomDraft, setNomDraft] = useState(property.nom);
  const [nom, setNom] = useState(property.nom);
  const [savingNom, setSavingNom] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !actif;
    setToggling(true);
    setToggleError(null);
    setActif(next); // optimiste

    const res = await fetch("/api/toggle-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: property.id, actif: next }),
    });

    if (!res.ok) {
      setActif(actif); // rollback si echec
      if (res.status === 402) {
        setToggleError("Un abonnement actif est requis pour activer ce logement.");
      } else {
        setToggleError("Une erreur est survenue, réessayez.");
      }
    }
    setToggling(false);
  }

  async function handleIcalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingIcal(true);
    setIcalSaved(false);

    const res = await fetch("/api/connect-ical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: property.id, ical_url: icalUrl }),
    });

    setSavingIcal(false);
    if (res.ok) setIcalSaved(true);
  }

  async function handleRename() {
    const trimmed = nomDraft.trim();
    if (trimmed.length < 2 || trimmed === nom) {
      setRenaming(false);
      setNomDraft(nom);
      return;
    }

    setSavingNom(true);
    setRenameError(null);

    const res = await fetch("/api/rename-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: property.id, nom: trimmed }),
    });

    setSavingNom(false);

    if (res.ok) {
      setNom(trimmed);
      setRenaming(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setRenameError(data.error ?? "Une erreur est survenue.");
    }
  }

  async function handleDelete() {
    setDeleting(true);

    const res = await fetch("/api/delete-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: property.id }),
    });

    if (res.ok) {
      router.refresh(); // recharge la liste, la carte disparait
    } else {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="rounded-2xl border border-night-600 bg-night-900 p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nomDraft}
                onChange={(e) => setNomDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setRenaming(false);
                    setNomDraft(nom);
                  }
                }}
                className="rounded-lg border border-night-600 bg-night-800 px-2 py-1 font-display text-lg text-white focus:border-porch-500"
              />
              <button
                onClick={handleRename}
                disabled={savingNom}
                className="rounded-md bg-porch-500 px-2.5 py-1 text-xs font-semibold text-night-950 transition hover:bg-porch-400 disabled:opacity-60"
              >
                {savingNom ? "..." : "OK"}
              </button>
              <button
                onClick={() => {
                  setRenaming(false);
                  setNomDraft(nom);
                }}
                disabled={savingNom}
                className="text-xs text-mist-400 hover:text-white"
              >
                Annuler
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-2 font-display text-lg text-white">
              {nom}
              <button
                onClick={() => {
                  setNomDraft(nom);
                  setRenameError(null);
                  setRenaming(true);
                }}
                title="Renommer ce logement"
                className="text-mist-500 transition hover:text-porch-400"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
              </button>
            </p>
          )}
          {renameError && <p className="mt-1 text-xs text-warn">{renameError}</p>}
          {/* Affichage du compteur de messages */}
          {messageCount !== null && (
            <p className="text-xs text-mist-400 mt-1">
              Messages répondus : <span className="text-porch-500 font-medium">{messageCount}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={toggling}
            aria-pressed={actif}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
              actif
                ? "border-ok/40 bg-ok/10 text-ok"
                : "border-night-600 bg-night-800 text-mist-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                actif ? "bg-ok" : "bg-mist-500"
              }`}
            />
            {actif ? "LÉO actif" : "LÉO en pause"}
          </button>

          <button
            onClick={() => setConfirmingDelete(true)}
            title="Supprimer ce logement"
            className="rounded-full border border-night-600 p-1.5 text-mist-500 transition hover:border-warn/40 hover:text-warn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
            </svg>
          </button>
        </div>
      </div>

      {toggleError && (
        <p className="mt-3 text-xs text-warn">
          {toggleError}{" "}
          {toggleError.includes("abonnement") && (
            <Link href="/dashboard/compte" className="underline">
              Gérer mon abonnement
            </Link>
          )}
        </p>
      )}

      <form onSubmit={handleIcalSubmit} className="mt-5 flex flex-col gap-2">
        <label className="text-xs text-mist-400">
          Lien iCal (Airbnb, Booking...)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={icalUrl}
            onChange={(e) => {
              setIcalUrl(e.target.value);
              setIcalSaved(false);
            }}
            placeholder="https://www.airbnb.fr/calendar/ical/..."
            className="flex-1 rounded-lg border border-night-600 bg-night-800 px-3 py-2 font-mono text-xs text-white placeholder:text-mist-500 focus:border-porch-500"
          />
          <button
            type="submit"
            disabled={savingIcal || !icalUrl}
            className="rounded-lg bg-night-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-night-700/60 disabled:opacity-60"
          >
            {savingIcal ? "..." : "Enregistrer"}
          </button>
        </div>
        {icalSaved && <p className="text-xs text-ok">Calendrier connecté.</p>}
      </form>

      <div className="mt-4 border-t border-night-700 pt-4">
        <Link
          href={`/dashboard/logements/${property.id}/guide`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-night-600 bg-night-800 px-4 py-2.5 text-xs font-medium text-mist-400 transition hover:border-porch-500/40 hover:text-white"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Éditer le livret d'accueil
        </Link>
      </div>

      {confirmingDelete && (
        <div className="mt-4 rounded-lg border border-warn/30 bg-warn/10 p-3">
          <p className="text-xs text-white">
            Supprimer &laquo; {nom} &raquo; ? Cette action est
            définitive.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md bg-warn px-3 py-1.5 text-xs font-semibold text-night-950 transition hover:opacity-90 disabled:opacity-60"
            >
              {deleting ? "Suppression..." : "Confirmer"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="rounded-md border border-night-600 px-3 py-1.5 text-xs text-mist-400 transition hover:text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
