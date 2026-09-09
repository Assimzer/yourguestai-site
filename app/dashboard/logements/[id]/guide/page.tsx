// app/dashboard/logements/[id]/guide/page.tsx
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GuideEditor from "./GuideEditor";
import Link from "next/link";

export default async function GuidePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: property } = await supabase
    .from("properties")
    .select("id, nom, host_id")
    .eq("id", params.id)
    .single();

  if (!property || property.host_id !== user.id) notFound();

  return (
    <main className="min-h-screen bg-night-950 pb-20">
      <header className="border-b border-night-800 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href="/dashboard/logements"
            className="text-sm text-mist-400 transition hover:text-white"
          >
            ← Logements
          </Link>
          <span className="text-mist-600">/</span>
          <span className="text-sm text-mist-400">{property.nom}</span>
          <span className="text-mist-600">/</span>
          <span className="text-sm text-white">Éditer le logement</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <GuideEditor
          propertyId={property.id}
          propertyNom={property.nom}
          userId={user.id}
        />
      </div>
    </main>
  );
}
