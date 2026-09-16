"use client";

import { useEffect, useState } from "react";
import StatCard from "./StatCard";

type Reliability = {
  avg_response_seconds: number | null;
  automation_rate: number | null;
  conversation_count: number;
};

function formatResponseTime(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function formatAutomationRate(rate: number | null) {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)}%`;
}

// Badge de fiabilite : temps de reponse moyen de LEO et part des
// conversations resolues sans escalade au proprietaire. Donnees calculees
// cote serveur (getMessagesData) a partir de l'historique reel des
// messages -- pas de chiffre invente.
export default function ReliabilityStats() {
  const [reliability, setReliability] = useState<Reliability | null>(null);

  useEffect(() => {
    fetch("/api/messages", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.reliability) setReliability(data.reliability);
      })
      .catch(() => {});
  }, []);

  if (!reliability || reliability.conversation_count === 0) return null;

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Temps de réponse moyen de LÉO"
        value={formatResponseTime(reliability.avg_response_seconds)}
        accent="ok"
      />
      <StatCard
        label="Séjours gérés sans intervention"
        value={formatAutomationRate(reliability.automation_rate)}
        accent="ok"
      />
    </div>
  );
}
