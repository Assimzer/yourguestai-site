import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/" className="font-display text-lg italic text-white">
        YOURGUESTAI
      </Link>

      <h1 className="mt-10 font-display text-3xl italic text-white">
        Politique de confidentialité
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-mist-300">
        <p>
          Cette politique décrit comment YOURGUESTAI collecte, utilise et
          protège les données personnelles des hôtes et des voyageurs,
          conformément au RGPD.
        </p>

        <section>
          <h2 className="font-display text-lg text-white">
            Données collectées
          </h2>
          <p className="mt-2">
            Côté hôte : identité, email, informations de logement. Côté
            voyageur : numéro de téléphone WhatsApp, nom (si renseigné),
            contenu des conversations avec LÉO, code de conversation, dates
            de séjour.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Sous-traitants</h2>
          <p className="mt-2">
            Google Gemini (via OpenRouter) pour la génération des réponses,
            Airtable pour le stockage opérationnel, n8n pour
            l&apos;automatisation, Meta (WhatsApp Business Platform) pour
            l&apos;acheminement des messages, Supabase pour
            l&apos;authentification, Vercel pour l&apos;hébergement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Vos droits</h2>
          <p className="mt-2">
            Droit d&apos;accès, de rectification, d&apos;effacement, de
            limitation, d&apos;opposition et de portabilité. Contactez
            yourguestai@gmail.com pour exercer ces droits. Vous pouvez
            également saisir la CNIL (www.cnil.fr).
          </p>
        </section>

        <p className="text-xs text-mist-500">Contact : yourguestai@gmail.com</p>
      </div>
    </main>
  );
}
