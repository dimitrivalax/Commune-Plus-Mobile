# Configuration Cloudinary - Guide complet

## Qu'est-ce qu'un Upload Preset ?

Un **Upload Preset** dans Cloudinary est une configuration prédéfinie qui définit comment les fichiers sont téléchargés et traités. Il permet d'uploader des images depuis le client (navigateur/app mobile) sans avoir besoin d'une signature côté serveur.

### Avantages des Upload Presets :

1. **Sécurité** : Permet les uploads depuis le client sans exposer votre clé API secrète
2. **Configuration centralisée** : Définit une fois les paramètres (format, taille, transformations, etc.)
3. **Simplicité** : Pas besoin de générer des signatures côté serveur

## Comment créer un Upload Preset

### Étape 1 : Se connecter à Cloudinary

1. Allez sur [https://cloudinary.com](https://cloudinary.com)
2. Créez un compte ou connectez-vous
3. Accédez à votre [Dashboard](https://cloudinary.com/console)

### Étape 2 : Créer un Upload Preset

1. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
2. Allez dans l'onglet **Upload**
3. Faites défiler jusqu'à la section **Upload presets**
4. Cliquez sur **Add upload preset**

### Étape 3 : Configurer le preset

#### Configuration de base :

- **Preset name** : Donnez un nom (ex: `ok-mairie-uploads`)
- **Signing mode** : 
  - **Unsigned** (recommandé pour notre cas) : Permet les uploads sans signature
  - **Signed** : Nécessite une signature (plus sécurisé mais plus complexe)

#### Paramètres recommandés pour OK Mairie :

```
Preset name: ok-mairie-uploads
Signing mode: Unsigned
Folder: signalements/ (optionnel - pour organiser les fichiers)
Allowed formats: jpg, png, webp
Max file size: 10 MB (ou selon vos besoins)
Image transformations: 
  - Quality: auto
  - Format: auto (pour optimisation automatique)
```

#### Paramètres de sécurité (optionnel mais recommandé) :

- **Allowed formats** : Limitez aux formats d'image (jpg, png, webp)
- **Max file size** : Définissez une taille maximale (ex: 10 MB)
- **Max image width/height** : Limitez les dimensions si nécessaire

### Étape 4 : Sauvegarder

Cliquez sur **Save** pour créer le preset.

## Récupérer vos credentials

### Cloud Name

1. Dans le Dashboard Cloudinary, en haut à droite
2. Vous verrez votre **Cloud name** (ex: `dxyz123456`)

### Upload Preset

1. Après avoir créé le preset, vous verrez son nom dans la liste
2. Le nom du preset est ce que vous avez défini (ex: `ok-mairie-uploads`)

## Configuration dans l'application

Une fois que vous avez vos credentials, ajoutez-les dans votre fichier `.env` :

```env
VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ok-mairie-uploads
```

## Exemple de configuration complète

### Dans Cloudinary Dashboard :

```
Preset name: ok-mairie-uploads
Signing mode: Unsigned
Folder: signalements/
Allowed formats: jpg, png, webp
Max file size: 10 MB
Quality: auto
Format: auto
```

### Dans votre .env :

```env
VITE_CLOUDINARY_CLOUD_NAME=dxyz123456
VITE_CLOUDINARY_UPLOAD_PRESET=ok-mairie-uploads
```

## Comment ça fonctionne dans l'application

Quand un utilisateur prend une photo dans l'application :

1. La photo est convertie en fichier
2. Le fichier est envoyé à Cloudinary avec le preset
3. Cloudinary traite l'image selon les paramètres du preset
4. L'URL sécurisée de l'image est retournée
5. L'URL est sauvegardée dans Supabase

## Sécurité

### Upload Preset Unsigned (recommandé pour commencer)

✅ **Avantages** :
- Simple à configurer
- Pas besoin de backend pour signer
- Parfait pour les prototypes et petites applications

⚠️ **Inconvénients** :
- Moins sécurisé (n'importe qui peut uploader si le preset est connu)
- Limitez les paramètres dans le preset (taille, format)

### Upload Preset Signed (pour la production)

✅ **Avantages** :
- Plus sécurisé
- Contrôle total sur qui peut uploader

⚠️ **Inconvénients** :
- Nécessite un backend pour générer les signatures
- Plus complexe à mettre en place

## Bonnes pratiques

1. **Limitez la taille des fichiers** : Définissez une taille maximale raisonnable
2. **Restreignez les formats** : Autorisez uniquement les formats d'image nécessaires
3. **Utilisez des dossiers** : Organisez les uploads par type (signalements/, reservations/, etc.)
4. **Optimisation automatique** : Activez `quality: auto` et `format: auto` pour réduire la taille des fichiers
5. **Surveillez l'utilisation** : Vérifiez régulièrement votre utilisation dans le Dashboard

## Dépannage

### Erreur 400 (Bad Request)

Cette erreur peut avoir plusieurs causes :

1. **Upload Preset incorrect ou manquant** :
   - Vérifiez que le nom du preset dans `.env` correspond **exactement** au nom dans Cloudinary
   - Le preset doit être de type **Unsigned** pour fonctionner depuis le client
   - Assurez-vous que le preset est bien **activé** dans Cloudinary

2. **Cloud Name incorrect** :
   - Vérifiez votre Cloud Name dans `.env`
   - Il doit correspondre exactement à celui affiché dans votre Dashboard Cloudinary
   - Le Cloud Name se trouve en haut à droite du Dashboard

3. **Format de fichier non autorisé** :
   - Vérifiez les "Allowed formats" dans les paramètres du preset
   - Assurez-vous que le format de l'image (jpg, png, webp) est autorisé

4. **Taille de fichier trop grande** :
   - Vérifiez la taille maximale autorisée dans le preset
   - Réduisez la qualité de l'image si nécessaire

### Vérification rapide de la configuration

Vérifiez votre fichier `.env` :

```env
VITE_CLOUDINARY_CLOUD_NAME=dgrmkvdil  # Votre cloud name (sans espaces)
VITE_CLOUDINARY_UPLOAD_PRESET=ok-mairie-uploads  # Nom exact du preset
```

**Important** :
- Pas d'espaces dans les valeurs
- Pas de guillemets autour des valeurs
- Noms exacts (respect de la casse)

### Erreur "Upload preset not found"
- Vérifiez que le nom du preset dans `.env` correspond exactement au nom dans Cloudinary
- Assurez-vous que le preset est bien créé et activé
- Le preset doit être de type **Unsigned**

### Erreur "Invalid API Key" ou 404
- Vérifiez votre Cloud Name dans `.env`
- Assurez-vous qu'il correspond à celui de votre compte Cloudinary
- Le Cloud Name se trouve dans le Dashboard Cloudinary (en haut à droite)

### Images trop grandes
- Réduisez la taille maximale dans les paramètres du preset
- Ou ajoutez des transformations pour redimensionner automatiquement
- Vérifiez que "Max file size" est suffisamment élevé dans le preset

### Test de l'upload preset

Pour tester si votre preset fonctionne, vous pouvez utiliser cette URL dans votre navigateur (remplacez les valeurs) :

```
https://api.cloudinary.com/v1_1/VOTRE_CLOUD_NAME/image/upload?upload_preset=VOTRE_PRESET_NAME
```

Si vous voyez une page avec un formulaire d'upload, votre preset est correctement configuré.

## Ressources

- [Documentation Cloudinary - Upload Presets](https://cloudinary.com/documentation/upload_presets)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Guide des transformations d'images](https://cloudinary.com/documentation/image_transformations)

