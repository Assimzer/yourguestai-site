"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Declenche le pixel StartTrial cote navigateur juste apres le retour de
// Stripe Checkout. event_id identique a celui envoye cote serveur (webhook
// Stripe, voir lib/metaCapi.ts) pour que Meta deduplique les deux.
//
// AnalyticsScripts.tsx monte le <Script> du pixel dans un useEffect separe
// (apres verification du consentement cookies), donc window.fbq peut ne pas
// encore exister au moment ou ce composant s'affiche -- on reessaie plutot
// que d'abandonner silencieusement des le premier essai.
export default function CheckoutSuccessPixel({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const deadline = Date.now() + 5000;

    function tryFire() {
      if (cancelled) return;
      if (window.fbq) {
        window.fbq(
          "track",
          "StartTrial",
          { value: 0, currency: "EUR", predicted_ltv: 240 },
          { eventID: `trial_${sessionId}` }
        );
        return;
      }
      if (Date.now() < deadline) {
        setTimeout(tryFire, 200);
      }
    }

    tryFire();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return null;
}
