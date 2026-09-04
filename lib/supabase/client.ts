import { createBrowserClient } from "@supabase/ssr";

// Utilisé dans les composants côté client ("use client").
// Repose sur la clé publique (anon) — jamais la clé service_role ici.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
