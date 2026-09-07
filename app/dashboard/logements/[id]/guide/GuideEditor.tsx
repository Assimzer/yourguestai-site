"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type GuideFields = {
  adresse: string;
  photo_url: string;
  checkin_heure: string;
  checkout_heure: string;
  code_acces: string;
  wifi_nom: string;
  wifi_code: string;
  parking_info: string;
  parking_photo_url: string;
  equipements: string;
  equipements_photo_url: string;
  regles_maison: string;
  recommandations: string;
  contact_urgence: string;
};

const EMPTY: GuideFields = {
  adresse: "",
  photo_url: "",
  checkin_heure: "",
  checkout_heure: "",
  code_acces: "",
  wifi_nom: "",
  wifi_code: "",
  parking_info: "",
  parking_photo_url: "",
  equipements: "",
  equipements_photo_url: "",
  regles_maison: "",
  recommandations: "",
  contact_urgence: "",
};

type AddressSuggestion = {
  label: string;
};

export default function GuideEditor({
  propertyId,
  propertyNom,
  userId,
}: {
  propertyId: string;
  propertyNom: string;
  userId: string;
}) {
  const [fields, setFields] = useState<GuideFields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [showPhotoUrlInput, setShowPhotoUrlInput] = useState(false);

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/get-guide?property_id=${propertyId}`)
      .then((r) => r.json())
      .then((data) => {
        // n8n renvoie { id, fields: { ... } } — on mappe les champs Airtable
        const f = data.fields ?? {};
        setFields({
          adresse: f.adresse ?? "",
          photo_url: f.photo_url ?? "",
          checkin_heure: f.checkin_heure ?? f.checkin ?? "",
          checkout_heure: f.checkout_heure ?? f.checkout ?? "",
          code_acces: f.Code_Acces ?? f.code_acces ?? "",
          wifi_nom: f.wifi_nom ?? "",
          wifi_code: f.wifi_code ?? "",
          parking_info: f.parking_info ?? f.parking ?? "",
          parking_photo_url: f.parking_photo_url ?? "",
          equipements: f.equipements ?? "",
          equipements_photo_url: f.equipements_photo_url ?? "",
          regles_maison: f.regles_maison ?? f.regle ?? "",
          recommandations: f.recommandations ?? "",
          contact_urgence: f.contact_urgence ?? f.contact ?? "",
        });
      })
      .catch(() => setError("Impossible de charger les données du livret."))
      .finally(() => setLoading(false));
  }, [propertyId]);

  function set(key: keyof GuideFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      setSaved(false);
    };
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setFields((prev) => ({ ...prev, adresse: value }));
    setSaved(false);

    if (addressDebounce.current) clearTimeout(addressDebounce.current);

    if (value.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // API Adresse du gouvernement (data.gouv.fr) : gratuite, publique, sans
    // clé — adaptee puisque le service cible la France. Debounce simple pour
    // eviter une requete a chaque frappe.
    addressDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`
        );
        if (!res.ok) return;
        const data = await res.json();
        const suggestions: AddressSuggestion[] = (data.features ?? []).map(
          (f: { properties: { label: string } }) => ({ label: f.properties.label })
        );
        setAddressSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch {
        // Pas bloquant : l'hôte peut toujours taper l'adresse à la main.
      }
    }, 300);
  }

  function selectAddress(label: string) {
    setFields((prev) => ({ ...prev, adresse: label }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier ensuite
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Merci de choisir un fichier image (jpeg, png...).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image trop lourde (5 Mo max).");
      return;
    }

    setUploadingPhoto(true);
    setPhotoError("");

    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop() || "jpg";
      // Chemin préfixé par l'id de l'hôte : les règles d'accès du bucket
      // n'autorisent chaque hôte à écrire que dans son propre dossier.
      const path = `${userId}/${propertyId}/cover.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("logement-photos")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) {
        setPhotoError("Échec de l'envoi. Réessaie.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logement-photos").getPublicUrl(path);

      // Évite que le navigateur affiche une version mise en cache de
      // l'ancienne photo après un remplacement (même chemin de fichier).
      setFields((prev) => ({ ...prev, photo_url: `${publicUrl}?t=${Date.now()}` }));
      setSaved(false);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/update-guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: propertyId, ...fields }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Erreur lors de la sauvegarde. Réessaie.");
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-mist-400">
        Chargement du livret…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-white">
            Livret d'accueil — {propertyNom}
          </h2>
          <p className="mt-1 text-sm text-mist-400">
            Ces informations sont utilisées par LÉO et apparaissent dans le guide envoyé à vos voyageurs.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-porch-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-porch-600 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
          {error}
        </p>
      )}

      {/* Section : Localisation */}
      <Section title="📍 Localisation & photo">
        <div className="relative">
          <Field label="Adresse du logement">
            <input
              type="text"
              value={fields.adresse}
              onChange={handleAddressChange}
              onFocus={() => setShowSuggestions(addressSuggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="12 rue de la Paix, 75002 Paris"
              autoComplete="off"
            />
          </Field>
          {showSuggestions && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-night-600 bg-night-800 shadow-lg">
              {addressSuggestions.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectAddress(s.label)}
                    className="block w-full px-3 py-2 text-left text-sm text-mist-300 hover:bg-night-700 hover:text-white"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist-400">
            Photo de couverture
          </label>
          <p className="mb-2 text-xs text-mist-500">
            Dépose une image depuis ton ordinateur.
          </p>

          <div className="flex items-center gap-3">
            {fields.photo_url && (
              <img
                src={fields.photo_url}
                alt="Aperçu"
                className="h-14 w-20 rounded-lg object-cover"
              />
            )}
            <label className="cursor-pointer rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-xs font-medium text-mist-300 transition hover:border-porch-500/40 hover:text-white">
              {uploadingPhoto
                ? "Envoi..."
                : fields.photo_url
                ? "Changer la photo"
                : "Choisir un fichier"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </label>
          </div>
          {photoError && <p className="mt-2 text-xs text-warn">{photoError}</p>}

          {showPhotoUrlInput ? (
            <div className="mt-3">
              <Field
                label="Lien externe (Airbnb, Imgur...)"
                hint="À utiliser plutôt qu'un dépôt de fichier — cette adresse reste visible telle quelle."
              >
                <input
                  type="url"
                  value={fields.photo_url}
                  onChange={set("photo_url")}
                  placeholder="https://…/photo.jpg"
                />
              </Field>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPhotoUrlInput(true)}
              className="mt-2 text-xs text-mist-500 underline decoration-night-600 underline-offset-4 hover:text-mist-300"
            >
              Utiliser un lien externe à la place
            </button>
          )}
        </div>
      </Section>

      {/* Section : Arrivée / Départ */}
      <Section title="🕐 Arrivée & départ">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heure d'arrivée">
            <input
              type="text"
              value={fields.checkin_heure}
              onChange={set("checkin_heure")}
              placeholder="15h"
            />
          </Field>
          <Field label="Heure de départ">
            <input
              type="text"
              value={fields.checkout_heure}
              onChange={set("checkout_heure")}
              placeholder="11h"
            />
          </Field>
        </div>
      </Section>

      {/* Section : Accès */}
      <Section title="🔑 Accès & Wi-Fi">
        <Field label="Code d'accès / boîte à clés">
          <input
            type="text"
            value={fields.code_acces}
            onChange={set("code_acces")}
            placeholder="1234"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom du réseau Wi-Fi">
            <input
              type="text"
              value={fields.wifi_nom}
              onChange={set("wifi_nom")}
              placeholder="Livebox_BF88"
            />
          </Field>
          <Field label="Mot de passe Wi-Fi">
            <input
              type="text"
              value={fields.wifi_code}
              onChange={set("wifi_code")}
              placeholder="azzevlk,gg20v"
            />
          </Field>
        </div>
      </Section>

      {/* Section : Stationnement */}
      <Section title="🚗 Stationnement">
        <Field label="Informations parking">
          <textarea
            rows={3}
            value={fields.parking_info}
            onChange={set("parking_info")}
            placeholder="Sur place devant la maison, gratuit…"
          />
        </Field>
        <PhotoUploadField
          label="Photo preuve du parking"
          hint="LÉO pourra partager ce lien aux voyageurs qui demandent où se garer."
          value={fields.parking_photo_url}
          onChange={(url) => {
            setFields((prev) => ({ ...prev, parking_photo_url: url }));
            setSaved(false);
          }}
          userId={userId}
          propertyId={propertyId}
          fileSuffix="parking"
        />
      </Section>

      {/* Section : Équipements */}
      <Section title="🏠 Équipements">
        <Field label="Liste des équipements disponibles">
          <textarea
            rows={5}
            value={fields.equipements}
            onChange={set("equipements")}
            placeholder="Lave-linge, sèche-linge, poêle à bois, TV…"
          />
        </Field>
        <PhotoUploadField
          label="Photo des équipements"
          hint="LÉO pourra partager ce lien aux voyageurs qui demandent une preuve visuelle des équipements."
          value={fields.equipements_photo_url}
          onChange={(url) => {
            setFields((prev) => ({ ...prev, equipements_photo_url: url }));
            setSaved(false);
          }}
          userId={userId}
          propertyId={propertyId}
          fileSuffix="equipements"
        />
      </Section>

      {/* Section : Règles */}
      <Section title="📋 Règles de la maison">
        <Field label="Règles à respecter">
          <textarea
            rows={5}
            value={fields.regles_maison}
            onChange={set("regles_maison")}
            placeholder="Ordures à jeter à la fin du séjour…"
          />
        </Field>
      </Section>

      {/* Section : Recommandations */}
      <Section title="⭐ À proximité">
        <Field
          label="Recommandations locales"
          hint="Restaurants, activités, bonnes adresses — LÉO les citera dans ses réponses."
        >
          <textarea
            rows={5}
            value={fields.recommandations}
            onChange={set("recommandations")}
            placeholder="Restaurant La Finette (spécialités jurassiennes), Vignoble des Deux Terres (vins nature)…"
          />
        </Field>
      </Section>

      {/* Section : Contact urgence */}
      <Section title="🚨 Contact d'urgence">
        <Field label="Numéro ou contact en cas d'urgence">
          <input
            type="text"
            value={fields.contact_urgence}
            onChange={set("contact_urgence")}
            placeholder="0781635224"
          />
        </Field>
      </Section>

      {/* Bouton bas de page */}
      <div className="flex justify-end border-t border-night-700 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-porch-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-porch-600 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}

/* ── Composants internes ── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-night-700 bg-night-900 p-6">
      <h3 className="mb-5 text-sm font-semibold text-white">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PhotoUploadField({
  label,
  hint,
  value,
  onChange,
  userId,
  propertyId,
  fileSuffix,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  userId: string;
  propertyId: string;
  fileSuffix: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier ensuite
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Merci de choisir un fichier image (jpeg, png...).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop lourde (5 Mo max).");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${propertyId}/${fileSuffix}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("logement-photos")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) {
        setError("Échec de l'envoi. Réessaie.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logement-photos").getPublicUrl(path);

      // Évite que le navigateur affiche une version mise en cache de
      // l'ancienne image après un remplacement (même chemin de fichier).
      onChange(`${publicUrl}?t=${Date.now()}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-mist-400">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-mist-500">{hint}</p>}
      <div className="flex items-center gap-3">
        {value && (
          <img
            src={value}
            alt="Aperçu"
            className="h-14 w-20 rounded-lg object-cover"
          />
        )}
        <label className="cursor-pointer rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-xs font-medium text-mist-300 transition hover:border-porch-500/40 hover:text-white">
          {uploading ? "Envoi..." : value ? "Changer l'image" : "Déposer une image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-warn">{error}</p>}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactElement;
}) {
  const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  const styledChild = {
    ...child,
    props: {
      ...child.props,
      className:
        "w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-porch-500 focus:outline-none font-mono resize-none",
    },
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-mist-400">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-mist-500">{hint}</p>}
      {styledChild}
    </div>
  );
}
