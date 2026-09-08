import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FloatingWhatsAppButton from "../components/FloatingWhatsAppButton";

export default function FonctionnalitesPage() {
  return (
    <main>
      <SiteHeader />

      {/* HERO */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Fonctionnalités
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl italic leading-[1.1] text-white sm:text-5xl">
            Ce que LÉO fait vraiment, aujourd&apos;hui.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-mist-400">
            Pas une liste de promesses — ce qui tourne réellement en
            production, sur les logements de nos hôtes.
          </p>
        </div>
      </section>

      {/* CE QUE LÉO FAIT VRAIMENT */}
      <section className="border-b border-night-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
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
      <section className="border-b border-night-800 bg-night-900/40">
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

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
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

      <SiteFooter />
      <FloatingWhatsAppButton />
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
