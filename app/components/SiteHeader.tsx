import Link from "next/link";

export default function SiteHeader() {
  return (
    <div className="sticky top-4 z-50 mx-auto w-fit max-w-[calc(100%-2rem)] px-4">
      <nav className="flex items-center gap-6 rounded-full border border-night-700/60 bg-night-900/70 px-6 py-3 shadow-lg backdrop-blur-md">
        <Link href="/" className="font-display text-base italic text-white">
          YOURGUESTAI
        </Link>
        <div className="hidden items-center gap-5 text-sm text-mist-400 sm:flex">
          <Link href="/#fonctionnalites" className="hover:text-white">
            Fonctionnalités
          </Link>
          <Link href="/a-propos" className="hover:text-white">
            À propos
          </Link>
          <Link href="/#demo" className="hover:text-white">
            Démo
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full bg-porch-500 px-4 py-1.5 text-sm font-semibold text-night-950 transition hover:bg-porch-400"
          >
            Espace hôte
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-night-700/80 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-night-600"
          >
            Inscription
          </Link>
        </div>
      </nav>
    </div>
  );
}
