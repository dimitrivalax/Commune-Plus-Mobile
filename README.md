## Commune Plus Mobile

Application citoyenne Ionic + Vue pour les signalements, réservations de salles et informations municipales.

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

## Firestore Rules

Un fichier `firestore.rules` est fourni à la racine de ce projet.

Déploiement :

```bash
firebase deploy --only firestore:rules
```

Ces règles sont compatibles avec le fonctionnement actuel de l'app mobile (lecture publique + validations minimales d'écriture côté client).

## Personnalisation du design

L'application utilise un design épuré et lisible en marque blanche. Pour personnaliser le design selon votre ville :

1. **Modifier le nom et la couleur de la ville** :
   Éditez le fichier `src/config/city.js` :
   ```javascript
   export const cityConfig = {
     name: 'Votre Ville', // Remplacez par le nom de votre ville
     primaryColor: '#2563eb', // Remplacez par la couleur dominante de votre charte graphique
     logo: '/assets/logo-city.svg', // Chemin vers votre logo
   }
   ```

2. **Ajouter votre logo** :
   - Placez votre logo dans le dossier `public/assets/`
   - Le logo doit être au format SVG (recommandé) ou PNG
   - Mettez à jour le chemin dans `city.js` si nécessaire

3. **Couleurs personnalisées** :
   - La couleur principale sera automatiquement appliquée à tous les éléments de l'interface
   - Les nuances (shade/tint) sont générées automatiquement

## Modèle Firestore (collections utilisées)

- `commune`
- `salle`
- `signalement`
- `reservation_salle`
- `municipal_info`
- `proposition`
- `proposition_comment`
- `proposition_vote`
- `push_token`

## Configuration Cloudinary

1. Créer un compte sur [Cloudinary](https://cloudinary.com)
2. Créer un upload preset dans les paramètres de votre compte
3. Ajouter les credentials dans le fichier `.env`

## Développement

Lancer le serveur de développement :

Avec **pnpm** :
```bash
pnpm dev
```

Ou avec **npm** :
```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

## Build

Construire l'application pour la production :

Avec **pnpm** :
```bash
pnpm build
```

Ou avec **npm** :
```bash
npm run build
```

## Capacitor

Pour ajouter une plateforme mobile :

```bash
npx cap add ios
# ou
npx cap add android
```

Pour synchroniser les fichiers web avec les plateformes natives :
```bash
npx cap sync
```

Pour ouvrir dans l'IDE natif :
```bash
npx cap open ios
# ou
npx cap open android
```

## Structure du projet

```
src/
├── views/          # Pages de l'application
├── services/       # Services Firestore / Cloudinary / Push
├── utils/          # Helpers (storage, firestore, etc.)
├── router/         # Configuration du routage
├── theme/          # Variables CSS Ionic
└── main.js         # Point d'entrée
```

## Licence

MIT

