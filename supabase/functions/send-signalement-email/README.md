# Edge Function : Envoi d'email de signalement

Cette Edge Function envoie automatiquement un email à la mairie lorsqu'un signalement est créé dans l'application Commune Plus.

## Déploiement

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet (remplacez votre-project-ref par votre référence de projet)
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy send-signalement-email
```

## Configuration des secrets

Dans le dashboard Supabase :

1. Allez dans **Settings** → **Edge Functions** → **Secrets**
2. Ajoutez les secrets suivants :

```
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASSWORD=votre-mot-de-passe-smtp
SMTP_FROM_EMAIL=votre-email@votre-domaine.com
```

## Utilisation

La fonction est appelée automatiquement depuis `NewSignalementPage.vue` après la création d'un signalement.

Elle attend les données suivantes dans le body de la requête :

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "commune": "Paris",
  "description": "Description du signalement",
  "photoUrl": "https://res.cloudinary.com/...",
  "mairieEmail": "mairie@paris.fr"
}
```

## Format de l'email

L'email envoyé contient :
- **Objet** : "Signalement automatique via Commune Plus"
- **Corps** : Message formaté avec les informations du signalement
- **Pièce jointe** : Photo du signalement (si disponible)

