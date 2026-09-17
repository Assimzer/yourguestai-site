"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; text: string };

function getSessionId() {
  try {
    const key = "yourguestai-chat-session";
    let id = window.sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    // sessionStorage indisponible (navigation privée stricte...) : un id
    // par appel suffit, la conversation ne survivra juste pas à un refresh.
    return crypto.randomUUID();
  }
}

// Bulle de chat marketing, distincte du concierge WhatsApp de LEO pour les
// voyageurs : celle-ci répond aux questions des visiteurs du site sur
// YourGuestAI/LEO (le produit), pas sur un séjour en cours.
export default function LeoChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Bonjour 👋 Je suis LÉO. Une question sur comment je fonctionne, mes tarifs, ou ce que je peux faire pour vos logements ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>("");

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);
    setError(false);

    try {
      const res = await fetch("/api/leo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      setError(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Désolé, je n'arrive pas à répondre pour le moment. Réessayez, ou réservez une démo directement.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le chat" : "Poser une question à LÉO"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-porch-500 text-night-950 shadow-xl transition hover:scale-105 hover:bg-porch-400"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-night-600 bg-night-900 shadow-2xl">
          <div className="border-b border-night-700 bg-night-950 px-4 py-3">
            <p className="text-sm font-semibold text-white">Demander à LÉO</p>
            <p className="text-xs text-mist-500">Questions sur YourGuestAI</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-porch-500 text-night-950"
                    : "bg-night-800 text-mist-200"
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] rounded-xl bg-night-800 px-3 py-2 text-sm text-mist-500">
                …
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-night-700 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question…"
              disabled={sending}
              className="flex-1 rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-white placeholder:text-mist-500 focus:border-porch-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-lg bg-porch-500 px-3 py-2 text-sm font-semibold text-night-950 transition hover:bg-porch-400 disabled:opacity-50"
            >
              →
            </button>
          </form>
          {error && (
            <p className="px-4 pb-2 text-xs text-warn">
              Connexion instable — réessayez dans un instant.
            </p>
          )}
        </div>
      )}
    </>
  );
}
