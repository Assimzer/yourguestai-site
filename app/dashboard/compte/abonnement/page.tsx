import Link from "next/link";
import AbonnementSelector from "./AbonnementSelector";

export default function AbonnementPage() {
  return (
    <div>
      <Link
        href="/dashboard/compte"
        className="text-sm text-mist-400 hover:text-white"
      >
        ← Mon compte
      </Link>

      <h1 className="mt-4 font-display text-2xl text-white">
        Choisissez votre formule
      </h1>
      <p className="mt-1 text-sm text-mist-400">
        Le tarif par logement baisse automatiquement selon le nombre de
        logements. Sans engagement, aucun frais de mise en service.
      </p>

      <div className="mt-8">
        <AbonnementSelector />
      </div>
    </div>
  );
}
