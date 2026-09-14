# Checklist post-migration Airtable → Supabase

## Base de données

- [ ] `supabase/migrations/001_logements_reservations.sql` exécuté sans erreur dans Supabase → SQL Editor
- [ ] `properties` a bien les nouvelles colonnes (`code_logement`, `wifi_nom`, `consignes_arrivee`, etc.)
- [ ] Table `reservations` créée, RLS activé (vérifier dans Supabase → Authentication → Policies)
- [ ] Vue `reservations_avec_statut` existe et renvoie bien un `statut` cohérent (teste avec une réservation dont tu connais les dates)
- [ ] `date_debut`/`date_fin` sont bien de type `date` (pas `text`) — vérifiable dans Table Editor, colonne "type"

## Migration des données (CSV)

- [ ] Export CSV Airtable "Logements" et "Reservations" fait
- [ ] `node scripts/migrate-airtable-to-supabase.mjs --logements ... --reservations ... --dry-run` lancé et rapport lu en entier
- [ ] Aucune ligne "orpheline" inattendue (sinon : vérifier que les `id_logement`/`cle_unique_airtable` correspondent bien entre Airtable et Supabase avant de continuer)
- [ ] Script relancé SANS `--dry-run`, rapport final avec 0 erreur
- [ ] Vérification manuelle dans Supabase Table Editor : quelques lignes `properties` et `reservations` au hasard, comparées à Airtable

## Site (déjà fait dans cette session, à vérifier en prod)

- [ ] Build (`npm run build`) passé sans erreur après déploiement
- [ ] Page `/dashboard/logements/[id]/guide` : les champs se chargent et s'enregistrent (teste un vrai logement)
- [ ] Page `/dashboard/reservations` : liste, création, suppression, renommage voyageur, génération de code — tout testé en conditions réelles
- [ ] Création d'un nouveau logement : `code_logement` bien généré (visible en base, format `LTxxxx`)

## n8n (voir `docs/migration-n8n-guide.md`)

- [ ] `Chercher réservation1` migré vers Supabase, testé avec un vrai numéro
- [ ] `Déterminer statut1` simplifié, `contexte_reservation` toujours complet (wifi, codes, règles inclus)
- [ ] Identification par `Code_Logement` fonctionnelle de bout en bout (nouveau voyageur, premier message)
- [ ] Ancienne identification par `Code_conv` toujours fonctionnelle (rétrocompatibilité)
- [ ] Sync iCal migrée, testée sur un logement avec un vrai calendrier Airbnb/Booking
- [ ] Webhooks obsolètes (create/delete/update-reservation, generate-conv-code, get-reservations, get-guide, update-guide, create/update/delete-property) vérifiés inutilisés (Executions vides depuis la bascule) puis supprimés
- [ ] Décision prise sur le webhook `toggle` (voir note dédiée dans le guide) avant de le supprimer
- [ ] Credentials Airtable retirés de n8n (dernière étape, une fois tout confirmé stable)

## Sécurité / accès

- [ ] Clé `service_role` Supabase utilisée dans les nouveaux nœuds n8n = la même déjà en place pour les nœuds Messages (pas une nouvelle clé à gérer)
- [ ] Un hôte connecté sur le site ne voit QUE ses propres réservations (teste avec deux comptes différents)
- [ ] n8n peut toujours lire/écrire sans blocage RLS (les policies ne s'appliquent qu'aux requêtes faites avec une clé anon/session — la clé service_role bypass tout, comme pour `messages`)
