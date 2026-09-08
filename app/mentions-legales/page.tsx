import Link from "next/link";
import LegalPageNav from "../components/LegalPageNav";

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/" className="font-display text-lg italic text-white">
        YOURGUESTAI
      </Link>

      <h1 className="mt-10 font-display text-3xl italic text-white">
        Mentions légales
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-mist-300">
        <p>
          Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance
          dans l&apos;économie numérique, il est précisé aux utilisateurs du
          site YOURGUESTAI l&apos;identité des différents intervenants.
        </p>

        <section>
          <h2 className="font-display text-lg text-white">Édition du site</h2>
          <ul className="mt-2 space-y-1">
            <li>Nom commercial : YOURGUESTAI (Indépendance Musicale)</li>
            <li>Statut : entrepreneur individuel (auto-entrepreneur)</li>
            <li>Responsable : Assim</li>
            <li>SIRET : 904 465 325 00010</li>
            <li>Adresse : 1 rue du Clos Sirod, 39600 Arbois, France</li>
            <li>Email : yourguestai@gmail.com</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Hébergement</h2>
          <ul className="mt-2 space-y-1">
            <li>Société : Vercel Inc.</li>
            <li>Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li>Contact : privacy@vercel.com</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            Propriété intellectuelle
          </h2>
          <p className="mt-2">
            L&apos;ensemble des contenus du site (textes, visuels, logos,
            code) est la propriété exclusive de YOURGUESTAI, sauf mention
            contraire. Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            Droit applicable
          </h2>
          <p className="mt-2">
            Les présentes mentions légales sont soumises au droit français.
          </p>
        </section>
      </div>

      <LegalPageNav current="/mentions-legales" />
    </main>
  );
}
