"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Property = {
  id: string;
  nom: string;
  actif: boolean;
  ical_url: string | null;
};

export default function PropertyCard({ property }: { property: Property }) {
  const router = useRouter();
  const [actif, setActif] = useState(property.actif);
  const [icalUrl, setIcalUrl] = useState(property.ical_url ?? "");
  const [toggling, setToggling] = useState(false);
  const [savingIcal, setSavingIcal] = useState(false);
  const [icalSaved, setIcalSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Nouvel état pour stocker le nombre de messages
  const [messageCount, setMessageCount] = useState<number | null>(null);

  // Le webhook n8n et son secret ne doivent jamais être appelés depuis le
  // navigateur (n'importe qui peut les lire dans l'onglet réseau). On passe
  // par notre propre route serveur, qui vérifie la session puis relaie
  // l'appel à n8n avec le secret côté serveur uniquement.
  useEffect(() => {
    async function fetchMessageStats() {
      try {
        const res = await fetch(
          `/api/message-stats?property_id=${property.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setMessageCount(data.count);
        }
      } catch (error) {
        console.error("Erreur de récupération des statistiques :", error);
      }
    }
    fetchMessageStats();
  }, [property.id]);

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
        <div>
          <p className="font-display text-lg text-white">{property.nom}</p>
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
            Supprimer &laquo; {property.nom} &raquo; ? Cette action est
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
