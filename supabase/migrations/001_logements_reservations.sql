-- Migration Airtable -> Supabase : colonnes "Logements" sur `properties`
-- (existante) + nouvelle table `reservations` + vue de statut calculé.
--
-- A exécuter une seule fois dans Supabase -> SQL Editor, sur le projet
-- de production (hpnqvblvvzwejqkbyjzr).
--
-- Choix : pas de nouvelle table "logements" séparée. `properties` joue déjà
-- ce rôle (une ligne par logement, `host_id`, RLS déjà en place, utilisée
-- par 15+ routes du site) -- créer une table à part la dupliquerait. On
-- ajoute donc les colonnes Airtable manquantes directement dessus.

-- ============================================================================
-- 1) properties : colonnes issues d'Airtable "Logements"
-- ============================================================================

alter table public.properties
  add column if not exists code_logement text,
  add column if not exists nom_conciergerie text,
  add column if not exists numero_proprietaire text,
  add column if not exists numero_proprietaire_defaut text,
  add column if not exists adresse text,
  add column if not exists ville text,
  add column if not exists wifi_nom text,
  add column if not exists wifi_code text,
  add column if not exists code_acces text,
  add column if not exists checkin_heure text,
  add column if not exists checkout_heure text,
  add column if not exists parking_info text,
  add column if not exists consignes_arrivee text,
  add column if not exists regles_maison text,
  add column if not exists recommandations text,
  add column if not exists contact_urgence text,
  add column if not exists photo_url text,
  add column if not exists parking_photo_url text,
  add column if not exists equipements text,
  add column if not exists equipements_photo_url text;

-- Code_Logement : un code par logement (ex. "LT047"), utilisé par un
-- voyageur pour s'identifier au tout premier message WhatsApp. Unique
-- globalement (tous hôtes confondus, comme dans Airtable). Nullable tant
-- que tous les logements existants n'ont pas été backfillés par le script
-- de migration -- une fois rempli pour tous, on pourra passer en NOT NULL.
create unique index if not exists properties_code_logement_key
  on public.properties (code_logement)
  where code_logement is not null;

-- NOTE (à faire toi-même après import) : ceci ne crée PAS les policies RLS
-- de `properties` -- elles existent déjà (host_id = auth.uid() côté
-- dashboard, service_role bypass côté n8n). Les nouvelles colonnes héritent
-- automatiquement des policies existantes sur la table, rien à ajouter ici.


-- ============================================================================
-- 2) reservations : nouvelle table (remplace Airtable "Reservations")
-- ============================================================================

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  logement_id uuid not null references public.properties (id) on delete cascade,
  nom_voyageur text,
  telephone_voyageur text,
  date_debut date not null,
  date_fin date not null,
  -- Ancien système d'identification (un code par réservation). Conservé
  -- pour compatibilité avec les liens déjà envoyés aux voyageurs, mais
  -- Code_Logement (sur `properties`) devient la méthode principale.
  code_conv text,
  -- Clé technique stable pour cibler une réservation précise depuis le site
  -- (delete / update-name / generate-conv-code) sans dépendre du nom du
  -- voyageur ni de son téléphone (peut être vide au moment de la création).
  cle_unique text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_logement_id_idx
  on public.reservations (logement_id);

create index if not exists reservations_telephone_voyageur_idx
  on public.reservations (telephone_voyageur);

create unique index if not exists reservations_cle_unique_key
  on public.reservations (cle_unique);

create unique index if not exists reservations_code_conv_key
  on public.reservations (code_conv)
  where code_conv is not null;

-- updated_at auto -- même pattern que pour les autres tables du projet.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
  before update on public.reservations
  for each row
  execute function public.set_updated_at();

alter table public.reservations enable row level security;

-- Un hôte ne voit/modifie que les réservations de ses propres logements.
-- n8n utilise la clé service_role (bypass RLS), donc aucune policy dédiée
-- n'est nécessaire pour le bot WhatsApp -- même principe que `messages`.
create policy "Host reads own reservations"
  on public.reservations for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = reservations.logement_id
        and p.host_id = auth.uid()
    )
  );

create policy "Host inserts reservations on own properties"
  on public.reservations for insert
  with check (
    exists (
      select 1 from public.properties p
      where p.id = reservations.logement_id
        and p.host_id = auth.uid()
    )
  );

create policy "Host updates own reservations"
  on public.reservations for update
  using (
    exists (
      select 1 from public.properties p
      where p.id = reservations.logement_id
        and p.host_id = auth.uid()
    )
  );

create policy "Host deletes own reservations"
  on public.reservations for delete
  using (
    exists (
      select 1 from public.properties p
      where p.id = reservations.logement_id
        and p.host_id = auth.uid()
    )
  );


-- ============================================================================
-- 3) Vue : statut calculé en SQL (remplace le calcul JS de "Déterminer statut1")
-- ============================================================================

create or replace view public.reservations_avec_statut as
select
  r.*,
  p.nom as logement_nom,
  p.cle_unique_airtable,
  p.code_logement,
  case
    when current_date between r.date_debut and r.date_fin then 'EN_COURS'
    when current_date < r.date_debut then 'PROCHAIN'
    when current_date > r.date_fin then 'PASSE'
    else 'INCONNU'
  end as statut
from public.reservations r
join public.properties p on p.id = r.logement_id;

-- Les vues Postgres héritent des policies RLS des tables sous-jacentes
-- (security_invoker par défaut sur les versions récentes de Postgres/
-- Supabase) -- un hôte connecté ne verra ici que les réservations de ses
-- propres logements, exactement comme sur `reservations` directement.
-- n8n (service_role) voit tout, comme d'habitude.
