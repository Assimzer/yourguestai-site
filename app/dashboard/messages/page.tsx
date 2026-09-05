import { createClient } from "@/lib/supabase/server";
import { getMessagesData } from "@/lib/messages/getMessagesData";
import MessagesList from "./MessagesList";

export default async function MessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = user
    ? await getMessagesData(supabase, user.id)
    : { ok: false as const, error: "Non authentifié", status: 401 };

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Messages</h1>
      <p className="mt-1 text-sm text-mist-400">
        Historique des échanges WhatsApp gérés par LÉO. Lecture seule.
      </p>

      <div className="mt-8">
        <MessagesList
          initialConversations={result.ok ? result.messages : []}
          initialError={result.ok ? null : result.error}
        />
      </div>
    </div>
  );
}
