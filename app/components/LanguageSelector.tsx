"use client";

import { useState } from "react";

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-mist-400 transition hover:text-white"
      >
        FR
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+0.5rem)] w-32 -translate-x-1/2 rounded-xl border border-night-700/60 bg-night-900/95 p-1.5 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-white"
          >
            🇫🇷 Français
          </button>
        </div>
      )}
    </div>
  );
}
