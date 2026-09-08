import Link from "next/link";
import CookiePreferencesButton from "./CookiePreferencesButton";

const links = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu-cgv", label: "CGU/CGV" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
  { href: "/sous-traitants", label: "Sous-traitants" },
  { href: "/dpa", label: "DPA" },
];

export default function LegalPageNav({ current }: { current: string }) {
  return (
    <nav className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-night-800 pt-6 text-xs text-mist-500">
      {links.map((l) =>
        l.href === current ? (
          <span key={l.href} className="text-mist-300">
            {l.label}
          </span>
        ) : (
          <Link key={l.href} href={l.href} className="hover:text-mist-300">
            {l.label}
          </Link>
        )
      )}
      <CookiePreferencesButton className="hover:text-mist-300" />
    </nav>
  );
}
