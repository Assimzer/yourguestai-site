-- Elargit reservations_avec_statut avec les champs du logement necessaires
-- au bot WhatsApp (Determiner statut1) : jusqu'ici la vue n'exposait que
-- nom/cle_unique_airtable/code_logement, il manquait wifi/codes/adresse/etc.
-- CREATE OR REPLACE VIEW est sans danger, peut etre relance a volonte.

create or replace view public.reservations_avec_statut as
select
  r.*,
  p.nom as logement_nom,
  p.cle_unique_airtable,
  p.code_logement,
  p.numero_proprietaire,
  p.adresse,
  p.ville,
  p.wifi_nom,
  p.wifi_code,
  p.code_acces,
  p.checkin_heure,
  p.checkout_heure,
  p.parking_info,
  p.instructions_arrivee,
  p.regles_maison,
  p.recommandations,
  p.contact_urgence,
  p.parking_photo_url,
  p.equipements_photo_url,
  case
    when current_date between r.date_debut and r.date_fin then 'EN_COURS'
    when current_date < r.date_debut then 'PROCHAIN'
    when current_date > r.date_fin then 'PASSE'
    else 'INCONNU'
  end as statut
from public.reservations r
join public.properties p on p.id = r.logement_id;
