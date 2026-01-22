# Configuration des Push Notifications

Ce guide explique comment configurer les push notifications pour l'application mobile Commune Plus.

## Prérequis

1. Un projet Firebase configuré
2. Firebase Cloud Messaging (FCM) activé
3. Les clés FCM configurées dans le BackOffice

## Configuration Android

### 1. Configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez ou sélectionnez votre projet
3. Ajoutez une application Android avec le package name de votre app
4. Téléchargez le fichier `google-services.json`
5. Placez-le dans `android/app/`

### 2. Configuration Capacitor

1. Installez le plugin push notifications (déjà fait dans package.json) :
```bash
npm install @capacitor/push-notifications
```

2. Synchronisez les plugins :
```bash
npx cap sync android
```

### 3. Configuration AndroidManifest.xml

Le fichier `android/app/src/main/AndroidManifest.xml` doit contenir les permissions nécessaires :

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

### 4. Configuration build.gradle

Assurez-vous que `android/app/build.gradle` inclut le plugin Google Services :

```gradle
apply plugin: 'com.google.gms.google-services'
```

Et dans `android/build.gradle` :

```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
}
```

### 5. Configurer le compte de service FCM

Depuis 2023, Firebase n'utilise plus les clés serveur. Il faut utiliser un compte de service JSON.

1. Dans Firebase Console, allez dans **Paramètres du projet** > **Comptes de service**
2. Cliquez sur **Générer une nouvelle clé privée**
3. Téléchargez le fichier JSON du compte de service
4. Ajoutez-le dans le BackOffice de l'une des façons suivantes :

   **Option 1 : Variable d'environnement JSON (recommandé)**
   ```bash
   # Dans votre fichier .env ou variables d'environnement
   FCM_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...",...}'
   ```

   **Option 2 : Chemin vers le fichier JSON**
   ```bash
   # Placez le fichier JSON dans un dossier sécurisé et référencez-le
   FCM_SERVICE_ACCOUNT_PATH=/path/to/service-account-key.json
   ```

   **Important** : Ne commitez jamais le fichier JSON dans votre dépôt Git !

## Configuration iOS (optionnel)

Pour iOS, vous aurez besoin de :
1. Un compte développeur Apple
2. Certificats APNs configurés dans Firebase
3. Configuration supplémentaire dans Xcode

## Fonctionnement

### Côté Mobile

L'application mobile :
1. Demande la permission pour les notifications au démarrage
2. Enregistre le token FCM automatiquement
3. Sauvegarde le token dans Supabase avec la commune_id actuelle
4. Écoute les notifications reçues

### Côté BackOffice

Lorsqu'un administrateur clique sur "Publier" dans la page de modification d'une publication :
1. L'API récupère tous les tokens actifs pour la commune
2. Envoie une notification via FCM à tous ces tokens
3. Les utilisateurs reçoivent la notification sur leur appareil

## Test

Pour tester les notifications :

1. Installez l'app sur un appareil Android
2. Sélectionnez une commune dans les paramètres
3. Dans le BackOffice, modifiez une publication et cliquez sur "Publier"
4. Vous devriez recevoir une notification sur l'appareil

## Dépannage

### Les notifications ne sont pas reçues

1. Vérifiez que `FCM_SERVICE_ACCOUNT_JSON` ou `FCM_SERVICE_ACCOUNT_PATH` est bien configuré dans le BackOffice
2. Vérifiez les logs du serveur pour voir les erreurs FCM
3. Vérifiez que les tokens sont bien enregistrés dans la table `push_tokens` de Supabase
4. Vérifiez que `google-services.json` est bien présent dans `android/app/`
5. Vérifiez que le compte de service a les permissions nécessaires dans Firebase Console

### Les tokens ne sont pas enregistrés

1. Vérifiez les permissions de notification dans les paramètres Android
2. Vérifiez les logs de l'app pour voir les erreurs d'enregistrement
3. Vérifiez que la commune est bien sélectionnée dans l'app

## Structure de la base de données

La table `push_tokens` stocke :
- `token` : Le token FCM unique
- `user_id` : Un UUID local généré côté client
- `commune_id` : L'ID de la commune associée
- `platform` : La plateforme (android/ios/web)
- `is_active` : Si le token est actif

## Sécurité

- Les tokens sont stockés dans Supabase avec RLS activé
- Seuls les tokens actifs sont accessibles pour l'envoi de notifications
- Les tokens invalides sont automatiquement désactivés
