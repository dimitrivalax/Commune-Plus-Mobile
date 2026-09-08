# Commune Plus Mobile

Application citoyenne Ionic + Vue pour les signalements, réservations de salles et informations municipales.

Logiciel libre sous **EUPL-1.2**. L’offre hébergée [Commune Plus](https://commune-plus.fr) (SaaS) est un service distinct : marque, domaines et backends de production restent réservés. Les forks doivent utiliser leurs propres projets Firebase / Cloudinary / BackOffice.

Companion repo : [Commune-Plus-BackOffice](https://github.com/dimitrivalax/Commune-Plus-BackOffice).

## Stack

- Frontend : Ionic 8 + Vue 3
- Données : Firebase Firestore
- Notifications push : FCM (via Capacitor)
- Images : Cloudinary
- Build : Vite

## Installation

1. Installer les dépendances :

```bash
pnpm install
```

2. Copier les variables d'environnement :

```bash
cp .env.example .env
```

3. Renseigner au minimum :

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_BACKOFFICE_API_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

4. (Builds natifs) Configurer Firebase Android / iOS :

```bash
cp android/app/google-services.json.example android/app/google-services.json
cp ios/App/App/GoogleService-Info.plist.example ios/App/App/GoogleService-Info.plist
```

Remplacez les placeholders par les valeurs de **votre** projet Firebase (ou téléchargez les fichiers depuis la console Firebase). Ne committez jamais les fichiers réels.

## Self-host (aperçu)

1. Créer un projet Firebase (Firestore + éventuellement Auth / FCM).
2. Déployer les règles : `firestore.rules` à la racine (`firebase deploy --only firestore:rules`).
3. Créer un compte Cloudinary et un upload preset unsigned pour le client.
4. Pointer `VITE_BACKOFFICE_API_URL` vers une instance du [BackOffice](https://github.com/dimitrivalax/Commune-Plus-BackOffice) (emails signalement, notifications, etc.).
5. Optionnel : PostHog pour l’analytics.

### Collections Firestore utilisées

- `commune`, `salle`, `signalement`, `reservation_salle`, `actualite`
- `proposition`, `proposition_comment`, `proposition_vote`, `push_token`

### Legacy `supabase/`

Le dossier `supabase/` contient d’anciennes edge functions / notes. Le runtime actuel s’appuie sur **Firebase** et l’API BackOffice, pas sur Supabase côté client.

## Firestore Rules

Un fichier `firestore.rules` est fourni à la racine de ce projet.

```bash
firebase deploy --only firestore:rules
```

Ces règles sont compatibles avec le fonctionnement actuel de l'app mobile (lecture publique + validations minimales d'écriture côté client). Adaptez-les à votre politique de sécurité avant une mise en production.

## Personnalisation du design

L'application utilise un design épuré et lisible en marque blanche. Pour personnaliser selon votre ville :

1. Éditez `src/config/city.js` (`name`, `primaryColor`, `logo`).
2. Placez votre logo dans `public/assets/`.

## Configuration Cloudinary

1. Créer un compte sur [Cloudinary](https://cloudinary.com)
2. Créer un upload preset
3. Ajouter les valeurs dans `.env` (jamais dans le dépôt git)

## Développement

```bash
pnpm dev
```

Application : http://localhost:5173

## Build

```bash
pnpm build
```

## Capacitor

```bash
npx cap add ios   # ou android
npx cap sync
npx cap open ios  # ou android
```

## Crash & Error Reporting

- **PostHog** : analytics produit
- **Firebase Crashlytics** : crashs natifs / erreurs JS (fichiers Firebase natifs requis)

Voir aussi `PRIVACY_POLICY.md` (politique de l’application distribuée Commune Plus). Les forks doivent publier leur propre politique de confidentialité.

## Structure du projet

```
src/
├── views/          # Pages
├── services/       # Firestore / Cloudinary / Push
├── utils/
├── router/
├── theme/
└── main.js
```

## Licence

Copyright (c) 2026 Dimitri Valax EI — [EUPL-1.2](./LICENSE).

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) et [SECURITY.md](./SECURITY.md).
