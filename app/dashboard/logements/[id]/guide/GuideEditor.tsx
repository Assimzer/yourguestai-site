"use client";

import { useEffect, useState } from "react";

type GuideFields = {
  adresse: string;
  photo_url: string;
  checkin_heure: string;
  checkout_heure: string;
  code_acces: string;
  wifi_nom: string;
  wifi_code: string;
  parking_info: string;
  equipements: string;
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
  equipements: "",
  regles_maison: "",
  recommandations: "",
  contact_urgence: "",
};

export default function GuideEditor({
  propertyId,
  propertyNom,
}: {
  propertyId: string;
  propertyNom: string;
}) {
  const [fields, setFields] = useState<GuideFields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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
          equipements: f.equipements ?? "",
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
        <Field label="Adresse du logement">
          <input
            type="text"
            value={fields.adresse}
            onChange={set("adresse")}
            placeholder="2 rue du Pré, 39600 Arbois"
          />
        </Field>
        <Field label="URL de la photo de couverture" hint="Lien direct vers une image (Airbnb, Imgur, etc.)">
          <input
            type="url"
            value={fields.photo_url}
            onChange={set("photo_url")}
            placeholder="https://…/photo.jpg"
          />
        </Field>
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
