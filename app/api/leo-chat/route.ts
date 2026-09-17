import { NextResponse } from "next/server";

// Chat public de la landing page (visiteurs curieux du produit) -- pas
// d'authentification, protege par le secret webhook comme /api/demo-request.
// A ne pas confondre avec le concierge WhatsApp de LEO pour les voyageurs :
// flux n8n totalement separe.
export async function POST(request: Request) {
  const { message, session_id } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message manquant" }, { status: 400 });
  }

  try {
    const res = await fetch(process.env.N8N_LEO_CHAT_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({ message, session_id }),
    });

    if (!res.ok) throw new Error("webhook failed");

    const data = await res.json();
    return NextResponse.json({ reply: data.reply ?? "" });
  } catch {
    return NextResponse.json(
      { error: "Échec de la réponse, réessayez." },
      { status: 502 }
    );
  }
}
