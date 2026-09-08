import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";
import LegalPageNav from "../components/LegalPageNav";

export const metadata: Metadata = {
  title: "Liste des sous-traitants — YOURGUESTAI",
  description:
    "Liste à jour des sous-traitants du traitement auxquels YOURGUESTAI confie des opérations de traitement des données personnelles.",
};

const subprocessors = [
  {
    name: "Meta Platforms Ireland Ltd",
    service: "WhatsApp Business Platform — acheminement des messages",
    country: "Irlande / États-Unis",
    guarantee: "Clauses contractuelles types (CCT)",
  },
  {
    name: "OpenRouter, Inc. (relayant vers Google Gemini)",
    service: "Génération des réponses de LÉO — traitement du langage naturel",
    country: "États-Unis",
    guarantee: "Clauses contractuelles types (CCT)",
  },
  {
    name: "Airtable, Inc.",
    service: "Stockage des logements, réservations et conversations",
    country: "États-Unis",
    guarantee: "Clauses contractuelles types (CCT)",
  },
  {
    name: "n8n GmbH",
    service: "Orchestration des automatisations et de l'agent conversationnel",
    country: "Union européenne",
    guarantee: "N/A (données hébergées en UE)",
  },
  {
    name: "Supabase, Inc.",
    service: "Authentification et données du compte hôte",
    country: "États-Unis",
    guarantee: "Clauses contractuelles types (CCT)",
  },
  {
    name: "OVH SAS",
    service: "Hébergement du site et du tableau de bord (serveur VPS)",
    country: "Canada (datacenter Beauharnois)",
    guarantee: "Décision d'adéquation (Canada)",
  },
  {
    name: "Stripe, Inc. / Stripe Payments Europe Ltd",
    service: "Gestion des paiements et abonnements",
    country: "Irlande / États-Unis",
    guarantee: "Clauses contractuelles types (CCT)",
  },
];

export default function SousTraitantsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <Logo className="text-lg" />

      <h1 className="mt-10 font-display text-3xl italic text-white">
        Liste des sous-traitants
      </h1>
      <p className="mt-2 text-sm text-mist-500">
        Dernière mise à jour : 8 septembre 2026 · Version 1.0
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-mist-300">
        <p>
          Au titre de l&apos;article 28 du Règlement (UE) 2016/679 (RGPD),
          voici la liste à jour des sous-traitants ultérieurs auxquels
          YOURGUESTAI confie des opérations spécifiques de traitement des
          données personnelles dans le cadre du service LÉO. Cette liste
          complète l&apos;article 6 de notre{" "}
          <Link href="/dpa" className="underline decoration-night-600 underline-offset-4 hover:text-white">
            accord sur le traitement des données (DPA)
          </Link>.
        </p>

        <div className="overflow-x-auto rounded-xl border border-night-700">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-night-700 bg-night-900 text-mist-400">
                <th className="px-4 py-3 font-medium">Fournisseur</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Pays</th>
                <th className="px-4 py-3 font-medium">Garantie de transfert</th>
              </tr>
            </thead>
            <tbody>
              {subprocessors.map((s, i) => (
                <tr
                  key={s.name}
                  className={`border-b border-night-800 last:border-0 ${
                    i % 2 === 1 ? "bg-night-900/40" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                  <td className="px-4 py-3 text-mist-400">{s.service}</td>
                  <td className="px-4 py-3 text-mist-400">{s.country}</td>
                  <td className="px-4 py-3 text-mist-400">{s.guarantee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-mist-500">
          Les données personnelles des voyageurs ne sont jamais utilisées
          pour entraîner un modèle d&apos;intelligence artificielle. Toute
          modification de cette liste (ajout ou remplacement d&apos;un
          sous-traitant) est communiquée aux clients avec un préavis minimum
          de 15 jours, conformément à notre DPA.
        </p>

        <p className="text-xs text-mist-500">Contact : yourguestai@gmail.com</p>
      </div>

      <LegalPageNav current="/sous-traitants" />
    </main>
  );
}
