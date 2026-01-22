# Guide de démarrage - Commune Plus

## Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé :
- **Node.js** (version 18 ou supérieure) : [https://nodejs.org/](https://nodejs.org/)
- **npm** (inclus avec Node.js)

## Installation

### 1. Installer les dépendances

Avec **pnpm** (recommandé) :
```bash
pnpm install
```

Ou avec **npm** :
```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires (Ionic, Vue.js, Supabase, Cloudinary, etc.)

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Puis éditez le fichier `.env` avec vos credentials :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset
```

### 3. Configurer Supabase

Exécutez le script SQL dans votre projet Supabase :

1. Connectez-vous à [Supabase](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans l'éditeur SQL
4. Exécutez le contenu du fichier `supabase-schema.sql`

## Lancement de l'application

### Mode développement

Pour lancer l'application en mode développement :

Avec **pnpm** :
```bash
pnpm dev
```

Ou avec **npm** :
```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

Le serveur de développement supporte le rechargement à chaud (hot reload) : les modifications sont automatiquement reflétées dans le navigateur.

### Mode production

Pour construire l'application pour la production :

Avec **pnpm** :
```bash
pnpm build
```

Ou avec **npm** :
```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

Pour prévisualiser la version de production :

Avec **pnpm** :
```bash
pnpm preview
```

Ou avec **npm** :
```bash
npm run preview
```

## Lancer sur mobile (avec Capacitor)

### 1. Synchroniser avec les plateformes natives

```bash
npx cap sync
```

### 2. Ajouter une plateforme

Pour iOS :
```bash
npx cap add ios
```

Pour Android :
```bash
npx cap add android
```

### 3. Ouvrir dans l'IDE natif

Pour iOS (nécessite Xcode sur Mac) :
```bash
npx cap open ios
```

Pour Android (nécessite Android Studio) :
```bash
npx cap open android
```

## Personnalisation

Avant de lancer, n'oubliez pas de personnaliser :

1. **Le nom et la couleur de la ville** : Éditez `src/config/city.js`
2. **Votre logo** : Placez-le dans `public/assets/` et mettez à jour le chemin dans `city.js`

## Dépannage

### Erreur "node_modules missing"
Avec **pnpm** :
```bash
pnpm install
```

Ou avec **npm** :
```bash
npm install
```

### Erreur de port déjà utilisé
Le port par défaut est 5173. Si occupé, Vite proposera automatiquement un autre port.

### Erreur de connexion Supabase
Vérifiez que vos variables d'environnement dans `.env` sont correctes.

### Erreur Cloudinary
Assurez-vous d'avoir configuré votre compte Cloudinary et créé un upload preset.

## Commandes utiles

Avec **pnpm** :
- `pnpm dev` : Lancer le serveur de développement
- `pnpm build` : Construire pour la production
- `pnpm preview` : Prévisualiser la version de production
- `pnpm lint` : Vérifier et corriger le code

Avec **npm** :
- `npm run dev` : Lancer le serveur de développement
- `npm run build` : Construire pour la production
- `npm run preview` : Prévisualiser la version de production
- `npm run lint` : Vérifier et corriger le code

## Support

Pour plus d'informations, consultez :
- [Documentation Ionic Vue](https://ionicframework.com/docs/vue/overview)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Cloudinary](https://cloudinary.com/documentation)

