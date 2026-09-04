import MessagesList from "./MessagesList";

export default function MessagesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-white">Messages</h1>
      <p className="mt-1 text-sm text-mist-400">
        Historique des échanges WhatsApp gérés par LÉO. Lecture seule.
      </p>

      <div className="mt-8">
        <MessagesList />
      </div>
    </div>
  );
}
