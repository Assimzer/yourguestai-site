import PhoneMock from "./components/PhoneMock";
import DemoForm from "./components/DemoForm";
import PricingCalculator from "./components/PricingCalculator";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import SubNav from "./components/SubNav";
import AnimatedGradientText from "./components/AnimatedGradientText";
import RatingCard from "./components/RatingCard";
import HubSpokeDiagram from "./components/HubSpokeDiagram";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";

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
      <SiteHeader />
      <SubNav />

      {/* HERO */}
      <section id="hero" className="relative overflow-hidden border-b border-night-800">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
              Concierge WhatsApp — LÉO
            </p>
            <h1 className="text-balance font-display text-4xl italic leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Votre concierge qui{" "}
              <AnimatedGradientText>ne s&apos;endort jamais</AnimatedGradientText>.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist-400">
              LÉO répond à vos voyageurs sur WhatsApp en moins de 30 secondes,
              24h/24 — sur chacun de vos logements, avec les bonnes
              informations.
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

      {/* AUTOMATISATIONS DES PLATEFORMES */}
      <section className="border-b border-night-800">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="rounded-full border border-night-600 bg-night-900 px-4 py-1.5 text-sm text-white">
              Airbnb · Booking
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist-500">
              vs
            </span>
            <span className="rounded-full border border-night-600 bg-night-900 px-4 py-1.5 text-sm text-white">
              WhatsApp
            </span>
          </div>

          <h2 className="mt-8 text-balance font-display text-3xl italic leading-tight text-white sm:text-4xl">
            Les plateformes savent envoyer un message.{" "}
            <span className="text-porch-400">
              Elles ne savent pas répondre à votre voyageur.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-mist-400">
            Vous programmez une réponse automatique sur Airbnb déclenchée par
            le mot « wifi ». Mais à 23h41, votre voyageuse écrit sur WhatsApp
            : <em>« Le chauffage ne s&apos;allume pas, il fait 8°C dans le
            salon, je fais quoi ? »</em> — un modèle de message ne sait pas
            répondre à ça. LÉO, lui, comprend la question, va chercher la
            consigne exacte de votre logement, et répond en quelques
            secondes. Si le problème dépasse ce qu&apos;il peut résoudre, il
            vous escalade l&apos;alerte immédiatement.
          </p>
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

      {/* HUB AND SPOKE */}
      <section id="hub" className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Un seul numéro
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-balance font-display text-3xl italic text-white">
            Tous vos voyageurs, tous vos logements, une seule IA.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-mist-400">
            LÉO reçoit chaque message sur le même numéro WhatsApp et sait
            exactement à quel voyageur et quel logement il répond — jamais
            d&apos;informations mélangées.
          </p>

          <div className="mt-14">
            <HubSpokeDiagram />
          </div>

          <div className="mt-14">
            <RatingCard />
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="border-b border-night-800 bg-night-900/40">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
            Tarifs
          </p>
          <h2 className="mt-3 text-center font-display text-3xl italic text-white">
            Plus vous gérez de logements, moins vous payez.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-mist-400">
            Un seul plan, toutes les fonctionnalités incluses. Sans
            engagement. Aucun frais de mise en service. Essai gratuit 14
            jours.
          </p>

          <div className="mt-10">
            <PricingCalculator />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-night-800">
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

      <SiteFooter />
      <FloatingWhatsAppButton />
    </main>
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
