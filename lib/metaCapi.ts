import crypto from "crypto";

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

// Doublon serveur des evenements Meta Pixel, envoye via l'API Conversions.
// Dedup avec le pixel navigateur grace au meme event_id (voir CheckoutSuccessPixel.tsx
// et le webhook Stripe) -- Meta fusionne les deux si le nom et l'event_id
// correspondent, pour un tracking fiable meme avec un bloqueur de pub cote client.
export async function sendMetaEvent(
  eventName: string,
  eventId: string,
  email: string,
  value: number
) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return; // pas configure -- pas bloquant

  try {
    await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              action_source: "website",
              user_data: { em: [sha256(email)] },
              custom_data: { currency: "EUR", value },
            },
          ],
        }),
      }
    );
  } catch {
    // Best-effort : un echec d'envoi Meta ne doit jamais faire echouer le
    // webhook Stripe (l'abonnement doit rester traite correctement).
  }
}
