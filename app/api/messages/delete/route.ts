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
  // supprimer quoi que ce soit.
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, host_id")
    .eq("id", property_id)
    .single();

  if (error || !property || property.host_id !== user.id) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  // Recharge les conversations de cet hote pour retrouver les identifiants
  // exacts (uuid Supabase) des messages a supprimer, plutot que de filtrer
  // par id_logement/telephone directement (comparaison de texte qui pourrait
  // matcher des lignes d'un autre hote en cas de collision).
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

  const { error: deleteError } = await supabase
    .from("messages")
    .delete()
    .in("id", messageIds);

  if (deleteError) {
    return NextResponse.json(
      { error: "Échec de la suppression" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deleted: messageIds.length });
}
