# OK Mairie

Application mobile développée avec Ionic et Vue.js pour la gestion des signalements, réservations de salles municipales et réception des informations de la mairie.

## Fonctionnalités

- 📸 **Signalements** : Prendre des photos et faire des signalements avec géolocalisation GPS (fallback sur adresse si GPS indisponible)
- 📅 **Réservation de salles** : Réserver des salles municipales pour vos événements
- 📢 **Informations municipales** : Recevoir et consulter les dernières informations de la mairie

## Technologies

- **Frontend** : Ionic 7 + Vue.js 3
- **Backend** : Supabase
- **Stockage d'images** : Cloudinary
- **Build** : Vite

## Installation

1. Installer les dépendances :

Avec **pnpm** (recommandé) :
```bash
pnpm install
```

Ou avec **npm** :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Puis remplir le fichier `.env` avec vos credentials :
- `VITE_SUPABASE_URL` : URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` : Clé anonyme de votre projet Supabase
- `VITE_CLOUDINARY_CLOUD_NAME` : Nom de votre cloud Cloudinary
- `VITE_CLOUDINARY_UPLOAD_PRESET` : Preset d'upload Cloudinary

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

## Configuration Supabase

⚠️ **IMPORTANT** : Vous devez créer les tables dans Supabase avant d'utiliser l'application !

### Configuration CORS (Important pour le développement local)

Si vous rencontrez des erreurs CORS lors du développement local :

1. Allez dans **Supabase Dashboard** → **Settings** → **API**
2. Dans la section **CORS**, ajoutez :
   - `http://localhost:5173`
   - `http://localhost:*` (pour autoriser tous les ports)
3. Sauvegardez

📖 **Guide détaillé** : Consultez `CORS_FIX.md` pour plus d'informations

### Étapes rapides

1. Connectez-vous à [Supabase](https://supabase.com) et ouvrez votre projet
2. Allez dans **SQL Editor** → **New query**
3. Copiez-collez le contenu du fichier `supabase-schema.sql`
4. Cliquez sur **Run** pour exécuter le script
5. Vérifiez dans **Table Editor** que les 3 tables sont créées

📖 **Guide détaillé** : Consultez `SUPABASE_SETUP.md` pour plus d'informations

### Tables à créer

Vous devez créer les tables suivantes dans Supabase :

### Table `signalements`
```sql
CREATE TABLE signalements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_accuracy DOUBLE PRECISION,
  comment TEXT,
  photo_url TEXT,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_cours', 'traité')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_contact_info CHECK (email IS NOT NULL OR phone IS NOT NULL),
  CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180)
);
```

**Note** : 
- L'application utilise la **géolocalisation GPS** en priorité pour enregistrer la position des signalements
- Si le GPS n'est pas disponible (permission refusée, GPS désactivé), l'utilisateur peut renseigner une adresse manuellement
- Le schéma accepte soit les coordonnées GPS (latitude/longitude) soit une adresse textuelle
- Si vous avez déjà créé la table `incivilities`, utilisez d'abord le script `supabase-migration-rename-table.sql` pour la renommer en `signalements`, puis `supabase-migration-gps.sql` pour ajouter le support GPS

### Table `reservations`
```sql
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table `municipal_info`
```sql
CREATE TABLE municipal_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

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
├── services/       # Services (Supabase, Cloudinary)
├── router/         # Configuration du routage
├── theme/          # Variables CSS Ionic
└── main.js         # Point d'entrée
```

## Licence

MIT

