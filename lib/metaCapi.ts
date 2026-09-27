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
  if (!pixelId || !token) {
    console.error("sendMetaEvent: META_PIXEL_ID ou META_CAPI_TOKEN manquant");
    return;
  }

  try {
    const res = await fetch(
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

    const body = await res.text();
    if (!res.ok) {
      console.error(`sendMetaEvent: échec ${eventName} (${res.status}):`, body);
    } else {
      console.log(`sendMetaEvent: ${eventName} envoyé avec succès:`, body);
    }
  } catch (err) {
    // Best-effort : un echec d'envoi Meta ne doit jamais faire echouer le
    // webhook Stripe (l'abonnement doit rester traite correctement), mais
    // on le logue pour pouvoir diagnostiquer.
    console.error(`sendMetaEvent: exception ${eventName}:`, err);
  }
}
