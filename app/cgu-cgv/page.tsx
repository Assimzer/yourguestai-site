import Logo from "../components/Logo";
import LegalPageNav from "../components/LegalPageNav";

export default function CguCgvPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Logo className="text-lg" />

      <h1 className="mt-10 font-display text-3xl italic text-white">
        Conditions générales d&apos;utilisation et de vente
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-mist-300">
        <section>
          <h2 className="font-display text-lg text-white">1. Objet</h2>
          <p className="mt-2">
            Les présentes CGU/CGV régissent l&apos;accès et l&apos;utilisation
            du service YOURGUESTAI et de son assistant IA LÉO, destiné aux
            hôtes et conciergeries de locations de courte durée. Toute
            inscription implique leur acceptation pleine et entière.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">2. Essai gratuit</h2>
          <p className="mt-2">
            Tout nouvel hôte bénéficie d&apos;une période d&apos;essai
            gratuit de 14 jours à compter de la création de son compte.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            3. Tarification et résiliation
          </h2>
          <p className="mt-2">
            Le service est facturé par logement actif selon la grille
            tarifaire dégressive en vigueur, sans engagement de durée.
            L&apos;hôte peut résilier à tout moment, la résiliation prenant
            effet en fin de période de facturation en cours.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            4. Obligations de l&apos;hôte
          </h2>
          <p className="mt-2">
            L&apos;hôte est seul responsable de l&apos;exactitude et de la
            mise à jour des informations renseignées dans la fiche de chaque
            logement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            5. Responsabilité
          </h2>
          <p className="mt-2">
            Si une erreur résulte d&apos;une information erronée ou obsolète
            renseignée par l&apos;hôte, la responsabilité lui incombe. Si
            l&apos;erreur résulte d&apos;un dysfonctionnement de LÉO lui-même
            (mauvaise interprétation ou information inventée), la
            responsabilité incombe à YOURGUESTAI, qui s&apos;engage à
            corriger le dysfonctionnement signalé dans les meilleurs délais.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            6. Droit applicable
          </h2>
          <p className="mt-2">
            Les présentes CGU/CGV sont soumises au droit français. Les
            tribunaux français sont seuls compétents en cas de litige.
          </p>
        </section>

        <p className="text-xs text-mist-500">Contact : yourguestai@gmail.com</p>
      </div>

      <LegalPageNav current="/cgu-cgv" />
    </main>
  );
}
