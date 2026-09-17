import { createClient } from "@supabase/supabase-js";
import Logo from "../../components/Logo";

// Client service_role : cette page est publique (pas de session hote), donc
// on ne peut pas passer par le client scope-utilisateur habituel. On
// contourne les RLS volontairement, mais uniquement pour lire un unique
// logement identifie par son code_logement exact -- jamais de liste ni de
// filtre plus large -- et on ne selectionne que des colonnes destinees au
// voyageur (rien d'administratif : pas d'id, host_id, ical_url...).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PUBLIC_COLUMNS =
  "id, nom, ville, adresse, photo_url, checkin_heure, checkout_heure, instructions_arrivee, code_acces, wifi_nom, wifi_code, parking_info, parking_photo_url, equipements, equipements_photo_url, regles_maison, recommandations, contact_urgence, numero_proprietaire, nom_conciergerie, code_logement";

type PublicGuide = {
  id: string;
  nom: string;
  ville: string | null;
  adresse: string | null;
  photo_url: string | null;
  checkin_heure: string | null;
  checkout_heure: string | null;
  instructions_arrivee: string | null;
  code_acces: string | null;
  wifi_nom: string | null;
  wifi_code: string | null;
  parking_info: string | null;
  parking_photo_url: string | null;
  equipements: string | null;
  equipements_photo_url: string | null;
  regles_maison: string | null;
  recommandations: string | null;
  contact_urgence: string | null;
  numero_proprietaire: string | null;
  nom_conciergerie: string | null;
  code_logement: string | null;
};

async function getGuide(code: string): Promise<PublicGuide | null> {
  const { data } = await supabase
    .from("properties")
    .select(PUBLIC_COLUMNS)
    .eq("code_logement", code.trim().toUpperCase())
    .maybeSingle();

  return (data as PublicGuide | null) ?? null;
}

export default async function PublicGuidePage({
  params,
}: {
  params: { code: string };
}) {
  const guide = await getGuide(params.code);

  if (guide) {
    // Enregistrement best-effort de l'ouverture : sert uniquement a
    // l'indicateur "consulte / pas encore consulte" cote hote, jamais
    // bloquant pour l'affichage de la page si l'insertion echoue.
    void supabase.from("guide_views").insert({ property_id: guide.id });
  }

  if (!guide) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <Logo className="text-base" />
        <p className="mt-8 text-sm text-mist-400">
          Ce lien de livret d&apos;accueil n&apos;est pas valide. Vérifiez le
          lien reçu ou contactez votre hôte.
        </p>
      </main>
    );
  }

  const whatsappLink = `https://wa.me/33624099289?text=${encodeURIComponent(
    guide.code_logement ?? ""
  )}`;

  return (
    <main className="mx-auto min-h-screen max-w-lg pb-16">
      <div className="relative h-56 w-full overflow-hidden bg-night-800">
        {guide.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guide.photo_url}
            alt={guide.nom}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🏠
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/20 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <p className="font-display text-2xl text-white">{guide.nom}</p>
          {(guide.ville || guide.adresse) && (
            <p className="mt-0.5 text-sm text-mist-300">
              {guide.adresse ? `${guide.adresse}` : guide.ville}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label="Arrivée" value={guide.checkin_heure} icon="🕒" />
          <InfoCard label="Départ" value={guide.checkout_heure} icon="🕒" />
        </div>

        <GuideSection title="🔑 Accès" show={Boolean(guide.code_acces)}>
          <p className="text-sm text-white">{guide.code_acces}</p>
        </GuideSection>

        <GuideSection
          title="📶 Wi-Fi"
          show={Boolean(guide.wifi_nom || guide.wifi_code)}
        >
          <p className="text-sm text-white">
            Réseau : <span className="font-medium">{guide.wifi_nom || "—"}</span>
          </p>
          <p className="mt-1 text-sm text-white">
            Mot de passe :{" "}
            <span className="font-medium">{guide.wifi_code || "—"}</span>
          </p>
        </GuideSection>

        <GuideSection
          title="🚗 Instructions d'arrivée"
          show={Boolean(guide.instructions_arrivee)}
        >
          <p className="whitespace-pre-wrap text-sm text-mist-300">
            {guide.instructions_arrivee}
          </p>
        </GuideSection>

        <GuideSection
          title="🅿️ Parking"
          show={Boolean(guide.parking_info || guide.parking_photo_url)}
        >
          {guide.parking_info && (
            <p className="whitespace-pre-wrap text-sm text-mist-300">
              {guide.parking_info}
            </p>
          )}
          {guide.parking_photo_url && (
            <a
              href={guide.parking_photo_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-porch-400 underline underline-offset-4"
            >
              Voir la photo/preuve de parking
            </a>
          )}
        </GuideSection>

        <GuideSection
          title="🧺 Équipements"
          show={Boolean(guide.equipements || guide.equipements_photo_url)}
        >
          {guide.equipements && (
            <p className="whitespace-pre-wrap text-sm text-mist-300">
              {guide.equipements}
            </p>
          )}
          {guide.equipements_photo_url && (
            <a
              href={guide.equipements_photo_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-porch-400 underline underline-offset-4"
            >
              Voir la photo des équipements
            </a>
          )}
        </GuideSection>

        <GuideSection
          title="📋 Règles de la maison"
          show={Boolean(guide.regles_maison)}
        >
          <p className="whitespace-pre-wrap text-sm text-mist-300">
            {guide.regles_maison}
          </p>
        </GuideSection>

        <GuideSection
          title="⭐ À proximité"
          show={Boolean(guide.recommandations)}
        >
          <p className="whitespace-pre-wrap text-sm text-mist-300">
            {guide.recommandations}
          </p>
        </GuideSection>

        <GuideSection
          title="🚨 En cas d'urgence"
          show={Boolean(guide.contact_urgence || guide.numero_proprietaire)}
        >
          <p className="text-sm text-white">
            {guide.contact_urgence || guide.numero_proprietaire}
          </p>
        </GuideSection>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-porch-500 px-5 py-3.5 text-center text-sm font-semibold text-night-950 transition hover:bg-porch-400"
        >
          💬 Une question ? Écrire à LÉO sur WhatsApp
        </a>

        {guide.nom_conciergerie && (
          <p className="text-center text-xs text-mist-500">
            Logement géré par {guide.nom_conciergerie}
          </p>
        )}
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-night-600 bg-night-900 p-4 text-center">
      <p className="text-xs text-mist-400">
        {icon} {label}
      </p>
      <p className="mt-1 font-display text-xl text-white">{value || "—"}</p>
    </div>
  );
}

function GuideSection({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="rounded-2xl border border-night-600 bg-night-900 p-4">
      <p className="text-sm font-medium text-white">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
