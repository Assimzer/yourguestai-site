import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";
import { getMessagesData } from "@/lib/messages/getMessagesData";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { property_id, telephone } = await request.json();

  if (!property_id || typeof telephone !== "string") {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  // Verifie que ce logement appartient bien a l'hote connecte avant de
  // repercuter quoi que ce soit dans Airtable via n8n.
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  // Recharge les conversations de cet hote pour retrouver les identifiants
  // Airtable exacts des messages a supprimer. On evite ainsi de faire
  // rechercher la ligne par n8n via une formule texte (id_logement/telephone)
  // qui peut echouer silencieusement a cause d'un caractere invisible cache
  // dans la donnee Airtable — un id Airtable, lui, est toujours exact.
  const data = await getMessagesData(supabase, user.id);
  if (!data.ok) {
    return NextResponse.json({ error: data.error }, { status: data.status });
  }

  const conversation = data.messages.find(
    (c) => c.property_id === property_id && c.telephone === telephone
  );

  const messageIds = conversation?.message_ids ?? [];

  if (messageIds.length === 0) {
    // Rien a supprimer (deja supprime, ou double-clic) : ce n'est pas une
    // erreur pour l'hote, la conversation n'existe simplement plus.
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  const webhookUrl = process.env.N8N_DELETE_MESSAGES_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_DELETE_MESSAGES_WEBHOOK_URL manquant côté serveur" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({ message_ids: messageIds }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Échec de la suppression (n8n: ${res.status})` },
        { status: 502 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Impossible de contacter n8n : ${(err as Error).message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, deleted: messageIds.length });
}
