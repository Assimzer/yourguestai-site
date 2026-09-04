# YOURGUESTAI — Site + Portail Hôte

Landing page + dashboard hôte (Next.js + Supabase). L'authentification et
les propriétés vivent dans Supabase ; Airtable reste le backend
opérationnel que consulte LÉO (staff, réservations, guides) — ce projet ne
touche pas au workflow n8n existant, il l'appelle via des webhooks.

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com), crée un nouveau projet (gratuit).
2. Dans **Project Settings → API**, récupère `Project URL` et `anon public key`.
3. Va dans **SQL Editor** et exécute ce script pour créer les tables :

```sql
-- Table des hôtes (miroir léger, la vérité de l'identité reste dans
-- auth.users géré par Supabase Auth)
create table hosts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  statut_abonnement text not null default 'essai'
    check (statut_abonnement in ('essai', 'actif', 'suspendu')),
  created_at timestamptz not null default now()
);

-- Table des logements
create table properties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  nom text not null,
  statut text not null default 'inactif'
    check (statut in ('actif', 'inactif')),
  ical_url text,
  cle_unique_airtable text not null unique, -- pont vers Airtable.Logements.id_logement
  created_at timestamptz not null default now()
);

-- Un hôte ne voit / ne modifie que ses propres données
alter table hosts enable row level security;
alter table properties enable row level security;

create policy "hosts_select_own" on hosts
  for select using (auth.uid() = id);

create policy "properties_select_own" on properties
  for select using (auth.uid() = host_id);

create policy "properties_update_own" on properties
  for update using (auth.uid() = host_id);

-- Crée automatiquement la ligne "hosts" quand quelqu'un s'inscrit
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.hosts (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

> Les routes API du site (`toggle-property`, `connect-ical`) utilisent la
> clé **anon** + la session de l'utilisateur connecté, jamais une clé
> service_role — les policies RLS ci-dessus sont donc ce qui protège
> réellement les données : impossible pour un hôte de lire ou modifier le
> logement d'un autre.

### Rattacher tes logements existants

Pour chaque logement déjà dans Airtable, crée la ligne correspondante :

```sql
insert into properties (host_id, nom, cle_unique_airtable)
values ('<uuid-de-l-hote>', 'Airbnb Arbois', 'airbnb_arbois');
```

`cle_unique_airtable` doit correspondre exactement à la valeur du champ
`id_logement` dans ta table Airtable `Logements`.

## 2. Créer les 3 webhooks n8n

Dans ton workflow n8n existant (ou un nouveau workflow dédié "Dashboard
Site"), ajoute 3 nodes **Webhook** :

| Webhook | Reçoit | Action attendue dans n8n |
| --- | --- | --- |
| `toggle-property` | `{ id_logement, actif }` | Vérifier le header `X-Webhook-Secret`, puis mettre à jour le champ `actif` dans Airtable.Logements où `id_logement` correspond |
| `connect-ical` | `{ id_logement, ical_url }` | Vérifier le secret, mettre à jour `ical_url` dans Airtable.Logements, et déclencher manuellement la synchro (le même flux que ton Schedule Trigger existant) |
| `demo-request` | `{ nom, email, nb_logements }` | Vérifier le secret, écrire dans une table Airtable `Prospects` (ou envoyer une notification WhatsApp/email à toi-même) |
| `create-property` | `{ id_logement, nom, host_email }` | Vérifier le secret, créer une nouvelle ligne dans Airtable.Logements avec `id_logement` et `nom` (wifi, codes, règles restent vides jusqu'à ce que tu les complètes manuellement) |
| `delete-property` | `{ id_logement }` | Vérifier le secret, supprimer (ou désactiver) la ligne correspondante dans Airtable.Logements où `id_logement` correspond |
| `connect-ical` | `{ id_logement, ical_url }` | Vérifier le secret, mettre à jour `ical_url` dans Airtable.Logements, et déclencher manuellement la synchro (le même flux que ton Schedule Trigger existant) |
| `demo-request` | `{ nom, email, nb_logements }` | Vérifier le secret, écrire dans une table Airtable `Prospects` (ou envoyer une notification WhatsApp/email à toi-même) |

| `get-reservations` | `{ id_logements: [...] }` | Vérifier le secret, retourner les réservations Airtable.Reservations dont `nom du logement` est dans la liste : `{ reservations: [{ id, cle_unique, id_logement, nom_voyageur, telephone_voyageur, code_conv, date_debut, date_fin }] }` |
| `update-reservation-name` | `{ id_logement, cle_unique, nom_voyageur }` | Vérifier le secret, mettre à jour `Nom_Voyageur` sur la ligne Airtable.Reservations correspondant à `cle_unique` |
| `generate-conv-code` | `{ id_logement, cle_unique }` | Vérifier le secret, générer un code aléatoire unique (vérifier l'absence de collision sur toute la table), l'écrire dans `Code_conv` sur la ligne correspondante, retourner `{ code_conv }` |
| `get-messages` | `{ id_logements: [...] }` | Vérifier le secret, retourner l'historique de conversations Airtable.Messages pour ces logements : `{ messages: [{ id, id_logement, nom_voyageur, dernier_message, statut, horodatage }] }` |
| `get-message-stats` | `{ id_logement }` | Vérifier le secret, retourner `{ count }` (nombre de messages répondus par LÉO pour ce logement) |
| `get-avis` | `{ id_logements: [...] }` | Vérifier le secret, retourner les avis Airtable.Avis dont `id_logement` est dans la liste : `{ avis: [{ id, id_logement, telephone, note, commentaire, date }] }` |

**Sécuriser chaque webhook** : ajoute un node **IF** juste après le
Webhook trigger qui compare `{{ $json.headers['x-webhook-secret'] }}` à
une variable d'environnement n8n (`N8N_WEBHOOK_SECRET`) — si ça ne
correspond pas, retourne une erreur 401 et arrête l'exécution.

Copie chaque URL de webhook (Production URL, pas Test URL) dans ton
`.env.local`.

## 3. Configurer et lancer le site en local

```bash
npm install
cp .env.local.example .env.local
# remplis les valeurs Supabase + n8n dans .env.local
npm run dev
```

Le site tourne sur http://localhost:3000.

## 4. Déployer sur Vercel

1. Pousse ce dossier sur un dépôt GitHub.
2. Sur [vercel.com](https://vercel.com), "Add New Project" → importe le
   dépôt.
3. Dans **Environment Variables**, ajoute les mêmes clés que ton
   `.env.local` (les 6 variables).
4. Déploie. Vercel te donne une URL `xxx.vercel.app` — tu pourras
   ensuite brancher ton propre nom de domaine (ex. yourguestai.fr) dans
   **Settings → Domains**.

## Structure du projet

```
app/
  page.tsx              → landing page publique
  login/, signup/        → auth hôte (Supabase)
  dashboard/              → liste des logements (protégée par middleware.ts)
  api/
    toggle-property/      → seule porte d'entrée pour activer/désactiver un logement
    connect-ical/          → seule porte d'entrée pour enregistrer un lien iCal
    demo-request/           → formulaire public de la landing page
lib/supabase/             → clients Supabase (browser + server)
middleware.ts              → protège /dashboard, rafraîchit la session
```

Aucune clé Supabase service_role ni aucun accès direct à Airtable
n'existe côté navigateur — tout passe par ces routes API, qui vérifient
la session et l'appartenance du logement avant d'agir.
