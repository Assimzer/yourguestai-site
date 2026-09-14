#!/usr/bin/env node
/**
 * Migration ponctuelle Airtable (CSV exportés) -> Supabase.
 *
 * A lancer une seule fois, APRES avoir exécuté
 * supabase/migrations/001_logements_reservations.sql dans Supabase.
 *
 * Usage :
 *   npm install csv-parse                     (une fois)
 *   export SUPABASE_URL="https://hpnqvblvvzwejqkbyjzr.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="..."    (coller directement dans le
 *                                               terminal, jamais dans un
 *                                               fichier commité)
 *   node scripts/migrate-airtable-to-supabase.mjs \
 *     --logements chemin/vers/Logements.csv \
 *     --reservations chemin/vers/Reservations.csv \
 *     --dry-run                                (à enlever une fois vérifié)
 *
 * Le script ne fait AUCUNE écriture tant que --dry-run est présent : il
 * affiche juste ce qu'il ferait. Vu que cette migration n'a pas de retour
 * en arrière prévu, lance toujours d'abord en --dry-run et relis le rapport
 * avant de relancer sans l'option.
 *
 * Comportement :
 *  - Logements.csv : met à jour les lignes `properties` DEJA existantes
 *    (créées via le site), en les retrouvant par `cle_unique_airtable`
 *    (colonne `id_logement` du CSV). La comparaison est normalisée
 *    (espaces/underscores/caractères invisibles ignorés, casse ignorée) --
 *    plusieurs lignes Airtable réelles contiennent des caractères
 *    invisibles cachés dans les noms, cette normalisation les gère. Ne crée
 *    jamais de nouvelle ligne `properties` (une ligne orpheline dans le CSV
 *    = un avertissement, pas une insertion).
 *  - Reservations.csv : insère une ligne dans `reservations` par ligne CSV,
 *    en résolvant `logement_id` via la même comparaison normalisée sur
 *    `id_logement_lookup`.
 */

import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Normalisation -- identique a lib/airtable/normalize.ts du site (espace
// insecable, caracteres zero-largeur, BOM... peuvent se glisser dans un
// export Airtable sans etre visibles a l'oeil).
// ---------------------------------------------------------------------------

const INVISIBLE_CHARS = [0x200b, 0x200c, 0x200d, 0xfeff, 0x00a0, 0x2060]
  .map((code) => String.fromCharCode(code))
  .join("");
const INVISIBLE_CHARS_RE = new RegExp(`[${INVISIBLE_CHARS}]`, "g");

function normalize(s) {
  return (s || "")
    .normalize("NFKC")
    .replace(INVISIBLE_CHARS_RE, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "");
}

// ---------------------------------------------------------------------------
// Config -- noms de colonnes tels qu'observes dans les exports CSV reels
// (adapte si ton export utilise des intitules differents).
// ---------------------------------------------------------------------------

const LOGEMENTS_COLUMNS = {
  id_logement: "id_logement",
  code_logement: "code", // colonne "code" (ex: "LT047"), PAS "Code_Logement"
  numero_proprietaire: "numero_proprietaire",
  adresse: "adresse",
  ville: "ville",
  wifi_nom: "wifi_nom",
  wifi_code: "wifi_code",
  code_acces: "Code_Acces",
  // Prefere les champs deja geres par le site (remplis via le Guide Editor)
  // aux champs bruts Airtable d'origine (checkin/checkout/parking/regle).
  checkin_heure: "checkin_heure",
  checkout_heure: "checkout_heure",
  parking_info: "parking_info",
  instructions_arrivee: "instructions_arrivee",
  regles_maison: "regles_maison",
  recommandations: "recommandations",
  contact_urgence: "contact_urgence",
  photo_url: "photo_url",
  parking_photo_url: "parking_photo_url",
  equipements: "equipements",
  equipements_photo_url: "equipements_photo_url",
};

const RESERVATIONS_COLUMNS = {
  id_logement_lookup: "id_logement_lookup",
  // Repli si le lookup est vide (lien casse cote Airtable vers une ligne
  // Logement fantome/dupliquee) : le nom affiche du logement lie reste
  // present et se normalise correctement (caracteres invisibles retires).
  logement_fallback: "Logement",
  nom_voyageur: "Nom_Voyageur",
  telephone_voyageur: "Telephone_Voyageur",
  date_debut: "Date_Debut",
  date_fin: "Date_Fin",
  code_conv: "Code_conv",
  cle_unique: "Cle_Unique",
};

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--logements") args.logements = argv[++i];
    else if (argv[i] === "--reservations") args.reservations = argv[++i];
    else if (argv[i] === "--dry-run") args.dryRun = true;
  }
  return args;
}

