# Migration Airtable → Supabase — guide n8n (à faire toi-même)

Contexte : le schéma SQL (`supabase/migrations/001_logements_reservations.sql`)
et le script d'import CSV (`scripts/migrate-airtable-to-supabase.mjs`) sont
prêts. Le site (Next.js) a déjà été basculé sur Supabase pour tout ce qu'il
peut faire lui-même. Ce document couvre uniquement ce qui reste côté n8n —
je n'ai pas et ne peux pas modifier ton workflow directement, donc voici
exactement quoi faire, nœud par nœud.

## Bonne nouvelle : beaucoup de nœuds n'ont plus besoin d'être migrés, juste supprimés

En basculant les routes du site sur Supabase directement, plusieurs webhooks
n8n ne sont **plus jamais appelés par le site**. Migrer leur logique vers
Supabase serait du travail inutile — le plus simple et le plus sûr est de
**les supprimer entièrement** une fois que tu as confirmé qu'ils ne servent
plus à rien d'autre :

| Webhook n8n | Pourquoi il est obsolète |
|---|---|
| `create-reservation` | Le site écrit directement dans Supabase (`app/api/reservations/create`) |
| `delete-reservation` | Idem (`app/api/reservations/delete`) |
| `update-reservation-name` | Idem (`app/api/reservations/update-name`) |
| `generate-conv-code` | Le site génère et stocke le code lui-même (`app/api/generate-conv-code`) |
| `get-reservations` | Le site lit `reservations_avec_statut` directement (`lib/reservations/getReservationsData.ts`) |
| `get-guide` | Le site lit `properties` directement (`app/api/get-guide`) |
| `update-guide` | Idem (`app/api/update-guide`) |
| `create-property` | Le site crée la ligne `properties` complète lui-même, `code_logement` inclus |
| `update-property-name` | Le site met à jour `properties.nom` directement, plus de notification nécessaire |
| `delete-property` | Idem, suppression directe côté Supabase |

