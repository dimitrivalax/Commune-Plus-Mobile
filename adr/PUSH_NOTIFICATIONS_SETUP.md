# Configuration des Push Notifications (FCM)

## Prerequis

- Projet Firebase actif
- FCM active
- App Android/iOS enregistree dans Firebase
- `google-services.json` (Android) et configuration APNs (iOS)

## Cote Mobile

1. Installer/synchroniser les plugins Capacitor.
2. Initialiser les push notifications au demarrage.
3. Enregistrer le token dans Firestore collection `push_token`.

Le token enregistre contient notamment :
- `token`
- `user_id` (identifiant local mobile)
- `email` (si connu)
- `commune_id` (si selectionnee)
- `platform`
- `is_active`

## Cote BackOffice

Le BackOffice envoie les notifications via FCM avec un compte de service :

- `FIREBASE_SERVICE_ACCOUNT_JSON` (recommande)
- ou `FCM_SERVICE_ACCOUNT_JSON` / `FCM_SERVICE_ACCOUNT_PATH` (fallback)

## Test rapide

1. Ouvrir l'app mobile sur un appareil.
2. Autoriser les notifications.
3. Verifier qu'un token apparait dans `push_token`.
4. Publier une info depuis le BackOffice et verifier la reception.

## Depannage

- Si rien n'est recu : verifier les variables FCM du BackOffice.
- Si aucun token : verifier permissions OS, logs mobile et config Firebase.
