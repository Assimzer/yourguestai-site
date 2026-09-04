"use client";

import { useEffect, useState } from "react";

type Conversation = {
  telephone: string;
  logement: string;
  message_count: number;
  last_date: string;
  last_sens: string;
};

function formatRelative(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / 3_600_000;

  if (diffHours < 1) return "À l'instant";
  if (diffHours < 24) return `Il y a ${Math.floor(diffHours)}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function sensBadge(sens: string) {
  const s = sens.toLowerCase();
  if (s.includes("sortant")) {
    return { label: "LÉO a répondu", className: "bg-porch-500/20 text-porch-400" };
  }
  if (s.includes("entrant")) {
    return { label: "Voyageur a écrit", className: "bg-ok/20 text-ok" };
  }
  return { label: sens || "—", className: "bg-night-800 text-mist-400" };
}

export default function MessagesList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/messages", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setConversations(data.messages);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-mist-400">Chargement des conversations…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-warn">
        Impossible de charger les messages : {error}
      </p>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-night-600 px-6 py-12 text-center">
        <p className="text-sm text-mist-400">Aucun échange pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {conversations.map((c) => {
        const badge = sensBadge(c.last_sens);
        return (
          <div
            key={`${c.telephone}-${c.logement}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-night-600 bg-night-900 p-4"
          >
            <div>
              <p className="text-sm font-medium text-white">
                {c.telephone || "Numéro inconnu"}
                <span className="ml-2 text-xs text-mist-500">{c.logement}</span>
              </p>
              <p className="mt-0.5 text-xs text-mist-400">
                {c.message_count} message{c.message_count > 1 ? "s" : ""} ·{" "}
                {formatRelative(c.last_date)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