**Avant de les supprimer** : vérifie dans l'onglet Executions de n8n qu'aucun
de ces webhooks n'a été appelé depuis ta bascule du site (dans les dernières
24-48h) — si c'est le cas, tout est bon, supprime les nœuds correspondants
(webhook trigger + toute la chaîne qui suit, jusqu'au Respond to Webhook).

**Un cas à part, à ne PAS toucher sans vérifier d'abord** : le webhook de
`toggle` (`N8N_TOGGLE_WEBHOOK_URL`, utilisé par `app/api/toggle-property` et
par la désactivation automatique en cas de paiement refusé dans
`app/api/stripe/webhook`) — je n'ai pas retiré ces appels côté site. Avant
de supprimer ce nœud côté n8n, il faut d'abord vérifier COMMENT le workflow
utilise aujourd'hui le statut "actif" d'un logement pour bloquer/autoriser
LÉO à répondre (probablement un filtre dans "Search records" du flux
principal). Une fois que ce filtre lit `properties.actif` dans Supabase au
lieu d'Airtable, ce webhook de notification devient inutile lui aussi et
tu pourras le supprimer — mais dans cet ordre, pas avant.

## Ce qui reste vraiment à migrer (le bot WhatsApp lui-même)

Ces nœuds tournent à chaque message WhatsApp reçu : ils doivent continuer à
fonctionner, donc à migrer précisément, pas à supprimer.

Pour tous les nœuds HTTP Request ci-dessous : mêmes headers que ceux déjà
en place pour les nœuds Messages (`apikey` + `Authorization: Bearer <clé
service_role>`), URL de base `https://hpnqvblvvzwejqkbyjzr.supabase.co/rest/v1/`.

---

### 1. `Chercher réservation1`

**Aujourd'hui** : recherche Airtable sur la table Reservations, formule
`REGEX_REPLACE({Telephone_Voyageur}, '[^0-9]', '') = '{{ $json.telephone... }}'`.

**Remplacement** — nœud HTTP Request, GET :
```
https://hpnqvblvvzwejqkbyjzr.supabase.co/rest/v1/reservations_avec_statut?telephone_voyageur=eq.{{ $('WhatsApp Trigger1').item.json.messages[0].from }}
```
Headers : `apikey` + `Authorization` (clé service_role).

Cette vue (`reservations_avec_statut`) renvoie déjà les colonnes de
`reservations` PLUS `statut` (EN_COURS/PROCHAIN/PASSE/INCONNU) et
`logement_nom` — plus besoin d'aller chercher le logement séparément pour
l'affichage.

---

### 2. `Déterminer statut1`

**Aujourd'hui** : recalcule EN_COURS/PROCHAIN/PASSE en JS à partir de
`Date_Debut`/`Date_Fin`.

**Remplacement** : le statut est déjà calculé par la vue SQL — supprime tout
le bloc de calcul (`enrichies`, `enCours`, `prochaines`, `passees`, le champ
`_statut`). Ne garde QUE la construction de `contexte_reservation` (le texte
envoyé à l'agent) et la logique conditionnelle sur les infos sensibles selon
le statut.

Nouveau code (remplace tout le corps du `try`) :
```js
try {
  let inputItem = {};
  try { inputItem = $input.item.json; } catch (e) {}

  let extraireData = {};
  try {
    const extraireItems = $('Extraire message1').all();
    if (extraireItems.length > 0) extraireData = extraireItems[0].json;
  } catch (e) {}

  let whatsappData = {};
  try {
    const items = $('WhatsApp Trigger1').all();
    if (items.length > 0) whatsappData = items[0].json;
  } catch (e) {}

  const waMessage =
    whatsappData?.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    || whatsappData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    || {};

  const telephone = extraireData.telephone || inputItem.telephone || inputItem.from || waMessage.from || '';
  const message_texte = extraireData.message_texte || inputItem.message_texte || inputItem.message || inputItem.text || waMessage.text?.body || '';
  const maintenant = new Date().toISOString();
  const NUMERO_CONTACT_GENERAL = "33781635224";

  function premiereValeur(champ) {
    return Array.isArray(champ) ? champ[0] : champ;
  }

  // Reservations deja triees par priorite de statut cote requete Supabase
  // (voir noeud "Chercher reservation1" -- ajoute-y un tri/ordre si besoin,
  // ex: ?order=date_debut.asc), ici on choisit juste EN_COURS en priorite.
  let reservationsBrutes = [];
  try { reservationsBrutes = $('Chercher réservation1').all().map(i => i.json); } catch (e) {}

  const enCours = reservationsBrutes.find(r => r.statut === 'EN_COURS');
  const prochaines = reservationsBrutes
    .filter(r => r.statut === 'PROCHAIN')
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
  const passees = reservationsBrutes
    .filter(r => r.statut === 'PASSE')
    .sort((a, b) => new Date(b.date_fin) - new Date(a.date_fin));

  const choisie = enCours || prochaines[0] || passees[0];
  const statut = choisie ? choisie.statut : 'INCONNU';

  let reservation = null;
  if (choisie) {
    const numeroProprietaireLogement =
      premiereValeur(choisie.numero_proprietaire) ||
      NUMERO_CONTACT_GENERAL;

    reservation = {
      id_logement: choisie.cle_unique_airtable,
      parking_photo_url: '', // completes ci-dessous via une jointure logement si besoin
      equipements_photo_url: '',
      cle_unique: choisie.cle_unique,
      code_conv: choisie.code_conv || '',
      nom_voyageur: choisie.nom_voyageur || '',
      telephone_voyageur: choisie.telephone_voyageur || '',
      date_arrivee: choisie.date_debut || '',
      date_depart: choisie.date_fin || '',
      logement: choisie.logement_nom || '',
      numero_proprietaire: numeroProprietaireLogement
    };
  }

  const numeroProprietaireFinal = reservation ? reservation.numero_proprietaire : NUMERO_CONTACT_GENERAL;

  const contexteReservation = reservation
    ? [
        `- Logement : ${reservation.logement}`,
        `- Téléphone voyageur : ${reservation.telephone_voyageur}`,
        `- Dates du séjour : du ${reservation.date_arrivee} au ${reservation.date_depart}`,
        `- Code de conversation : ${reservation.code_conv}`,
      ].filter(Boolean).join('\n')
    : '- Aucune réservation trouvée pour ce numéro : tu ne connais ni logement ni conciergerie.';

  return [{
    json: {
      telephone, message_texte, maintenant, statut, reservation,
      numero_proprietaire: numeroProprietaireFinal,
      contexte_reservation: contexteReservation,
    }
  }];
} catch (err) {
  return [{ json: { erreur: true, message_erreur: err.message, stack: err.stack } }];
}
```

⚠️ Ce code est un point de départ simplifié : **remets tes champs
Wifi/checkin/checkout/parking/consignes/règles** dans `reservation` et dans
`contexte_reservation` comme dans ta version actuelle — ils viennent
maintenant de `properties` et pas de la réservation. Le plus simple est
d'ajouter un nœud HTTP Request juste avant (`GET
.../properties?id=eq.{{ le logement_id de la reservation choisie }}`) pour
récupérer wifi/checkin/etc, puis de les injecter dans `reservation` ici.

---

### 3. `search_reservation` (tool de l'agent) + `sauvegarder_telephone_voyageur` (tool de l'agent)

**Aujourd'hui** : recherche/mise à jour Airtable par `Code_conv`.

**Nouveau système principal : identification par `Code_Logement`** (un code
par logement, pas par réservation). Remplace ces deux tools par :

**Tool `identifier_logement`** (HTTP Request, GET) :
```
https://hpnqvblvvzwejqkbyjzr.supabase.co/rest/v1/properties?code_logement=eq.{{ $fromAI("code_logement", "Le code logement fourni par le voyageur", "string").trim().toUpperCase() }}
```
Description du tool : "Recherche le logement correspondant au code fourni
par le voyageur (ex: LT047)."

**Tool `rattacher_voyageur`** (HTTP Request, PATCH) — appelé juste après si
`identifier_logement` a trouvé un logement :
```
URL: https://hpnqvblvvzwejqkbyjzr.supabase.co/rest/v1/reservations?logement_id=eq.{{ id du logement trouvé }}&statut=in.(EN_COURS,PROCHAIN)&order=date_debut.asc&limit=1
Method: PATCH
Body: { "telephone_voyageur": "{{ $('Déterminer statut1').item.json.telephone }}" }
```
⚠️ PostgREST n'accepte pas `order`/`limit` sur un PATCH directement de la
même façon que sur un GET dans toutes les versions -- si ça bloque, fais-le
en 2 étapes : un GET pour trouver l'id de la bonne réservation
(`reservations_avec_statut?logement_id=eq...&statut=in.(EN_COURS,PROCHAIN)&order=date_debut.asc&limit=1`),
puis un PATCH `reservations?id=eq.<id trouvé>` avec le téléphone.

**Garder `search_reservation` par `Code_conv`** en plus (branche de
compatibilité), pour les liens déjà envoyés à d'anciens voyageurs :
```
https://hpnqvblvvzwejqkbyjzr.supabase.co/rest/v1/reservations_avec_statut?code_conv=eq.{{ $fromAI("code_conv", "...", "string").trim() }}
```
puis PATCH `reservations?id=eq.<id>` pour `telephone_voyageur` -- exactement
le même principe qu'avant, juste sur Supabase au lieu d'Airtable.

Mets à jour le prompt système de l'agent pour présenter `code_logement`
comme méthode principale et `code_conv` seulement si le voyageur a déjà un
lien/code envoyé par l'ancien système.

---

### 4. Synchronisation iCal (workflow planifié)

Nœuds concernés : `Search records2` (Logements), `Create or update a
record1` (upsert Reservations).

**`Search records2`** → HTTP Request GET :
```
https://hpnqvblvvzwejqkbyjzr.supabase.co/rest/v1/properties?ical_url=not.is.null&select=id,ical_url,nom
```

**`Create or update a record1`** (upsert par `Cle_Unique`) → HTTP Request
POST avec header `Prefer: resolution=merge-duplicates` (upsert PostgREST) :
```
URL: https://hpnqvblvvzwejqkbyjzr.supabase.co/rest/v1/reservations?on_conflict=cle_unique
Method: POST
Headers: Prefer: resolution=merge-duplicates,return=representation
Body: {
  "logement_id": "{{ id du logement, deja connu du Search records2 }}",
  "date_debut": "{{ $json.date_debut }}",
  "date_fin": "{{ $json.date_fin }}",
  "cle_unique": "{{ $json.Cle_Unique }}"
}
```
(nécessite une contrainte UNIQUE sur `cle_unique`, déjà créée par le script
SQL -- `reservations_cle_unique_key`).

Adapte le `Code in JavaScript2` qui construit `Cle_Unique`/`Logement_Relation`
pour qu'il produise directement `logement_id` (l'UUID Supabase, pas un
tableau de type lien Airtable).

---

## Une fois tout testé et validé

1. Retire les credentials Airtable de n8n (Settings → Credentials).
2. Supprime les webhooks listés dans le tableau du début.
3. Archive (n'exporte pas de suppression définitive tout de suite) tes
   bases Airtable pendant quelques semaines, au cas où.
