"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ouvrir le menu"
        className="flex h-8 w-8 items-center justify-center text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+0.5rem)] w-56 -translate-x-1/2 rounded-2xl border border-night-700/60 bg-night-900/95 p-3 shadow-lg backdrop-blur-md">
          <nav className="flex flex-col gap-1 text-sm text-mist-300">
            <Link
              href="/#fonctionnalites"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-night-800 hover:text-white"
            >
              Fonctionnalités
            </Link>
            <Link
              href="/a-propos"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-night-800 hover:text-white"
            >
              À propos
            </Link>
            <Link
              href="/#demo"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-night-800 hover:text-white"
            >
              Démo
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
