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
export default function CheckoutSuccessPixel({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    if (!sessionId || !window.fbq) return;
    window.fbq(
      "track",
      "StartTrial",
      { value: 0, currency: "EUR", predicted_ltv: 240 },
      { eventID: `trial_${sessionId}` }
    );
  }, [sessionId]);

  return null;
}
