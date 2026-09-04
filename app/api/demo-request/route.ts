import { NextResponse } from "next/server";

// Formulaire public de la landing page — pas d'authentification, mais le
// secret protège quand même le webhook n8n contre l'appel direct externe.
export async function POST(request: Request) {
  const { nom, email, nb_logements } = await request.json();

  if (!nom || !email) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  try {
    const res = await fetch(process.env.N8N_DEMO_REQUEST_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({ nom, email, nb_logements }),
    });

    if (!res.ok) throw new Error("webhook failed");
  } catch {
    return NextResponse.json(
      { error: "Échec de l'envoi, réessayez." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
