"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMsg("Email ou mot de passe incorrect.");
      setStatus("error");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-night-950 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-xl italic text-white">
          YOURGUESTAI
        </Link>

        <div className="rounded-2xl border border-night-600 bg-night-900 p-8">
          <h1 className="font-display text-2xl text-white">Espace hôte</h1>
          <p className="mt-1 text-sm text-mist-400">
            Connectez-vous pour gérer vos logements.
          </p>

          <form onSubmit={handlePasswordLogin} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-night-600 bg-night-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
            />
            <input
              type="password"
              required
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-night-600 bg-night-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
            />
            {status === "error" && (
              <p className="text-sm text-warn">{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 rounded-lg bg-porch-500 py-2.5 text-sm font-semibold text-night-950 transition hover:bg-porch-400 disabled:opacity-60"
            >
              {status === "loading" ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-mist-500">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-porch-400 hover:text-porch-300">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
