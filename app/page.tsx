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

export default function Home() {
  return (
    <main>
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
              LÉO répond à vos voyageurs sur WhatsApp en moins de 3 secondes,
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

      {/* LIVRET D'ACCUEIL */}
      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr,1fr] lg:items-center">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
                Inclus avec LÉO
              </p>
              <h2 className="font-display text-3xl italic text-white">
                Un livret d&apos;accueil que vos voyageurs consultent avant
                même d&apos;écrire.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-400">
                Wifi, codes d&apos;accès, règles, bons plans du quartier —
                généré automatiquement depuis la fiche de votre logement,
                accessible par un simple lien, sans application à installer.
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Feature
                  icon="⚡"
                  title="Généré automatiquement"
                  text="Vos infos Airtable alimentent le livret sans ressaisie."
                />
                <Feature
                  icon="📱"
                  title="Un lien, aucune app"
                  text="Envoyé sur WhatsApp, ouvert en un tap sur tous les téléphones."
                />
                <Feature
                  icon="💬"
                  title="Moins de messages à LÉO"
                  text="Le voyageur trouve seul l'essentiel avant d'écrire."
                />
                <Feature
                  icon="🔄"
                  title="Toujours à jour"
                  text="Une modification dans Airtable, et le livret suit."
                />
              </div>
            </div>

            <div className="rounded-2xl border border-night-600 bg-night-900 p-1">
              <div className="rounded-xl bg-night-800 px-5 py-4">
                <p className="font-display text-sm italic text-porch-400">
                  Livret — Airbnb Arbois
                </p>
                <div className="mt-4 flex flex-col gap-2 text-xs text-mist-400">
                  <p className="rounded-lg bg-night-700 px-3 py-2">
                    🔑 Code du portail : <span className="font-mono text-white">4752</span>
                  </p>
                  <p className="rounded-lg bg-night-700 px-3 py-2">
                    📶 Wifi : <span className="font-mono text-white">Livebox_BF88</span>
                  </p>
                  <p className="rounded-lg bg-night-700 px-3 py-2">
                    🕒 Check-in dès 15h · Check-out avant 11h
                  </p>
                  <p className="rounded-lg bg-night-700 px-3 py-2">
                    🍽️ Nos adresses préférées à Arbois
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl italic text-white">
            Un tarif qui baisse avec votre portefeuille.
          </h2>
          <p className="mt-3 max-w-md text-sm text-mist-400">
            Sans engagement. Aucun frais de mise en service.
          </p>
          <PricingSection />
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
