# Envoi d'emails signalement (Resend)

L'app mobile n'appelle plus de fonction edge directe.

## Flux actuel

1. L'app mobile envoie une requete HTTP vers :
   - `POST {VITE_BACKOFFICE_API_URL}/api/public/signalement-email`
2. Le BackOffice envoie l'email via Resend cote serveur.

## Variables requises (BackOffice)

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `APP_URL`

## Payload attendu

- `firstName`
- `lastName`
- `email` (optionnel mais recommande)
- `commune`
- `description`
- `photoUrl` (optionnel)
- `address` (optionnel)
- `mairieEmail`

## Verification

- Tester un signalement depuis mobile.
- Verifier les logs serveur BackOffice.
- Verifier la livraison dans le dashboard Resend.
