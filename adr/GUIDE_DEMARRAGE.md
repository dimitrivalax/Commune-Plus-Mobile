# Guide de demarrage - Commune Plus Mobile

## Prerequis

- Node.js 18+
- pnpm
- Un projet Firebase (Firestore + FCM)

## Installation

```bash
pnpm install
cp .env.example .env
```

Variables minimales a renseigner dans `.env` :

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_BACKOFFICE_API_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## Firestore rules

Le fichier `firestore.rules` est fourni a la racine du projet mobile.

```bash
firebase deploy --only firestore:rules
```

## Lancement

```bash
pnpm dev
```

Puis, pour mobile natif :

```bash
pnpm build
npx cap sync
npx cap open ios
# ou
npx cap open android
```

## Notes utiles

- Emails signalements : envoyes via BackOffice (`/api/public/signalement-email`), pas directement depuis l'app mobile.
- Push tokens : stockes dans Firestore collection `push_token`.
