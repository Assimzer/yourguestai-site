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
 *    (créées via le site), en les retrouvant par `cle_unique_airtable` =
 *    la colonne `id_logement` du CSV. Ne crée jamais de nouvelle ligne
 *    `properties` (une ligne orpheline dans le CSV = un avertissement, pas
 *    une insertion).
 *  - Reservations.csv : insère une ligne dans `reservations` par ligne CSV,
 *    en résolvant `logement_id` via `properties.cle_unique_airtable` =
 *    la colonne `id_logement_lookup` du CSV (adapte ce nom de colonne plus
 *    bas si ton export Airtable utilise un intitulé différent).
 */

import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Config -- adapte ces noms de colonnes si tes CSV exportés d'Airtable
// utilisent des intitulés différents de ceux du schéma décrit dans la
// conversation.
// ---------------------------------------------------------------------------

const LOGEMENTS_COLUMNS = {
  id_logement: "id_logement",
  code_logement: "Code_Logement",
  nom_conciergerie: "Nom_Conciergerie",
  numero_proprietaire: "Numero_Proprietaire",
  numero_proprietaire_defaut: "Numero_Proprietaire_Defaut",
  adresse: "adresse",
  ville: "ville",
  wifi_nom: "Wifi_Nom",
  wifi_code: "wifi_code",
  code_acces: "Code_Acces",
  checkin_heure: "checkin",
  checkout_heure: "checkout",
  parking_info: "parking",
  consignes_arrivee: "Consignes_Arrivee",
  regles_maison: "regle",
  parking_photo_url: "parking_photo_url",
  equipements_photo_url: "equipements_photo_url",
};

const RESERVATIONS_COLUMNS = {
  id_logement_lookup: "id_logement_lookup",
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

// Convertit une date Airtable (souvent "2026-09-14" ou "14/09/2026" ou avec
// heure) en "YYYY-MM-DD" pur, attendu par la colonne Postgres `date`.
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

async function migrateLogements(supabase, csvPath, dryRun) {
  const rows = readCsv(csvPath);
  console.log(`\n=== Logements : ${rows.length} lignes dans le CSV ===`);

  let updated = 0;
  let orphans = 0;
  let errors = 0;

  for (const row of rows) {
    const idLogement = emptyToNull(row[LOGEMENTS_COLUMNS.id_logement]);
    if (!idLogement) {
      console.warn("  [skip] ligne sans id_logement:", row);
      continue;
    }

    const patch = {
      code_logement: emptyToNull(row[LOGEMENTS_COLUMNS.code_logement]),
      nom_conciergerie: emptyToNull(row[LOGEMENTS_COLUMNS.nom_conciergerie]),
      numero_proprietaire: emptyToNull(row[LOGEMENTS_COLUMNS.numero_proprietaire]),
      numero_proprietaire_defaut: emptyToNull(
        row[LOGEMENTS_COLUMNS.numero_proprietaire_defaut]
      ),
      adresse: emptyToNull(row[LOGEMENTS_COLUMNS.adresse]),
      ville: emptyToNull(row[LOGEMENTS_COLUMNS.ville]),
      wifi_nom: emptyToNull(row[LOGEMENTS_COLUMNS.wifi_nom]),
      wifi_code: emptyToNull(row[LOGEMENTS_COLUMNS.wifi_code]),
      code_acces: emptyToNull(row[LOGEMENTS_COLUMNS.code_acces]),
      checkin_heure: emptyToNull(row[LOGEMENTS_COLUMNS.checkin_heure]),
      checkout_heure: emptyToNull(row[LOGEMENTS_COLUMNS.checkout_heure]),
      parking_info: emptyToNull(row[LOGEMENTS_COLUMNS.parking_info]),
      consignes_arrivee: emptyToNull(row[LOGEMENTS_COLUMNS.consignes_arrivee]),
      regles_maison: emptyToNull(row[LOGEMENTS_COLUMNS.regles_maison]),
      parking_photo_url: emptyToNull(row[LOGEMENTS_COLUMNS.parking_photo_url]),
      equipements_photo_url: emptyToNull(row[LOGEMENTS_COLUMNS.equipements_photo_url]),
    };

    if (dryRun) {
      console.log(`  [dry-run] UPDATE properties SET ... WHERE cle_unique_airtable = '${idLogement}'`);
      continue;
    }

    const { data, error } = await supabase
      .from("properties")
      .update(patch)
      .eq("cle_unique_airtable", idLogement)
      .select("id");

    if (error) {
      errors++;
      console.error(`  [erreur] ${idLogement}:`, error.message);
    } else if (!data || data.length === 0) {
      orphans++;
      console.warn(`  [orphelin] aucun logement Supabase avec cle_unique_airtable = '${idLogement}'`);
    } else {
      updated++;
    }
  }

  console.log(`Logements : ${updated} mis à jour, ${orphans} orphelins, ${errors} erreurs.`);
}

async function migrateReservations(supabase, csvPath, dryRun) {
  const rows = readCsv(csvPath);
  console.log(`\n=== Reservations : ${rows.length} lignes dans le CSV ===`);

  // Charge une fois toutes les properties pour résoudre les logement_id
  // sans faire une requête par ligne.
  const { data: properties, error: propsError } = await supabase
    .from("properties")
    .select("id, cle_unique_airtable");

  if (propsError) {
    console.error("Impossible de charger properties:", propsError.message);
    return;
  }

  const byCleUnique = new Map(
    (properties ?? []).map((p) => [p.cle_unique_airtable, p.id])
  );

  let inserted = 0;
  let orphans = 0;
  let errors = 0;
  const toInsert = [];

  for (const row of rows) {
    const idLogementLookup = emptyToNull(row[RESERVATIONS_COLUMNS.id_logement_lookup]);
    const logementId = idLogementLookup ? byCleUnique.get(idLogementLookup) : undefined;

    if (!logementId) {
      orphans++;
      console.warn(
        `  [orphelin] réservation sans logement correspondant (id_logement_lookup='${idLogementLookup}')`
      );
      continue;
    }

    const dateDebut = toIsoDate(row[RESERVATIONS_COLUMNS.date_debut]);
    const dateFin = toIsoDate(row[RESERVATIONS_COLUMNS.date_fin]);
    if (!dateDebut || !dateFin) {
      console.warn(`  [skip] dates invalides pour la ligne:`, row);
      continue;
    }

    const cleUnique =
      emptyToNull(row[RESERVATIONS_COLUMNS.cle_unique]) ||
      `${idLogementLookup}_${dateDebut}_${Math.random().toString(36).slice(2, 8)}`;

    toInsert.push({
      logement_id: logementId,
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
    console.log(`Reservations : ${toInsert.length} à insérer, ${orphans} orphelines.`);
    return;
  }

  // Insertion par lots de 500 pour rester raisonnable côté API.
  const BATCH_SIZE = 500;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("reservations").insert(batch);
    if (error) {
      errors += batch.length;
      console.error(`  [erreur lot ${i}-${i + batch.length}]:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Reservations : ${inserted} insérées, ${orphans} orphelines, ${errors} erreurs.`);
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

  // Logements avant Reservations : les reservations dépendent des
  // properties déjà backfillées (pour l'instant on ne lit que
  // cle_unique_airtable qui existe déjà, donc l'ordre n'est pas bloquant,
  // mais on garde une exécution séquentielle lisible).
  if (args.logements) {
    await migrateLogements(supabase, args.logements, args.dryRun);
  }
  if (args.reservations) {
    await migrateReservations(supabase, args.reservations, args.dryRun);
  }

  console.log("\nTerminé.");
}

main().catch((err) => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});
