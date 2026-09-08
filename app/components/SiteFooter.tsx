import Link from "next/link";
import CookiePreferencesButton from "./CookiePreferencesButton";

export default function SiteFooter() {
  return (
    <footer className="border-t border-night-800 px-6 py-10 text-center text-xs text-mist-500">
      <p>YOURGUESTAI — LÉO</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href="/a-propos" className="hover:text-mist-300">
          À propos
        </Link>
        <Link href="/mentions-legales" className="hover:text-mist-300">
          Mentions légales
        </Link>
        <Link href="/cgu-cgv" className="hover:text-mist-300">
          CGU/CGV
        </Link>
        <Link href="/politique-confidentialite" className="hover:text-mist-300">
          Politique de confidentialité
        </Link>
        <Link href="/sous-traitants" className="hover:text-mist-300">
          Sous-traitants
        </Link>
        <Link href="/dpa" className="hover:text-mist-300">
          DPA
        </Link>
        <CookiePreferencesButton className="hover:text-mist-300" />
      </div>
    </footer>
  );
}
