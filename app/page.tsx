import Link from "next/link";
import PhoneMock from "./components/PhoneMock";
import DemoForm from "./components/DemoForm";
import PricingSection from "./components/PricingSection";

const problems = [
  {
    title: "23h41, un message arrive",
    text: "Wi-Fi, code du portail, horaire de check-in — toujours les mêmes questions, jamais au bon moment.",
  },
  {
    title: "Le score de réactivité en pâtit",
    text: "Une réponse tardive coûte des points sur Airbnb et Booking, et parfois le statut Superhost.",
  },
  {
    title: "Un numéro, dix logements",
    text: "Vos voyageurs écrivent tous sur le même WhatsApp — impossible de garder ça en tête sans erreur.",
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

export default function Home() {
  return (
    <main>
      {/* HEADER */}
      <div className="border-b border-night-800">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-6 py-4">
          <Link
            href="/login"
            className="rounded-lg bg-porch-500 px-4 py-2 text-sm font-semibold text-night-950 transition hover:bg-porch-400"
          >
            Espace hôte
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-night-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-night-600"
          >
            Inscription
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-night-800">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
              Concierge WhatsApp — LÉO
            </p>
            <h1 className="text-balance font-display text-4xl italic leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Votre concierge qui ne s&apos;endort jamais.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist-400">
              LÉO répond à vos voyageurs sur WhatsApp en moins de 30 secondes,
              24h/24 — sur chacun de vos logements, avec les bonnes
              informations, jamais les mauvaises.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#demo"
                className="rounded-xl bg-porch-500 px-7 py-3.5 text-sm font-semibold text-night-950 shadow-glow transition hover:bg-porch-400"
              >
                Réserver une démo
              </a>
              <a
                href="#comment-ca-marche"
                className="text-sm font-medium text-mist-300 underline decoration-night-600 underline-offset-4 hover:text-white"
              >
                Comment ça marche →
              </a>
            </div>
          </div>
          <PhoneMock />
        </div>
      </section>

      {/* PROBLEM */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-xl font-display text-3xl italic text-white">
            La nuit ne devrait pas être un tour de garde.
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {problems.map((p) => (
              <div key={p.title}>
                <p className="font-display text-lg text-porch-400">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="comment-ca-marche" className="border-b border-night-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-xl font-display text-3xl italic text-white">
            Trois étapes, aucune ligne de code.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <Step
              n="1"
              title="Connectez votre calendrier"
              text="Collez le lien iCal de votre logement (Airbnb, Booking) — deux clics depuis votre back-office."
            />
            <Step
              n="2"
              title="LÉO apprend votre logement"
              text="Wi-Fi, codes d'accès, consignes, recommandations : tout est repris depuis votre fiche."
            />
            <Step
              n="3"
              title="Vos voyageurs écrivent, LÉO répond"
              text="Chaque voyageur est identifié à sa réservation — jamais d'informations mélangées entre logements."
            />
          </div>
        </div>
      </section>

      {/* CE QUE LÉO FAIT VRAIMENT */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Fonctionnalités
          </p>
          <h2 className="max-w-xl font-display text-3xl italic text-white">
            Ce que LÉO fait vraiment, aujourd&apos;hui.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon="⚡"
              title="Réponse en moins de 30 secondes"
              text="24h/24, sur WhatsApp — le voyageur a sa réponse avant même de reposer son téléphone."
            />
            <FeatureCard
              icon="🗺️"
              title="Des activités à réserver, sans quitter la conversation"
              text="LÉO recommande des activités locales et propose la réservation en ligne directement dans l'échange (intégration GetYourGuide)."
            />
            <FeatureCard
              icon="🚨"
              title="Les vraies urgences remontent, le reste non"
              text="Panne, dégât, problème sérieux : vous êtes alerté immédiatement. Pour le Wi-Fi ou le code du portail, LÉO gère seul — vous n'êtes pas dérangé."
            />
          </div>
        </div>
      </section>

      {/* TABLEAU DE BORD */}
      <section className="border-b border-night-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr,1fr] lg:items-center">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
                Inclus avec LÉO
              </p>
              <h2 className="font-display text-3xl italic text-white">
                Un tableau de bord qui vous dit ce qui se passe vraiment.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-400">
                Messages traités par logement, escalades vers vous,
                conversations en cours ou terminées — tout est visible en un
                coup d&apos;œil, sans avoir à rouvrir WhatsApp.
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Feature
                  icon="📊"
                  title="Statistiques par logement"
                  text="Combien de messages, combien d'escalades, sur quelle période."
                />
                <Feature
                  icon="🔔"
                  title="Escalades tracées"
                  text="Chaque alerte envoyée au propriétaire reste visible et datée."
                />
                <Feature
                  icon="🗂️"
                  title="Statut de chaque conversation"
                  text="En cours, à venir, terminée — au fil des réservations."
                />
                <Feature
                  icon="🔍"
                  title="Filtres par date et par logement"
                  text="Retrouvez un échange précis en quelques secondes."
                />
              </div>
            </div>

            <div className="rounded-2xl border border-night-600 bg-night-900 p-1">
              <div className="rounded-xl bg-night-800 px-5 py-5">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs text-mist-400">Activité LÉO — 14 derniers jours</p>
                  <span className="text-xs text-ok">+18% vs période précédente</span>
                </div>
                <p className="mt-1 font-display text-3xl text-white">142</p>

                <div className="mt-5 flex items-end gap-1.5" aria-hidden>
                  {[40, 55, 35, 70, 50, 85, 60, 45, 90, 65, 75, 55].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-porch-500/70"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-night-700 pt-4">
                  <div className="flex items-center justify-between rounded-lg bg-night-700 px-3 py-2 text-xs">
                    <span className="text-white">Appartement Le Marais</span>
                    <span className="rounded-full bg-ok/20 px-2 py-0.5 text-[11px] font-medium text-ok">
                      En cours
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-night-700 px-3 py-2 text-xs">
                    <span className="text-white">Studio Vieux-Port</span>
                    <span className="rounded-full bg-warn/20 px-2 py-0.5 text-[11px] font-medium text-warn">
                      Escaladé
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl italic text-white">
            Un tarif qui baisse avec votre portefeuille.
          </h2>
          <p className="mt-3 max-w-md text-sm text-mist-400">
            Sans engagement. Aucun frais de mise en service. Essai gratuit 14
            jours.
          </p>
          <PricingSection />
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

      {/* DEMO FORM */}
      <section id="demo" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl italic text-white">
          Voyez LÉO répondre, en vrai.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-mist-400">
          Une démo de 15 minutes sur vos propres logements, sans engagement.
        </p>
        <div className="mt-10 text-left">
          <DemoForm />
        </div>
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

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-night-600 bg-night-900 p-6 transition hover:border-porch-500/40">
      <p className="text-2xl">{icon}</p>
      <p className="mt-4 font-display text-lg text-white">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-mist-400">{text}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-lg">{icon}</p>
      <p className="mt-1 text-sm font-semibold text-white">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-mist-500">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-porch-500">Étape {n}</p>
      <p className="mt-2 font-display text-xl text-white">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-mist-400">{text}</p>
    </div>
  );
}
