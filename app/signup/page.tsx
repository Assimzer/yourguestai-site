"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "../components/Logo";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [nomConciergerie, setNomConciergerie] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        // Lu par le trigger Postgres handle_new_host (raw_user_meta_data)
        // pour pré-remplir les colonnes correspondantes de la table hosts.
        data: {
          nom_complet: nomComplet.trim(),
          telephone: telephone.trim(),
          nom_conciergerie: nomConciergerie.trim(),
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    // La ligne "hosts" correspondante est créée automatiquement par un
    // trigger Postgres (voir README) au moment de la création du user
    // Supabase Auth — rien à faire ici côté client.

    // Si la confirmation d'email est désactivée côté Supabase, signUp()
    // renvoie directement une session active : le compte est déjà
    // connecté, il ne faut pas afficher le message "vérifiez votre
    // email" (qui ferait croire à tort que le compte n'est pas encore
    // utilisable) mais emmener l'hôte dans son tableau de bord.
    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-night-950 px-6">
      <div className="w-full max-w-sm">
        <Logo className="mx-auto mb-8 text-xl" />

        <div className="rounded-2xl border border-night-600 bg-night-900 p-8">
          <h1 className="font-display text-2xl text-white">Créer un compte</h1>
          <p className="mt-1 text-sm text-mist-400">
            Connectez votre premier logement en 2 minutes.
          </p>

          {status === "sent" ? (
            <p className="mt-6 rounded-lg border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-white">
              Compte créé. Vérifiez votre email pour confirmer votre adresse.
            </p>
          ) : (
            <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="Nom complet *"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                className="rounded-lg border border-night-600 bg-night-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
              />
              <input
                type="email"
                required
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-night-600 bg-night-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
              />
              <input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="rounded-lg border border-night-600 bg-night-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
              />
              <input
                type="text"
                placeholder="Nom de la conciergerie / entreprise (optionnel)"
                value={nomConciergerie}
                onChange={(e) => setNomConciergerie(e.target.value)}
                className="rounded-lg border border-night-600 bg-night-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500"
              />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Mot de passe (8 caractères min.) *"
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
                {status === "loading" ? "Création..." : "Créer mon compte"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-mist-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-porch-400 hover:text-porch-300">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
