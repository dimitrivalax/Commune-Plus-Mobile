# Configuration SMTP Infomaniak pour l'envoi d'emails de signalements

Ce guide explique comment configurer l'envoi automatique d'emails lorsque des signalements sont créés dans l'application Commune Plus.

## Vue d'ensemble

Lorsqu'un utilisateur crée un signalement, un email est automatiquement envoyé à la mairie au nom de l'utilisateur. L'envoi se fait via une Edge Function Supabase qui utilise SMTP Infomaniak.

## Configuration Supabase Edge Function

### 1. Déployer la Edge Function

La Edge Function se trouve dans `supabase/functions/send-signalement-email/`.

Pour la déployer :

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy send-signalement-email
```

### 2. Configurer les secrets SMTP

⚠️ **IMPORTANT** : Les secrets doivent être configurés dans le dashboard Supabase pour que la fonction puisse les utiliser.

#### Méthode 1 : Via le Dashboard Supabase (recommandé)

1. Connectez-vous à votre [Dashboard Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** (⚙️) → **Edge Functions** → **Secrets**
4. Cliquez sur **Add new secret** pour chaque secret suivant :

   - **Nom** : `SMTP_HOST` → **Valeur** : `mail.infomaniak.com`
   - **Nom** : `SMTP_PORT` → **Valeur** : `587` (ou `465` pour SSL)
   - **Nom** : `SMTP_USER` → **Valeur** : `votre-email@votre-domaine.com`
   - **Nom** : `SMTP_PASSWORD` → **Valeur** : `votre-mot-de-passe-smtp`
   - **Nom** : `SMTP_FROM_EMAIL` → **Valeur** : `votre-email@votre-domaine.com` (peut être identique à SMTP_USER)

5. Cliquez sur **Save** pour chaque secret

#### Méthode 2 : Via Supabase CLI

```bash
# Définir les secrets un par un
supabase secrets set SMTP_HOST=mail.infomaniak.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=votre-email@votre-domaine.com
supabase secrets set SMTP_PASSWORD=votre-mot-de-passe-smtp
supabase secrets set SMTP_FROM_EMAIL=votre-email@votre-domaine.com

# Ou définir plusieurs secrets en une fois
supabase secrets set SMTP_HOST=mail.infomaniak.com SMTP_PORT=587 SMTP_USER=votre-email@votre-domaine.com SMTP_PASSWORD=votre-mot-de-passe SMTP_FROM_EMAIL=votre-email@votre-domaine.com
```

**Note importante** : 
- Les secrets sont spécifiques à chaque projet Supabase
- Après avoir ajouté/modifié des secrets, vous devez redéployer la fonction pour qu'elle prenne en compte les nouveaux secrets
- `SMTP_USER` : L'adresse email complète utilisée pour l'authentification SMTP
- `SMTP_PASSWORD` : Le mot de passe SMTP (peut être différent du mot de passe de connexion web)
- `SMTP_FROM_EMAIL` : L'adresse email qui apparaîtra comme expéditeur (peut être la même que SMTP_USER)
- `SMTP_PORT` : 587 pour TLS ou 465 pour SSL

### 3. Redéployer la fonction (si nécessaire)

Si vous avez ajouté des secrets après le déploiement initial, redéployez la fonction :

```bash
supabase functions deploy send-signalement-email
```

### 4. Paramètres SMTP Infomaniak

Les paramètres SMTP standard d'Infomaniak sont :

- **Serveur SMTP** : `mail.infomaniak.com`
- **Port SSL** : `465` (recommandé pour Deno/Supabase Edge Functions)
- **Port TLS** : `587` (peut causer des problèmes avec InvalidContentType)
- **Authentification** : Requise
- **Sécurité** : SSL direct pour le port 465, TLS/STARTTLS pour le port 587

⚠️ **Important** : Pour éviter les erreurs `InvalidContentType` avec Deno, il est recommandé d'utiliser le **port 465** avec SSL direct plutôt que le port 587 avec STARTTLS.

### 4. Obtenir les identifiants SMTP Infomaniak

1. Connectez-vous à votre [espace client Infomaniak](https://www.infomaniak.com)
2. Allez dans **E-mail** → **Paramètres**
3. Consultez la section **SMTP** pour obtenir :
   - Le serveur SMTP
   - Le port
   - Votre adresse email
   - Votre mot de passe SMTP (peut être différent du mot de passe de connexion)

## Format de l'email envoyé

L'email envoyé à la mairie contient :

**Objet** : Signalement automatique via Commune Plus

**Corps** :
```
Madame, Monsieur,

Je me permets de vous transmettre un signalement automatique généré via l'application Commune Plus, qui facilite la communication entre les habitants et la mairie.

Nom : {nom} {prenom}
Commune : {commune}
Description du signalement : {description}

Une photo accompagnant ce signalement a été jointe à ce message.

Je vous remercie pour votre attention et votre suivi.

Cordialement,
{nom} {prenom}

Envoyé via Commune Plus — L'application qui simplifie la communication entre habitants et mairie.
```

**Pièce jointe** : La photo du signalement (si disponible)

## Configuration de l'email de la mairie

L'email de la mairie doit être configuré dans l'application :

1. Ouvrez l'application Commune Plus
2. Allez dans **Paramètres**
3. Configurez les informations de la commune, y compris l'email de la mairie

L'email sera automatiquement utilisé comme destinataire lors de l'envoi des signalements.

## Test de la configuration

Pour tester que l'envoi d'email fonctionne :

1. Créez un signalement dans l'application
2. Vérifiez les logs de la Edge Function dans Supabase Dashboard → **Edge Functions** → **Logs**
3. Vérifiez que l'email arrive bien dans la boîte de réception de la mairie

## Dépannage

### L'email n'est pas envoyé

1. **Vérifiez les logs de la Edge Function** :
   - Supabase Dashboard → **Edge Functions** → **send-signalement-email** → **Logs**
   - Recherchez les erreurs d'authentification SMTP

2. **Vérifiez les secrets** :
   - Assurez-vous que tous les secrets sont correctement configurés
   - Vérifiez que le mot de passe SMTP est correct (peut être différent du mot de passe web)

3. **Vérifiez la configuration de la commune** :
   - L'email de la mairie doit être configuré dans les paramètres de l'application
   - Vérifiez que `city_info.email` contient une adresse email valide

### Erreur d'authentification SMTP

- Vérifiez que `SMTP_USER` et `SMTP_PASSWORD` sont corrects
- Assurez-vous d'utiliser le mot de passe SMTP, pas le mot de passe de connexion web
- Vérifiez que l'authentification SMTP est activée dans votre compte Infomaniak

### L'email arrive en spam

- Vérifiez que le domaine d'envoi est correctement configuré avec SPF/DKIM dans Infomaniak
- Assurez-vous que `SMTP_FROM_EMAIL` utilise un domaine que vous possédez

## Sécurité

⚠️ **Important** : Les secrets SMTP sont stockés de manière sécurisée dans Supabase et ne sont jamais exposés au client. L'envoi d'email se fait uniquement côté serveur via la Edge Function.

## Support

Pour plus d'informations sur la configuration SMTP Infomaniak :
- [Documentation Infomaniak SMTP](https://www.infomaniak.com/fr/support/guides/email/configuration-smtp)