function readCsv(path) {
  const raw = readFileSync(path, "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

// Convertit une date Airtable (souvent "2026-09-14" ou avec heure) en
// "YYYY-MM-DD" pur, attendu par la colonne Postgres `date`.
function toIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function emptyToNull(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

async function loadPropertiesByNormalizedKey(supabase) {
  const { data, error } = await supabase
    .from("properties")
    .select("id, nom, cle_unique_airtable");

  if (error) {
    throw new Error(`Impossible de charger properties: ${error.message}`);
  }

  const map = new Map();
  for (const p of data ?? []) {
    map.set(normalize(p.cle_unique_airtable), p);
  }
  return map;
}

async function migrateLogements(supabase, csvPath, byNormalizedKey, dryRun) {
  const rows = readCsv(csvPath);
  console.log(`\n=== Logements : ${rows.length} lignes dans le CSV ===`);

  let updated = 0;
  let orphans = 0;
  let errors = 0;

  for (const row of rows) {
    const idLogementRaw = emptyToNull(row[LOGEMENTS_COLUMNS.id_logement]);
    if (!idLogementRaw) {
      // Lignes de test/brouillon sans id_logement (ex: "ff", "dd") -- pas
      // de logement Supabase a mettre a jour, on ignore silencieusement.
      continue;
    }

    const match = byNormalizedKey.get(normalize(idLogementRaw));
    if (!match) {
      orphans++;
      console.warn(
        `  [orphelin] aucun logement Supabase pour id_logement='${idLogementRaw}' (normalisé: '${normalize(idLogementRaw)}')`
      );
      continue;
    }

    const patch = {
      code_logement: emptyToNull(row[LOGEMENTS_COLUMNS.code_logement]),
      numero_proprietaire: emptyToNull(row[LOGEMENTS_COLUMNS.numero_proprietaire]),
      adresse: emptyToNull(row[LOGEMENTS_COLUMNS.adresse]),
      ville: emptyToNull(row[LOGEMENTS_COLUMNS.ville]),
      wifi_nom: emptyToNull(row[LOGEMENTS_COLUMNS.wifi_nom]),
      wifi_code: emptyToNull(row[LOGEMENTS_COLUMNS.wifi_code]),
      code_acces: emptyToNull(row[LOGEMENTS_COLUMNS.code_acces]),
      checkin_heure: emptyToNull(row[LOGEMENTS_COLUMNS.checkin_heure]),
      checkout_heure: emptyToNull(row[LOGEMENTS_COLUMNS.checkout_heure]),
      parking_info: emptyToNull(row[LOGEMENTS_COLUMNS.parking_info]),
      instructions_arrivee: emptyToNull(row[LOGEMENTS_COLUMNS.instructions_arrivee]),
      regles_maison: emptyToNull(row[LOGEMENTS_COLUMNS.regles_maison]),
      recommandations: emptyToNull(row[LOGEMENTS_COLUMNS.recommandations]),
      contact_urgence: emptyToNull(row[LOGEMENTS_COLUMNS.contact_urgence]),
      photo_url: emptyToNull(row[LOGEMENTS_COLUMNS.photo_url]),
      parking_photo_url: emptyToNull(row[LOGEMENTS_COLUMNS.parking_photo_url]),
      equipements: emptyToNull(row[LOGEMENTS_COLUMNS.equipements]),
      equipements_photo_url: emptyToNull(row[LOGEMENTS_COLUMNS.equipements_photo_url]),
    };

    // Ne remplace jamais une valeur deja renseignee cote Supabase par du
    // vide venant d'une ligne CSV incomplete (utile car plusieurs logements
    // ont deja ete edites via le site avant cette migration).
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== null)
    );

    if (Object.keys(cleanPatch).length === 0) {
      continue;
    }

    if (dryRun) {
      console.log(`  [dry-run] UPDATE properties (id=${match.id}, nom='${match.nom}') SET`, cleanPatch);
      continue;
    }

    const { error } = await supabase
      .from("properties")
      .update(cleanPatch)
      .eq("id", match.id);

    if (error) {
      errors++;
      console.error(`  [erreur] ${idLogementRaw} (id=${match.id}):`, error.message);
    } else {
      updated++;
    }
  }

  console.log(`Logements : ${updated} mis à jour, ${orphans} orphelins, ${errors} erreurs.`);
}

async function migrateReservations(supabase, csvPath, byNormalizedKey, dryRun) {
  const rows = readCsv(csvPath);
  console.log(`\n=== Reservations : ${rows.length} lignes dans le CSV ===`);

  let inserted = 0;
  let orphans = 0;
  let skippedDates = 0;
  let errors = 0;
  const toInsert = [];

  for (const row of rows) {
    const idLogementLookupRaw =
      emptyToNull(row[RESERVATIONS_COLUMNS.id_logement_lookup]) ||
      emptyToNull(row[RESERVATIONS_COLUMNS.logement_fallback]);
    const match = idLogementLookupRaw ? byNormalizedKey.get(normalize(idLogementLookupRaw)) : undefined;

    if (!match) {
      orphans++;
      console.warn(
        `  [orphelin] réservation sans logement correspondant (id_logement_lookup='${idLogementLookupRaw}')`
      );
      continue;
    }

    const dateDebut = toIsoDate(row[RESERVATIONS_COLUMNS.date_debut]);
    const dateFin = toIsoDate(row[RESERVATIONS_COLUMNS.date_fin]);
    if (!dateDebut || !dateFin) {
      skippedDates++;
      console.warn(`  [skip] dates invalides pour la ligne (logement='${match.nom}'):`, {
        date_debut: row[RESERVATIONS_COLUMNS.date_debut],
        date_fin: row[RESERVATIONS_COLUMNS.date_fin],
      });
      continue;
    }

    const cleUnique =
      emptyToNull(row[RESERVATIONS_COLUMNS.cle_unique]) ||
      `${idLogementLookupRaw}_${dateDebut}_${Math.random().toString(36).slice(2, 8)}`;

    toInsert.push({
      logement_id: match.id,
      nom_voyageur: emptyToNull(row[RESERVATIONS_COLUMNS.nom_voyageur]),
      telephone_voyageur: emptyToNull(row[RESERVATIONS_COLUMNS.telephone_voyageur]),
      date_debut: dateDebut,
      date_fin: dateFin,
      code_conv: emptyToNull(row[RESERVATIONS_COLUMNS.code_conv]),
      cle_unique: cleUnique,
    });
  }

  if (dryRun) {
    console.log(`  [dry-run] ${toInsert.length} lignes seraient insérées dans reservations.`);
    console.log(
      `Reservations : ${toInsert.length} à insérer, ${orphans} orphelines, ${skippedDates} dates invalides.`
    );
    return;
  }

  // Insertion par lots de 500 pour rester raisonnable côté API. Sur
  // conflit de cle_unique (relance du script apres une premiere passe
  // partielle), on ignore la ligne plutot que planter tout le lot.
  const BATCH_SIZE = 500;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("reservations")
      .upsert(batch, { onConflict: "cle_unique", ignoreDuplicates: true });
    if (error) {
      errors += batch.length;
      console.error(`  [erreur lot ${i}-${i + batch.length}]:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(
    `Reservations : ${inserted} traitées (insérées ou déjà présentes), ${orphans} orphelines, ${skippedDates} dates invalides, ${errors} erreurs.`
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.logements && !args.reservations) {
    console.error(
      "Usage: node scripts/migrate-airtable-to-supabase.mjs --logements <csv> --reservations <csv> [--dry-run]"
    );
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Variables d'environnement manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (à exporter dans le terminal, jamais dans un fichier committé)."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  if (args.dryRun) {
    console.log(">>> MODE DRY-RUN : aucune écriture ne sera faite <<<");
  }

  const byNormalizedKey = await loadPropertiesByNormalizedKey(supabase);
  console.log(`${byNormalizedKey.size} logements Supabase chargés pour la résolution.`);

  if (args.logements) {
    await migrateLogements(supabase, args.logements, byNormalizedKey, args.dryRun);
  }
  if (args.reservations) {
    await migrateReservations(supabase, args.reservations, byNormalizedKey, args.dryRun);
  }

  console.log("\nTerminé.");
}

main().catch((err) => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});
