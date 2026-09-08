import Link from "next/link";
import MobileMenuButton from "./MobileMenuButton";
import LanguageSelector from "./LanguageSelector";

export default function SiteHeader() {
  return (
    <div className="sticky top-0 z-50 h-16 border-b border-night-800 bg-night-950/95 backdrop-blur-md">
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="font-display text-base italic text-white">
          YOURGUESTAI
        </Link>
        <div className="hidden items-center gap-5 text-sm text-mist-400 sm:flex">
          <Link href="/fonctionnalites" className="hover:text-white">
            Fonctionnalités
          </Link>
          <Link href="/a-propos" className="hover:text-white">
            À propos
          </Link>
          <Link href="/#demo" className="hover:text-white">
            Démo
          </Link>
        </div>
        <MobileMenuButton />
        <LanguageSelector />
        <div className="ml-auto flex items-center gap-2">
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
