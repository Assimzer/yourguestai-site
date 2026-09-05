# YOURGUESTAI (LÉO)

Concierge IA pour hôtes de locations courte durée (Airbnb, Booking, conciergeries).
LÉO répond automatiquement aux voyageurs via WhatsApp (questions pratiques, codes
d'accès, recommandations locales), en s'appuyant sur les infos propres à chaque
logement configurées par l'hôte.

## Architecture

- **Site / dashboard hôte** : Next.js (App Router) + TypeScript + Tailwind, ce repo.
  Déployé sur Vercel (à finaliser). Auth + données via Supabase.
- **Automatisations / agent conversationnel** : n8n Cloud (`guestai.app.n8n.cloud`).
  Gère les workflows WhatsApp, la génération de réponses, les intégrations.
  ⚠️ Claude Code n'a PAS accès à ces workflows (ils ne sont pas dans ce dossier) —
  pour toute modification n8n, donner les instructions précises à l'utilisateur
  pour qu'il les applique lui-même dans l'éditeur n8n, jamais improviser.
- **Stockage logements/messages** : Airtable (tables `Properties`/`Logements`,
  `Messages`, `Reservations`), synchronisé avec Supabase (`properties`) via
  webhooks n8n déclenchés par le site.
- **Paiement** : Stripe. Fonctionnel en mode test de bout en bout (Checkout,
  webhook, Customer Portal, sync quantity). Tarification "au volume" (le tarif
  du palier atteint s'applique à tous les logements actifs) :
  - 1-2 logements : 19,90 €/logement/mois
  - 3-4 logements : 16,00 €/logement/mois
  - 5+ logements : 13,00 €/logement/mois
  - Annuel = 12 mois avec 20% de réduction (191,04 € / 153,60 € / 124,80 €),
    prix garanti bloqué 12 mois
  - Essai gratuit 14 jours, limité à 1 logement actif pendant l'essai
  - Auto-entrepreneur en franchise de TVA : mention "TVA non applicable,
    art. 293 B du CGI" à ajouter dans Stripe → Settings → Billing → Invoice
    template (footer), pas de Stripe Tax activé (`managed_payments: {enabled:false}`)

## Conventions du projet

- Table Supabase `hosts` : `id` = UUID Auth (trigger `handle_new_host`,
  n'insère que `id` + `email`), `statut_abonnement` (`non_abonne` / `essai` /
  `actif` / `suspendu` — valeurs contraintes par `hosts_statut_abonnement_check`,
  toute nouvelle valeur doit être ajoutée à cette contrainte CHECK avant usage),
  `stripe_customer_id`, `stripe_subscription_id`, `logements_quantity`.
- Table Supabase `properties` : `host_id`, `actif` (bool), `cle_unique_airtable`
  (fait le lien avec Airtable côté n8n).
- `lib/stripe/syncLogementQuantity.js` : synchronise la quantity Stripe avec le
  nombre de `properties.actif = true` d'un host. Proration uniquement à la
  hausse (jamais de crédit remboursé sur une baisse en cours de mois).
- `app/api/toggle-property/route.ts` : seule porte d'entrée pour activer un
  logement. Bloque (402) si pas d'abonnement Stripe réel (`stripe_customer_id`
  + statut `actif`/`essai`), et limite à 1 logement actif pendant l'essai.
- Toutes les routes API webhooks vers n8n passent par
  `N8N_*_WEBHOOK_URL` + header `X-Webhook-Secret` (jamais appelées côté client).
- Style Tailwind : palette custom `night-*` (fonds sombres), `mist-*` (textes
  secondaires), `porch-500` (accent), `ok` / `warn` (statuts).
- Repo GitHub privé : github.com/Assimzer/yourguestai-site. Projet travaillé
  sur deux PC (nommés "assim" et "DDi5"), synchronisés via ce dépôt — toujours
  `git pull` avant de commencer une session, `git push` en fin de session.
- `.env.local` n'est jamais commité (clés Stripe/Supabase réelles) —
  `.env.local.example` sert de référence pour les noms de variables.

## État des fonctionnalités

- ✅ Affiliation GetYourGuide : intégrée et testée dans le workflow n8n
  (nœud `Code in JavaScript` avant `Déterminer statut1`, prompt de
  `Agent gemini` mis à jour). partner_id : BCNQE2V.
- ⏸️ Système d'avis/notes sur LÉO post-check-out : mis en pause (jugé trop
  complexe à construire dans n8n pour l'instant), des nœuds partiels existent
  déjà dans le workflow (`Chercher checkouts veille`, `Envoyer demande avis
  WhatsApp`, etc.) mais rien de fonctionnel. À reprendre plus tard.
- 🚧 En cours : `/dashboard/messages` enrichi côté site (résumé par logement,
  durée de conversation, statut de réservation EN_COURS/PROCHAIN/PASSE
  recalculé via `/api/messages` en croisant les réservations déjà exposées
  par `N8N_RESERVATIONS_WEBHOOK_URL` — aucun champ Airtable requis pour ça).
  Il manque encore côté n8n, à faire manuellement par l'utilisateur : ajouter
  un champ `escalade` (case à cocher) sur la table Airtable `Messages`, un
  petit webhook relais `escalade-relay` (Webhook → HTTP Request WhatsApp →
  Update Airtable par `message_record_id` → Respond), rediriger l'URL du
  node `Tool_notify_owner1` vers ce relais, et ajouter
  `escalade: !!f["escalade"]` dans le node `Code in JavaScript6` du webhook
  `get-messages`. Tant que ce n'est pas fait, le badge "Escaladé" et le
  compteur d'escalades resteront à 0 (le code site est prêt à lire ce champ
  dès qu'il existera).
- 📋 Prévu, pas commencé : passage en environnement Stripe Live (recréer les
  Prices en mode Live, déployer sur Vercel, webhook de prod fixe, variables
  d'env Vercel) ; migration n8n vers VPS self-hosted (envisagée, pas décidée).

## Pièges déjà rencontrés (pour ne pas les répéter)

- Stripe a plusieurs "environnements de test" distincts sur ce compte
  (Sandbox "environnement de test yourguestai" vs compte classique
  "Yourguestai" en Mode test) — toujours vérifier que `stripe login` /
  `stripe listen` et le Dashboard consulté correspondent au même environnement
  que `STRIPE_SECRET_KEY` dans `.env.local`, sinon le webhook ne reçoit rien
  silencieusement.
- Les Prices Stripe sont immuables une fois créés — toute modification de
  grille tarifaire nécessite un nouveau Price, jamais une édition de l'existant.
- Ne jamais coller de vraies clés API en clair dans un message de conversation
  sans prévoir de les régénérer ensuite.

## À ne jamais faire

- Ne jamais committer `.env.local` (clés Stripe/Supabase réelles).
- Ne jamais modifier `proration_behavior` en dur sans repasser par la logique
  hausse/baisse de `syncLogementQuantity.js`.
- Ne jamais modifier ou créer de nœuds n8n directement — toujours expliquer
  précisément à l'utilisateur quel nœud toucher et donner le code exact à
  copier-coller lui-même.
  
  - 🚧 À faire : deux améliorations sur l'édition du livret d'accueil
  (`/dashboard/logements/[id]/guide`) :
  1. Ajouter une photo au logement en déposant un fichier image (jpeg, png...)
     directement, en plus (ou à la place) de la simple saisie d'URL actuelle.
     Utiliser Supabase Storage pour l'hébergement du fichier (bucket dédié,
     ex: `logement-photos`), récupérer l'URL publique générée et la stocker
     dans Supabase/Airtable comme c'est déjà fait pour une URL classique.
  2. Autocomplétion d'adresse : quand l'hôte commence à taper l'adresse du
     logement, proposer une liste de suggestions à sélectionner plutôt que
     de la taper entièrement à la main. Utiliser l'API Adresse du
     gouvernement français (`https://api-adresse.data.gouv.fr/search/?q=...`,
     gratuite, sans clé API requise) plutôt que Google Places (payant) —
     adapté puisque le service cible la France.