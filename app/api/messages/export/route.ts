import { NextResponse } from "next/server";
import { requireUser, isAuthError } from "@/lib/supabase/requireUser";
import { normalize } from "@/lib/airtable/normalize";

export const dynamic = "force-dynamic";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

// Export CSV de l'historique d'une conversation (une reservation), pour la
// tracabilite en cas de litige avec un voyageur. Le contenu textuel des
// messages n'est pas stocke aujourd'hui (seule la metadonnee sens/date/
// escalade l'est) -- l'export reflete donc ce qui existe reellement en base.
export async function GET(request: Request) {
  const auth = await requireUser();
  if (isAuthError(auth)) return auth;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("property_id");
  const telephone = searchParams.get("telephone");

  if (!propertyId || !telephone) {
    return NextResponse.json(
      { error: "property_id et telephone requis" },
      { status: 400 }
    );
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, nom, cle_unique_airtable")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (propertyError || !property) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const { data: allMessages, error: messagesError } = await supabase
    .from("messages")
    .select("date, sens, escalade, id_logement, telephone")
    .eq("telephone", telephone);

  if (messagesError) {
    return NextResponse.json(
      { error: "Impossible de charger les messages" },
      { status: 500 }
    );
  }

  const targetLogement = normalize(property.cle_unique_airtable);
  const rows = (allMessages ?? [])
    .filter((m) => normalize(m.id_logement) === targetLogement)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  const header = "Date,Sens,Escalade au propriétaire\n";
  const body = rows
    .map((m) => {
      const date = m.date ? new Date(m.date).toLocaleString("fr-FR") : "";
      const sens = m.sens === "entrant" ? "Voyageur" : m.sens === "sortant" ? "LÉO" : m.sens ?? "";
      const escalade = m.escalade ? "Oui" : "Non";
      return [csvEscape(date), csvEscape(sens), csvEscape(escalade)].join(",");
    })
    .join("\n");

  const csv = header + body + "\n";
  const filename = `historique_${property.nom.replace(/[^a-z0-9]+/gi, "_")}_${telephone.replace(/[^0-9]/g, "")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
