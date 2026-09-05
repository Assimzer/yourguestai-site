"use client";

import { useEffect, useState } from "react";
import PropertyCard from "../PropertyCard";

type Property = {
  id: string;
  nom: string;
  actif: boolean;
  ical_url: string | null;
};

export default function LogementsGrid({ properties }: { properties: Property[] }) {
  // Un seul fetch groupe pour tous les logements, plutot qu'un appel
  // /api/message-stats par carte (qui multipliait les requetes Airtable et
  // finissait par declencher un 429 RATE_LIMIT_REACHED cote n8n).
  const [countsByLogement, setCountsByLogement] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/messages", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !Array.isArray(data.by_logement)) return;
        const map: Record<string, number> = {};
        for (const l of data.by_logement as { logement: string; message_count: number }[]) {
          map[l.logement] = l.message_count;
        }
        setCountsByLogement(map);
      })
      .catch(() => {
        // Pas bloquant : les cartes s'affichent simplement sans compteur.
      });
  }, []);

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      {properties.map((p) => (
        <PropertyCard
          key={p.id}
          property={p}
          messageCount={countsByLogement[p.nom] ?? null}
        />
      ))}
    </div>
  );
}
