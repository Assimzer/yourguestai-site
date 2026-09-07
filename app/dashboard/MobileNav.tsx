"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SidebarNav from "./SidebarNav";

// Volet de navigation mobile : la sidebar desktop est cachee en dessous de
// `sm`, ce composant fournit un bouton menu + panneau coulissant equivalent
// pour retrouver les memes categories sur telephone.
export default function MobileNav({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-night-700 text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-64 flex-col border-r border-night-800 bg-night-950 px-4 py-6">
            <div className="mb-8 flex items-center justify-between px-2">
              <Link
                href="/"
                className="font-display text-lg italic text-white"
                onClick={() => setOpen(false)}
              >
                YOURGUESTAI
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="text-mist-400 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav />
            <div className="mt-auto border-t border-night-800 px-2 pt-4">
              <p className="truncate text-xs text-mist-500">{userEmail}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
