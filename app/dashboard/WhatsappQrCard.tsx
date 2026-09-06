"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Numero WhatsApp unique de LEO, partage par tous les logements (chaque
// voyageur est ensuite identifie a sa reservation par n8n, pas par le
// numero appele). Format E.164 sans le "+" pour le lien wa.me.
const WHATSAPP_NUMBER_DISPLAY = "06 24 09 92 89";
const WHATSAPP_NUMBER_INTL = "+33 6 24 09 92 89";
const WHATSAPP_LINK = "https://wa.me/33624099289";

export default function WhatsappQrCard() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(WHATSAPP_LINK, {
      width: 320,
      margin: 2,
      color: { dark: "#0A0D14", light: "#FFFFFF" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(WHATSAPP_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (permissions navigateur) : le lien
      // reste visible et sélectionnable à la main juste en dessous.
    }
  }

  return (
    <div className="mt-6 max-w-md rounded-2xl border border-night-600 bg-night-900 p-6">
      <h2 className="font-display text-lg text-white">
        Numéro WhatsApp de LÉO
      </h2>
      <p className="mt-1 text-sm text-mist-400">
        Le même numéro sert pour tous vos logements — chaque voyageur est
        identifié à sa réservation automatiquement.
      </p>

      <p className="mt-4 font-mono text-lg text-white">
        {WHATSAPP_NUMBER_DISPLAY}
        <span className="ml-2 text-sm text-mist-500">
          ({WHATSAPP_NUMBER_INTL})
        </span>
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl border border-night-600 bg-white p-2">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR code WhatsApp de LÉO" className="h-40 w-40" />
          ) : (
            <div className="h-40 w-40 animate-pulse bg-night-800" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs text-mist-500">
            À imprimer et afficher dans le logement, ou à partager en ligne :
            scanné ou cliqué, il ouvre directement une conversation WhatsApp
            avec LÉO.
          </p>

          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download="qr-code-leo-whatsapp.png"
              className="rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-center text-xs font-medium text-mist-300 transition hover:border-porch-500/40 hover:text-white"
            >
              Télécharger le QR code
            </a>
          )}

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-porch-500 px-3 py-2 text-center text-xs font-semibold text-night-950 transition hover:bg-porch-400"
          >
            Ouvrir la conversation WhatsApp
          </a>

          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg border border-night-600 px-3 py-2 text-xs font-medium text-mist-300 transition hover:border-porch-500/40 hover:text-white"
          >
            {copied ? "Lien copié ✓" : "Copier le lien à envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}
