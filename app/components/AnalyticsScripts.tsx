"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "yourguestai-cookie-consent";

function hasAnalyticsConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Boolean(JSON.parse(raw).analytics);
  } catch {
    return false;
  }
}

// Charge Meta Pixel et Microsoft Clarity uniquement si l'hote a accepte les
// cookies de mesure d'audience (case "Mesure d'audience" du bandeau
// CookieConsent) -- ce sont des outils de suivi publicitaire/analytique
// classiques, contrairement a Umami (charge en permanence dans layout.tsx,
// generalement considere exempt de consentement).
export default function AnalyticsScripts() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());

    // CookieConsent.tsx sauvegarde le choix dans localStorage puis prevdefinit
    // cet evenement, pour activer les scripts immediatement sans recharger la
    // page si l'hote clique "Tout accepter" ou coche la case en cours de visite.
    const onConsentChange = () => setEnabled(hasAnalyticsConsent());
    window.addEventListener("cookie-consent-updated", onConsentChange);
    return () => window.removeEventListener("cookie-consent-updated", onConsentChange);
  }, []);

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  if (!enabled) return null;

  return (
    <>
      {pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {clarityId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}
    </>
  );
}
