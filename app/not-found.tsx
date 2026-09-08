import Link from "next/link";
import Logo from "./components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-night-950 px-6 text-center">
      <Logo className="mb-8 text-xl" />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-porch-500">
        Erreur 404
      </p>
      <h1 className="mt-4 max-w-md font-display text-3xl italic text-white">
        Cette page n&apos;existe pas, ou plus.
      </h1>
      <p className="mt-3 max-w-sm text-sm text-mist-400">
        Vérifiez le lien, ou retournez à l&apos;accueil.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-porch-500 px-6 py-3 text-sm font-semibold text-night-950 transition hover:bg-porch-400"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
