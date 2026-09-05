/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // En-tetes de securite de base : le site n'embarque aucun script tiers
    // ni iframe (Stripe Checkout redirige plutot que d'embarquer), donc une
    // CSP assez stricte ne casse rien ici. 'unsafe-inline' reste necessaire
    // pour style-src (styles inline React ponctuels, ex. couleurs de
    // graphique) et script-src (payload d'hydratation Next.js).
    //
    // 'unsafe-eval' est ajoute UNIQUEMENT en dev : le serveur de
    // developpement Next.js utilise eval() pour le Hot Module Replacement
    // (react-refresh) ; sans ca, le bundle client plante silencieusement au
    // chargement (React ne s'hydrate jamais), et un <form> retombe sur un
    // envoi HTML natif classique — symptome observe : clic sur "Se
    // connecter" qui se contente de recharger la page sans rien afficher.
    // Jamais necessaire ni ajoute en production.
    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
