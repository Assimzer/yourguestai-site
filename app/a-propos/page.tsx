import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "À propos — YOURGUESTAI",
  description:
    "YOURGUESTAI est né pour les hôtes qui gèrent leurs voyageurs sur WhatsApp. Notre mission, nos principes, et pourquoi LÉO reste au service de l'hospitalité humaine.",
};

const principles = [
  {
    icon: "🧭",
    title: "Conçu avec des hôtes, pas dans un bureau",
    text: "Chaque fonctionnalité de LÉO part d'une vraie question posée par un hôte qui gère ses voyageurs au quotidien — pas d'une idée abstraite.",
  },
  {
    icon: "🔒",
    title: "RGPD dès la conception, pas en rustine",
    text: "Aucun message de voyageur n'est utilisé pour entraîner un modèle d'IA. DPA disponible en un clic, liste des sous-traitants publique et à jour.",
  },
  {
    icon: "🤝",
    title: "Le voyageur parle à un humain quand ça compte",
    text: "LÉO absorbe les questions répétitives. Dès qu'une vraie urgence surgit, il vous alerte immédiatement et vous reprenez la main.",
  },
  {
    icon: "🏠",
    title: "Pensé pour les hôtes indépendants",
    text: "Que vous gériez un seul logement ou une petite conciergerie, LÉO s'adapte à la taille de votre portefeuille sans jamais vous imposer les outils d'une chaîne hôtelière.",
  },
];

export default function AProposPage() {
  return (
    <main>
      <SiteHeader />

      {/* HERO */}
      <section className="border-b border-night-800 bg-porch-glow">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Notre mission
          </p>
          <h1 className="mt-5 text-balance font-display text-4xl italic leading-[1.1] text-white sm:text-5xl">
            Rendre les nuits aux hôtes,{" "}
            <span className="text-porch-400">sans jamais remplacer l&apos;accueil.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mist-400">
            YOURGUESTAI est né pour les hôtes qui gèrent leurs voyageurs sur
            WhatsApp. LÉO prend en charge les questions répétitives — codes
            d&apos;accès, horaires, Wi-Fi — pour que vous gardiez l&apos;énergie
            pour ce qui compte vraiment : l&apos;accueil.
          </p>
        </div>
      </section>

      {/* PRINCIPES */}
      <section className="border-b border-night-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Comment on travaille
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl italic text-white">
            Quatre principes, aucun compromis.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-night-600 bg-night-900 p-6 transition hover:border-porch-500/40"
              >
                <p className="text-2xl">{p.icon}</p>
                <p className="mt-4 font-display text-lg text-white">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFORMITÉ */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Conçu en France
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl italic text-white">
            Conforme au RGPD, pensé pour les hôtes indépendants.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-night-600 bg-night-900 p-6">
              <p className="text-xl">🔐</p>
              <p className="mt-3 font-display text-lg text-white">RGPD compliant</p>
              <p className="mt-1 text-sm text-mist-400">
                <Link href="/dpa" className="underline decoration-night-600 underline-offset-4 hover:text-white">
                  DPA disponible en ligne
                </Link>{" "}
                — hébergement en UE, aucun entraînement d&apos;IA sur vos
                données voyageurs.
              </p>
            </div>
            <div className="rounded-2xl border border-night-600 bg-night-900 p-6">
              <p className="text-xl">🌍</p>
              <p className="mt-3 font-display text-lg text-white">
                Répond dans la langue du voyageur
              </p>
              <p className="mt-1 text-sm text-mist-400">
                LÉO s&apos;adapte automatiquement à la langue utilisée sur
                WhatsApp, sans configuration de votre part.
              </p>
            </div>
            <div className="rounded-2xl border border-night-600 bg-night-900 p-6">
              <p className="text-xl">🏘️</p>
              <p className="mt-3 font-display text-lg text-white">
                De 1 à 30 logements
              </p>
              <p className="mt-1 text-sm text-mist-400">
                Du loueur unique à la petite conciergerie, sans jamais
                changer d&apos;outil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="font-display text-3xl italic text-white">
          Envie de voir LÉO à l&apos;œuvre ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-mist-400">
          Essai gratuit 14 jours, sans engagement.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-porch-500 px-7 py-3.5 text-sm font-semibold text-night-950 shadow-glow transition hover:bg-porch-400"
        >
          Commencer
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
