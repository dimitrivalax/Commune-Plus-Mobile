# Configuration du Splash Screen

Le splash screen est configuré pour afficher l'image `commune-plus.png` au démarrage de l'application.

## Configuration actuelle

- **Image source** : `public/assets/commune-plus.png`
- **Durée d'affichage** : 2 secondes
- **Couleur de fond** : Dégradé bleu (couleur primaire de l'app)
- **Animation** : Fade in/out avec animations CSS

## Pour iOS

### Générer les assets iOS

1. **Préparer l'image source** :
   - L'image doit faire au moins 2732x2732px pour iOS
   - Format PNG avec fond transparent ou couleur de fond

2. **Utiliser un outil en ligne** :
   - [AppIcon.co](https://www.appicon.co/) - Génère tous les assets nécessaires
   - [MakeAppIcon](https://makeappicon.com/) - Alternative
   - Uploadez votre `commune-plus.png` et générez les assets

3. **Placer les fichiers** :
   - Ouvrez le projet iOS : `npx cap open ios`
   - Placez les fichiers dans `ios/App/App/Assets.xcassets/Splash.imageset/`
   - Les fichiers doivent s'appeler :
     - `splash.png` (2732x2732px)
     - `splash@2x.png` (2732x2732px)
     - `splash@3x.png` (2732x2732px)

### Configuration manuelle iOS

1. Ouvrez `ios/App/App/Info.plist`
2. Vérifiez que les paramètres de splash screen sont corrects
3. Ou utilisez le plugin Capacitor qui gère cela automatiquement

## Pour Android

### Générer les assets Android

1. **Créer les dossiers** :
   ```
   android/app/src/main/res/
   ├── drawable/
   │   └── splash.png (1920x1920px)
   ├── drawable-hdpi/
   │   └── splash.png (800x800px)
   ├── drawable-mdpi/
   │   └── splash.png (400x400px)
   ├── drawable-xhdpi/
   │   └── splash.png (1200x1200px)
   ├── drawable-xxhdpi/
   │   └── splash.png (1600x1600px)
   └── drawable-xxxhdpi/
       └── splash.png (1920x1920px)
   ```

2. **Utiliser un outil** :
   - [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) - Splash Screen Generator
   - Uploadez votre image et générez les différentes tailles

3. **Créer le fichier drawable/splash.xml** :
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <layer-list xmlns:android="http://schemas.android.com/apk/res/android">
       <item android:drawable="@color/splash_background"/>
       <item>
           <bitmap
               android:gravity="center"
               android:src="@drawable/splash"/>
       </item>
   </layer-list>
   ```

4. **Créer le fichier values/colors.xml** (si n'existe pas) :
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <color name="splash_background">#2563eb</color>
   </resources>
   ```

5. **Créer le fichier values/styles.xml** (si n'existe pas) :
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <style name="AppSplashScreen" parent="Theme.SplashScreen">
           <item name="windowSplashScreenBackground">@color/splash_background</item>
           <item name="windowSplashScreenAnimatedIcon">@drawable/splash</item>
           <item name="postSplashScreenTheme">@style/AppTheme</item>
       </style>
   </resources>
   ```

## Version Web

Le splash screen web est géré par le composant `SplashScreen.vue` qui :
- S'affiche automatiquement au chargement
- Utilise l'image depuis `/assets/commune-plus.png`
- Se masque après 1.5 secondes avec une animation fade out

## Personnalisation

### Changer la durée d'affichage

Dans `src/components/SplashScreen.vue` :
```javascript
await new Promise(resolve => setTimeout(resolve, 1500)) // Changez 1500 (ms)
```

Dans `capacitor.config.ts` :
```typescript
splashScreen: {
  launchShowDuration: 2000, // Changez cette valeur (ms)
}
```

### Changer la couleur de fond

Dans `src/components/SplashScreen.vue` :
```css
background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
```

Dans `capacitor.config.ts` :
```typescript
backgroundColor: '#2563eb', // Changez cette couleur
```

### Changer l'image

1. Remplacez `public/assets/commune-plus.png` par votre nouvelle image
2. Mettez à jour le chemin dans `src/components/SplashScreen.vue` :
   ```vue
   <img src="/assets/votre-nouvelle-image.png" alt="OK Mairie" />
   ```

## Test

### Web
```bash
pnpm dev
```
Le splash screen s'affichera au chargement de la page.

### Mobile
```bash
pnpm build
npx cap sync
npx cap open ios  # ou android
```

## Outils recommandés

- **ImageMagick** (ligne de commande) : Pour redimensionner les images
- **GIMP** ou **Photoshop** : Pour éditer les images
- **AppIcon.co** : Pour générer automatiquement tous les assets
- **Android Asset Studio** : Pour générer les assets Android

## Notes

- Le splash screen natif (iOS/Android) est géré par Capacitor
- Le splash screen web est géré par le composant Vue
- Les deux peuvent avoir des durées d'affichage différentes
- Assurez-vous que l'image est optimisée pour réduire le temps de chargement

