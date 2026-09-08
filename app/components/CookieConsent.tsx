"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "yourguestai-cookie-consent";
const CONSENT_VERSION = 1;

type Consent = {
  essential: true;
  analytics: boolean;
  version: number;
  date: string;
};

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed as Consent;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean) {
  const consent: Consent = {
    essential: true,
    analytics,
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // stockage local indisponible (ex. navigation privée) — le bandeau réapparaîtra à la prochaine visite
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalyticsChoice(existing.analytics);
    }

    const reopen = () => {
      const current = readConsent();
      setAnalyticsChoice(current?.analytics ?? false);
      setCustomizing(true);
      setVisible(true);
    };
    window.addEventListener("open-cookie-preferences", reopen);
    return () => window.removeEventListener("open-cookie-preferences", reopen);
  }, []);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    setCustomizing(false);
  };

  const acceptAll = () => {
    saveConsent(true);
    close();
  };

  const rejectAll = () => {
    saveConsent(false);
    close();
  };

  const savePreferences = () => {
    saveConsent(analyticsChoice);
    close();
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-night-600 bg-night-900 shadow-2xl">
        <div className="flex items-center gap-2 bg-night-700 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-porch-500 font-display text-sm text-night-950">
            L
          </div>
          <div>
            <p className="text-sm font-medium leading-tight text-white">LÉO</p>
            <p className="text-[11px] leading-tight text-ok">en ligne</p>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="max-w-[95%] rounded-2xl rounded-tl-sm bg-night-800 px-3 py-2 text-[13px] leading-relaxed text-mist-200">
            Bonjour 👋 Pour améliorer le site, on aimerait utiliser quelques
            cookies de mesure d&apos;audience. Vous choisissez ce que vous
            acceptez.
          </div>

          {!customizing ? (
            <>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="flex-1 rounded-lg bg-porch-500 px-3 py-2 text-xs font-semibold text-night-950 transition hover:bg-porch-400"
                >
                  Tout accepter
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="flex-1 rounded-lg border border-night-600 px-3 py-2 text-xs font-medium text-mist-300 transition hover:border-mist-400 hover:text-white"
                >
                  Tout refuser
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="mt-2 text-xs text-mist-500 underline underline-offset-2 hover:text-mist-300"
              >
                Personnaliser
              </button>
            </>
          ) : (
            <>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3 rounded-lg border border-night-700 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-white">Essentiels</p>
                    <p className="mt-0.5 text-[11px] text-mist-500">
                      Nécessaires à la connexion à votre espace hôte. Toujours actifs.
                    </p>
                  </div>
                  <span className="mt-0.5 shrink-0 rounded-full bg-night-700 px-2 py-0.5 text-[10px] text-mist-400">
                    Requis
                  </span>
                </div>

                <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-night-700 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-white">
                      Mesure d&apos;audience
                    </p>
                    <p className="mt-0.5 text-[11px] text-mist-500">
                      Nous aide à comprendre comment le site est utilisé.
                      Désactivé par défaut.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsChoice}
                    onChange={(e) => setAnalyticsChoice(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-porch-500"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={savePreferences}
                className="mt-3 w-full rounded-lg bg-porch-500 px-3 py-2 text-xs font-semibold text-night-950 transition hover:bg-porch-400"
              >
                Enregistrer mes préférences
              </button>
            </>
          )}

          <Link
            href="/politique-confidentialite"
            className="mt-3 block text-[11px] text-mist-500 underline underline-offset-2 hover:text-mist-300"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  );
}
