import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import TarifsCalculator from "./TarifsCalculator";

const features = [
  {
    title: "Concierge IA 24h/24, multilingue",
    text: "LÉO répond aux voyageurs en moins de 30 secondes, à toute heure — il détecte automatiquement la langue du voyageur et répond dans cette même langue.",
  },
  {
    title: "Un livret d'accueil par logement",
    text: "Adresse, parking, équipements (avec photos à l'appui), règles de la maison : chaque logement a ses propres informations, jamais mélangées.",
  },
  {
    title: "Synchronisation de votre calendrier",
    text: "Connectez le lien iCal de votre logement (Airbnb, Booking.com...) pour que LÉO identifie chaque voyageur à sa réservation.",
  },
  {
    title: "Escalade vers vous en cas d'urgence",
    text: "Panne, dégât, problème sérieux : vous êtes alerté immédiatement par WhatsApp. Pour le reste, LÉO gère seul.",
  },
  {
    title: "Tableau de bord d'activité",
    text: "Volume de messages, réservations à venir, escalades récentes et statut de chaque logement, en un coup d'œil.",
  },
  {
    title: "Un compte protégé, par hôte",
    text: "Chaque hôte n'a accès qu'à ses propres logements et conversations, depuis un espace personnel sécurisé.",
  },
];

const faqs = [
  {
    q: "Que se passe-t-il si j'ajoute un logement supplémentaire ?",
    a: "Le tarif par logement s'ajuste automatiquement au palier correspondant dès que vous ajoutez un logement depuis votre tableau de bord — aucune démarche manuelle nécessaire.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Oui. Aucun engagement de durée : vous pouvez suspendre ou résilier un logement depuis votre espace hôte quand vous le souhaitez.",
  },
  {
    q: "Combien coûte la mise en service ?",
    a: "Rien. La mise en route (connexion du calendrier, remplissage du livret d'accueil) est gratuite et prend quelques minutes.",
  },
  {
    q: "Quand commence la facturation ?",
    a: "Après votre essai gratuit de 14 jours. Vous pouvez annuler avant la fin de l'essai sans être facturé.",
  },
  {
    q: "LÉO remplace-t-il mon calendrier ou mon PMS ?",
    a: "Non. LÉO se connecte à votre calendrier existant via un lien iCal pour suivre vos réservations — il ne remplace aucun outil que vous utilisez déjà.",
  },
];

export default function TarifsPage() {
  return (
    <main>
      <SiteHeader />

      {/* HERO */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-porch-500/30 bg-porch-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-porch-400">
            Tarifs par logement · Plus simple, plus juste
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl italic leading-[1.1] text-white sm:text-5xl">
            Un prix qui s&apos;adapte à votre portefeuille,{" "}
            <span className="text-porch-400">pas l&apos;inverse.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-mist-400">
            Trois paliers, prix unitaire par logement, facturation mensuelle
            ou annuelle. Sans engagement : vous résiliez quand vous voulez.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-porch-500 px-7 py-3.5 text-sm font-semibold text-night-950 shadow-glow transition hover:bg-porch-400"
            >
              Essayer LÉO
            </Link>
            <a
              href="#demo"
              className="rounded-xl border border-night-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-porch-500/40"
            >
              Parler à un humain
            </a>
          </div>
          <p className="mt-4 text-xs text-mist-500">
            Mise en route en quelques minutes · Sans engagement · Résiliable
            à tout moment
          </p>
        </div>
      </section>

      {/* CALCULATEUR */}
      <section className="border-b border-night-800">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Tarifs
          </p>
          <h2 className="mt-3 text-center font-display text-3xl italic text-white">
            Plus vous gérez de logements, moins vous payez.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-mist-400">
            Un seul plan, toutes les fonctionnalités incluses. Le prix par
            logement baisse à mesure que votre portefeuille grandit.
          </p>

          <div className="mt-10">
            <TarifsCalculator />
          </div>
        </div>
      </section>

      {/* ARGUMENTS */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Inclus dans tous les paliers
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-center font-display text-3xl italic text-white">
            Ce que vous obtenez, sans suppléments.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-night-600 bg-night-900 p-6"
              >
                <span className="text-ok">✓</span>
                <p className="mt-3 text-sm font-semibold text-white">
                  {f.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-night-800">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Questions fréquentes
          </p>
          <h2 className="mt-3 text-center font-display text-3xl italic text-white">
            Tout ce que vous devez savoir avant de commencer.
          </h2>

          <div className="mt-10 flex flex-col gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-night-600 bg-night-900 px-5 py-4 open:border-porch-500/40"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-mist-500 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-mist-400">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl italic text-white">
          Voyez LÉO répondre, en vrai.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-mist-400">
          Une démo de 15 minutes sur vos propres logements, sans engagement.
        </p>
        <Link
          href="/#demo"
          className="mt-8 inline-block rounded-xl bg-porch-500 px-7 py-3.5 text-sm font-semibold text-night-950 shadow-glow transition hover:bg-porch-400"
        >
          Réserver une démo
        </Link>
      </section>

      <footer className="border-t border-night-800 px-6 py-10 text-center text-xs text-mist-500">
        <p>YOURGUESTAI — LÉO</p>
        <Link href="/login" className="mt-2 inline-block hover:text-mist-300">
          Espace hôte
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/mentions-legales" className="hover:text-mist-300">
            Mentions légales
          </Link>
          <Link href="/cgu-cgv" className="hover:text-mist-300">
            CGU/CGV
          </Link>
          <Link href="/politique-confidentialite" className="hover:text-mist-300">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </main>
  );
}
