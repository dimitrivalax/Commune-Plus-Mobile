# Politique de confidentialité — Commune Plus

**Dernière mise à jour :** 1er avril 2026  

La présente politique décrit comment l’application mobile **Commune Plus** (« l’Application ») traite les données personnelles, dans le respect du Règlement général sur la protection des données (RGPD) et des exigences de la [Google Play Console](https://play.google.com/about/developer-content-policy/) (section données utilisateur et fiche « Sécurité des données »).

---

## 1. Responsable du traitement

**Dimitri Valax EI, 10 chemin du Couzi 31810 Venerque** est responsable du traitement des données collectées via l’Application dans le cadre du service proposé aux usagers et aux communes.

Pour toute question relative à cette politique ou à vos données :  
**contact@commune-plus.fr**

---

## 2. Données personnelles collectées

Selon les fonctionnalités que vous utilisez, les données suivantes peuvent être traitées :

### 2.1 Données d’identification et de contact

- Nom, prénom, adresse e-mail, numéro de téléphone, adresse postale (saisis dans les paramètres ou les formulaires).
- Ces informations peuvent être stockées localement sur l’appareil et transmises aux serveurs du service pour la gestion des signalements, réservations, doléances / propositions et communications associées.

### 2.2 Données relatives à la commune

- Commune sélectionnée (identifiant, nom, code postal, et informations publiques affichées par l’Application).
- Permet d’adapter le contenu et de lier vos actions à la bonne collectivité.

### 2.3 Signalements, réservations et propositions

- Contenu des formulaires (description, créneaux, informations liées à la réservation, etc.).
- **Photographies** que vous joignez : elles sont envoyées vers un service d’hébergement d’images (**Cloudinary**) ; seule l’URL résultante est en général conservée côté base de données.
- **Localisation** : coordonnées GPS et/ou adresse peut être associée à un signalement lorsque vous l’autorisez, pour situer le problème signalé. Un géocodage inverse peut être effectué via le service public **API Adresse (data.gouv.fr)** pour convertir des coordonnées en libellé d’adresse.

### 2.4 Notifications push

- Si vous acceptez les notifications : un **jeton d’appareil** (token FCM / équivalent) est généré et enregistré, avec l’**identifiant de plateforme** (Android / iOS), un **identifiant utilisateur** technique, l’**identifiant de commune** concernée et, le cas échéant, votre **adresse e-mail** pour associer le bon compte appareil aux messages.
- Le traitement permet l’envoi d’alertes liées aux informations municipales, signalements ou doléances.
- L’infrastructure de livraison des messages peut passer par **Google Firebase Cloud Messaging** (Google LLC).

### 2.5 Données techniques et d’usage (analyse produit)

- L’Application peut utiliser **PostHog** pour mesurer l’utilisation (parcours d’écran, événements). Les données transmises peuvent inclure un identifiant analytique, des propriétés liées à votre profil renseigné dans l’app (par ex. commune, coordonnées si vous avez rempli le formulaire) et le contexte technique habituel (type d’appareil, système).
- La **session replay** est désactivée dans la configuration actuelle de l’Application ; se référer à la configuration effective au moment de l’utilisation.

### 2.6 Stockage et backends

- Les données métier sont stockées dans une base hébergée via **Supabase** (hébergeur et outils associés, selon la configuration du projet).
- Certains traitements (ex. envoi d’e-mail de notification à la mairie) peuvent passer par des **fonctions serveur** (Edge Functions) liées à ce même environnement.

---

## 3. Finalités du traitement

Les données sont utilisées pour :

- Permettre la **sélection de la commune** et l’accès aux **informations municipales** ;
- Créer et suivre les **signalements** et, le cas échéant, les **réservations** et **propositions** ;
- **Contacter** l’usager ou la collectivité lorsque cela est nécessaire au service ;
- **Envoyer des notifications push** lorsque vous y avez consenti ;
- **Assurer la sécurité**, le bon fonctionnement et l’**amélioration** de l’Application (dont statistiques d’usage) ;
- **Respecter les obligations légales** applicables.

---

## 4. Bases légales (RGPD)

Selon les traitements : **exécution du service** demandé par l’usager, **intérêt légitime** (sécurité, amélioration du produit, mesure d’audience proportionnée), **consentement** lorsque la loi l’exige (notifications push, géolocalisation, accès caméra / galerie selon les plateformes), et **obligation légale** le cas échéant.

---

## 5. Destinataires et sous-traitants

Les données peuvent être communiquées aux catégories suivantes :

| Prestataire (exemple) | Rôle |
|----------------------|------|
| **Supabase** | Hébergement base de données, API, fonctions |
| **Google (Firebase / FCM)** | Messagerie push sur Android (et couche FCM sur iOS si utilisée) — voir [politique Google](https://policies.google.com/privacy) |
| **Cloudinary** | Hébergement et diffusion des images |
| **PostHog** | Analytique et événements produit |
| **État français / data.gouv.fr** | API Adresse pour le géocodage inverse (requêtes depuis l’Application) |
| **Communes / administrations** | Données nécessaires à la gestion des signalements, réservations et canaux institutionnels |

Les sous-traitants sont liés par des contrats conformes au RGPD. D’éventuels **transferts hors Union européenne** (ex. États-Unis pour certains fournisseurs) reposent sur les mécanismes prévus par la réglementation (clauses contractuelles types, etc.), dans la mesure applicable.

---

## 6. Durée de conservation

Les données sont conservées **pendant la durée nécessaire** aux finalités décrites et aux obligations légales (archives, preuves). Les jetons de notification **inactifs** peuvent être désactivés ou supprimés selon les règles opérationnelles du service. Les précisions peuvent être affinées **comme sur le portail ou par la mairie** selon votre modèle juridique.

---

## 7. Vos droits

Conformément au RGPD, vous disposez des droits d’**accès**, de **rectification**, d’**effacement**, de **limitation**, d’**opposition** (dans les conditions prévues par la loi), de **portabilité** (lorsqu’il s’applique), et du droit de **définir des directives** post-mortem (en France). Vous pouvez retirer votre **consentement** aux traitements qui en dépendent (notifications, géolocalisation, etc.) via les réglages du système et de l’Application.

**Réclamations** : vous pouvez introduire une réclamation auprès de l’**CNIL** (https://www.cnil.fr).

---

## 8. Sécurité

Des mesures techniques et organisationnelles appropriées sont mises en œuvre pour protéger les données contre l’accès non autorisé, la perte ou la divulgation. Aucune mesure n’étant absolue, une sécurité totale ne peut être garantie.

---

## 9. Enfants

L’Application s’adresse en principe au **grand public** et aux usagers des communes. Si vous estimez qu’un mineur a transmis des données sans accord parental requis, contactez-nous aux coordonnées de la section 1.

---

## 10. Évolution de la politique

La présente politique peut être **mise à jour** (fonctionnalités, fournisseurs, cadre légal). La date de « dernière mise à jour » en tête de document sera révisée ; pour les changements substantiels, une information dans l’Application ou sur le site **https://commune-plus.fr/privacy-policy** pourra être utilisée.

---

## 11. Google Play — lien public

Pour publier l’Application sur Google Play, vous devez indiquer dans la Console une **URL publique** vers cette politique (page web identique ou dérivée de ce texte). Le contenu de la fiche **Sécurité des données** (types de données collectées, finalités, partage avec des tiers) doit être **cohérent** avec la présente politique.

**URL de publication prévue :** `https://commune-plus.fr/privacy-policy`

---

*Document fourni à titre d’aide à la mise en conformité. Validez le texte avec un conseil juridique adapté à votre structure (mairie, société, association, etc.) et à votre schéma de responsabilité du traitement (responsable conjoint ou non avec les communes).*
