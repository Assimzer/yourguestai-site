import Link from "next/link";

export default function SiteHeader() {
  return (
    <div className="border-b border-night-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="font-display text-lg italic text-white">
          YOURGUESTAI
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-mist-400 md:flex">
          <Link href="/#fonctionnalites" className="transition hover:text-white">
            Fonctionnalités
          </Link>
          <Link href="/a-propos" className="transition hover:text-white">
            À propos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
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
    </div>
  );
}
