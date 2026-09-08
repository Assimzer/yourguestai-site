import type { Metadata } from "next";
import Link from "next/link";
import LegalPageNav from "../components/LegalPageNav";

export const metadata: Metadata = {
  title: "Accord sur le traitement des données (DPA) — YOURGUESTAI",
  description:
    "Accord sur le traitement des données personnelles (DPA) au titre de l'article 28 du RGPD, entre le client de YOURGUESTAI et YOURGUESTAI.",
};

export default function DpaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/" className="font-display text-lg italic text-white">
        YOURGUESTAI
      </Link>

      <h1 className="mt-10 font-display text-3xl italic text-white">
        Accord sur le traitement des données (DPA)
      </h1>
      <p className="mt-2 text-sm text-mist-500">
        Dernière mise à jour : 8 septembre 2026 · Version 1.0
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-mist-300">
        <p>
          Accord sur le traitement des données personnelles au titre de
          l&apos;article 28 du Règlement (UE) 2016/679 (RGPD), entre le
          client de YOURGUESTAI (« Responsable du traitement ») et
          YOURGUESTAI, nom commercial d&apos;Indépendance Musicale
          (entrepreneur individuel, SIRET 904 465 325 00010) (« Sous-traitant »).
        </p>

        <section>
          <h2 className="font-display text-lg text-white">Art. 1 — Définitions</h2>
          <p className="mt-2">Aux fins du présent accord, on entend par :</p>
          <ul className="mt-2 space-y-2">
            <li>
              <span className="font-medium text-white">RGPD :</span>{" "}
              Règlement (UE) 2016/679 relatif à la protection des personnes
              physiques à l&apos;égard du traitement des données personnelles.
            </li>
            <li>
              <span className="font-medium text-white">Données personnelles :</span>{" "}
              toute information se rapportant à une personne physique
              identifiée ou identifiable.
            </li>
            <li>
              <span className="font-medium text-white">Traitement :</span>{" "}
              toute opération ou ensemble d&apos;opérations effectuées sur des
              données personnelles.
            </li>
            <li>
              <span className="font-medium text-white">Personne concernée :</span>{" "}
              la personne physique à laquelle se rapportent les données
              personnelles — dans ce contexte, les voyageurs des logements du
              Responsable.
            </li>
            <li>
              <span className="font-medium text-white">Sous-traitant ultérieur :</span>{" "}
              tiers mandaté par le Sous-traitant pour effectuer des
              opérations spécifiques de traitement (voir Art. 6 et la{" "}
              <Link href="/sous-traitants" className="underline decoration-night-600 underline-offset-4 hover:text-white">
                liste des sous-traitants
              </Link>
              ).
            </li>
            <li>
              <span className="font-medium text-white">Violation de données (Data Breach) :</span>{" "}
              violation de sécurité entraînant, accidentellement ou de
              manière illicite, la destruction, la perte, l&apos;altération,
              la divulgation non autorisée ou l&apos;accès aux données
              personnelles.
            </li>
            <li>
              <span className="font-medium text-white">Contrat principal :</span>{" "}
              le contrat de service (CGU/CGV) entre le Responsable et
              YOURGUESTAI pour l&apos;utilisation de l&apos;assistant LÉO.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 2 — Objet et durée</h2>
          <p className="mt-2">
            Le présent DPA régit le traitement des données personnelles
            effectué par le Sous-traitant pour le compte du Responsable dans
            le cadre de la fourniture du service LÉO. L&apos;accord entre en
            vigueur en même temps que le Contrat principal et reste effectif
            pendant toute la durée de celui-ci, jusqu&apos;à la restitution
            ou la suppression complètes des données personnelles.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            Art. 3 — Nature et finalités du traitement
          </h2>
          <p className="mt-2">
            Le Sous-traitant traite les données personnelles exclusivement
            aux fins suivantes, sur instruction documentée du Responsable :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Importation et synchronisation des réservations (lien iCal)</li>
            <li>Identification des voyageurs et association à leur réservation</li>
            <li>Génération et envoi de messages automatiques sur WhatsApp</li>
            <li>
              Traitement des messages via des modèles d&apos;intelligence
              artificielle pour la génération de réponses contextuelles
            </li>
            <li>Recommandation d&apos;activités locales et lien de réservation associé</li>
            <li>Conservation de l&apos;historique des conversations</li>
            <li>Escalade vers l&apos;hôte en cas de demande sortant du périmètre de LÉO</li>
            <li>Génération de statistiques par logement pour le tableau de bord de l&apos;hôte</li>
            <li>Fourniture d&apos;assistance technique au Responsable</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            Art. 4 — Catégories de données et personnes concernées
          </h2>
          <p className="mt-2 font-medium text-white">Catégories de personnes concernées</p>
          <p className="mt-1">
            Voyageurs des logements gérés par le Responsable via le service
            LÉO, et l&apos;hôte lui-même pour la gestion de son compte.
          </p>
          <p className="mt-4 font-medium text-white">Catégories de données personnelles</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Données d&apos;identification : nom, prénom (si renseigné)</li>
            <li>Données de contact : numéro de téléphone WhatsApp, email de l&apos;hôte</li>
            <li>Données de réservation : dates de séjour, code de conversation, canal d&apos;origine</li>
            <li>Contenu des communications : messages échangés entre le voyageur et LÉO</li>
            <li>Données de compte hôte : identité, email, informations de facturation</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 5 — Obligations du Sous-traitant</h2>
          <p className="mt-2">Le Sous-traitant s&apos;engage à :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Traiter les données personnelles uniquement sur la base d&apos;instructions documentées du Responsable</li>
            <li>Veiller à la confidentialité des données auxquelles il a accès</li>
            <li>Adopter les mesures de sécurité exigées par l&apos;article 32 du RGPD</li>
            <li>Respecter les conditions de recours aux sous-traitants ultérieurs (Art. 6)</li>
            <li>Assister le Responsable dans le respect des droits des personnes concernées</li>
            <li>Assister le Responsable dans la conduite d&apos;analyses d&apos;impact (AIPD) si nécessaire</li>
            <li>Au terme du service, restituer ou supprimer les données selon les instructions du Responsable</li>
            <li>Mettre à disposition les informations nécessaires pour démontrer le respect de ses obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 6 — Sous-traitants ultérieurs</h2>
          <p className="mt-2">
            Le Responsable autorise de manière générale le recours aux
            sous-traitants ultérieurs suivants :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Meta Platforms Ireland Ltd — WhatsApp Business Platform, messagerie</li>
            <li>OpenRouter, Inc. (relayant vers Google Gemini) — traitement du langage naturel</li>
            <li>Airtable, Inc. — stockage opérationnel des logements et conversations</li>
            <li>n8n GmbH — orchestration des automatisations</li>
            <li>Supabase, Inc. — authentification et données de compte</li>
            <li>Vercel Inc. — hébergement du site et du tableau de bord</li>
            <li>Stripe, Inc. / Stripe Payments Europe Ltd — gestion des paiements</li>
          </ul>
          <p className="mt-2">
            La liste à jour des sous-traitants est disponible à la page{" "}
            <Link href="/sous-traitants" className="underline decoration-night-600 underline-offset-4 hover:text-white">
              Sous-traitants
            </Link>
            . Le Sous-traitant informe le Responsable de toute modification
            avec un préavis minimum de 15 jours. Le Responsable a le droit
            de s&apos;opposer à la nomination d&apos;un nouveau
            sous-traitant dans les 15 jours suivant la communication.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 7 — Mesures de sécurité</h2>
          <p className="mt-2 font-medium text-white">Mesures techniques</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Chiffrement des communications en transit (TLS)</li>
            <li>Accès aux outils internes limité aux personnes strictement nécessaires</li>
            <li>Authentification à deux facteurs sur les comptes d&apos;administration et les consoles des sous-traitants</li>
          </ul>
          <p className="mt-4 font-medium text-white">Mesures organisationnelles</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Point de contact unique et responsable pour toute demande liée aux données personnelles</li>
            <li>Procédure documentée de gestion des incidents</li>
            <li>Revue périodique des accès et des intégrations connectées</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 8 — Transferts internationaux</h2>
          <p className="mt-2">
            Les transferts de données personnelles vers des pays tiers (en
            particulier les États-Unis) s&apos;effectuent sur la base des
            Clauses Contractuelles Types (CCT) adoptées par la Commission
            européenne et/ou d&apos;un mécanisme de transfert reconnu
            équivalent par chaque sous-traitant concerné.
          </p>
          <p className="mt-2">
            Les données personnelles des voyageurs ne sont pas utilisées
            pour l&apos;entraînement (training) des modèles
            d&apos;intelligence artificielle utilisés par LÉO.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 9 — Data Breach</h2>
          <p className="mt-2">
            En cas de violation de données personnelles, le Sous-traitant
            notifie le Responsable sans retard injustifié et au plus tard
            dans les 48 heures à compter de sa connaissance de
            l&apos;incident, en fournissant les informations nécessaires
            pour permettre au Responsable de remplir ses obligations de
            notification au titre des articles 33 et 34 du RGPD.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            Art. 10 — Droits des personnes concernées
          </h2>
          <p className="mt-2">
            Le Sous-traitant assiste le Responsable, par des mesures
            techniques et organisationnelles appropriées, dans
            l&apos;exécution de l&apos;obligation de donner suite aux
            demandes des personnes concernées pour l&apos;exercice de leurs
            droits (accès, rectification, effacement, limitation,
            portabilité, opposition).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 11 — Audit</h2>
          <p className="mt-2">
            Le Sous-traitant met à disposition du Responsable les
            informations raisonnablement nécessaires pour démontrer le
            respect des obligations prévues par le présent accord, et
            autorise un audit ou une inspection avec un préavis minimum de
            30 jours. Les certifications publiées par les sous-traitants
            ultérieurs (Meta, Stripe, Vercel, Supabase notamment) peuvent
            être présentées à titre d&apos;éléments de preuve complémentaires.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">
            Art. 12 — Restitution et suppression des données
          </h2>
          <p className="mt-2">
            Au terme du Contrat principal, le Responsable peut demander la
            restitution de ses données dans un délai de 30 jours. En
            l&apos;absence de demande, les données seront supprimées dans un
            délai de 60 jours à compter de la cessation du service, sous
            réserve des obligations de conservation prévues par la loi.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 13 — Responsabilité</h2>
          <p className="mt-2">
            La responsabilité globale du Sous-traitant découlant du présent
            DPA ou y étant liée est limitée aux montants effectivement
            versés par le Responsable au cours des 12 mois précédant
            l&apos;événement à l&apos;origine de la responsabilité.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 14 — Obligations du Responsable</h2>
          <p className="mt-2">
            Le Responsable garantit avoir obtenu tous les consentements
            nécessaires et disposer d&apos;une base juridique valable pour
            le traitement des données personnelles des voyageurs qu&apos;il
            renseigne. Le Responsable s&apos;engage à fournir des
            instructions conformes à la réglementation en vigueur.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-white">Art. 15 — Dispositions finales</h2>
          <p className="mt-2">
            Le présent DPA est régi par le droit français. Les tribunaux
            français sont seuls compétents en cas de litige découlant du
            présent accord.
          </p>
        </section>

        <p className="text-xs text-mist-500">Contact : yourguestai@gmail.com</p>
      </div>

      <LegalPageNav current="/dpa" />
    </main>
  );
}
