# Configuration Resend pour l'envoi d'emails

Ce guide explique comment configurer l'envoi automatique d'emails via Resend lorsque des signalements sont créés dans l'application Commune Plus.

## Vue d'ensemble

Lorsqu'un utilisateur crée un signalement, un email est automatiquement envoyé à la mairie au nom de l'utilisateur. L'envoi se fait via une Edge Function Supabase qui utilise l'API Resend.

## Pourquoi Resend ?

Resend est un service d'envoi d'emails moderne qui offre :
- ✅ API REST simple et fiable
- ✅ Meilleure délivrabilité que SMTP
- ✅ Interface de suivi des emails
- ✅ Support natif pour HTML et texte
- ✅ Pas de configuration SMTP complexe
- ✅ Support pour les domaines vérifiés

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

### 2. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit (100 emails/jour en version gratuite)
3. Vérifiez votre email

### 3. Obtenir votre clé API

1. Connectez-vous au [dashboard Resend](https://resend.com/api-keys)
2. Cliquez sur **Create API Key**
3. Donnez un nom à votre clé (ex: "Commune Plus Production")
4. Copiez la clé API (elle commence par `re_`)

⚠️ **Important** : La clé API ne sera affichée qu'une seule fois. Assurez-vous de la copier immédiatement.

### 4. Configurer un domaine (Production)

Pour la production, vous devez vérifier votre domaine dans Resend :

1. Allez dans **Domains** dans le dashboard Resend
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `commune-plus.fr`)
4. Suivez les instructions pour ajouter les enregistrements DNS (SPF, DKIM, DMARC)
5. Attendez la vérification (généralement quelques minutes)

**Note** : Pour les tests, vous pouvez utiliser le domaine de test `onboarding@resend.dev` sans vérification.

### 5. Configurer les secrets dans Supabase

⚠️ **IMPORTANT** : Les secrets doivent être configurés dans le dashboard Supabase pour que la fonction puisse les utiliser.

#### Méthode 1 : Via le Dashboard Supabase (recommandé)

1. Connectez-vous à votre [Dashboard Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** (⚙️) → **Edge Functions** → **Secrets**
4. Cliquez sur **Add new secret** pour chaque secret suivant :

   - **Nom** : `RESEND_API_KEY` → **Valeur** : Votre clé API Resend (commence par `re_`)
   - **Nom** : `RESEND_FROM_EMAIL` → **Valeur** : Email expéditeur (ex: `noreply@commune-plus.fr` ou `onboarding@resend.dev` pour les tests)

5. Cliquez sur **Save** pour chaque secret

#### Méthode 2 : Via Supabase CLI

```bash
# Définir les secrets
supabase secrets set RESEND_API_KEY=re_votre_cle_api
supabase secrets set RESEND_FROM_EMAIL=noreply@commune-plus.fr
```

**Note importante** : 
- Les secrets sont spécifiques à chaque projet Supabase
- Après avoir ajouté/modifié des secrets, vous devez redéployer la fonction pour qu'elle prenne en compte les nouveaux secrets
- `RESEND_FROM_EMAIL` doit être un domaine vérifié dans Resend (ou utiliser `onboarding@resend.dev` pour les tests)

### 6. Redéployer la fonction (si nécessaire)

Si vous avez ajouté des secrets après le déploiement initial, redéployez la fonction :

```bash
supabase functions deploy send-signalement-email
```

## Format de l'email envoyé

L'email envoyé à la mairie contient :

**Objet** : Signalement automatique via Commune Plus

**Corps HTML** : Message formaté avec les informations du signalement dans un format HTML professionnel

**Corps texte** : Version texte de l'email pour les clients email qui ne supportent pas HTML

**Contenu** :
- Nom et prénom de l'utilisateur
- Commune
- Description du signalement
- URL de la photo (si disponible)
- Reply-To configuré avec l'email de l'utilisateur (si fourni)

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
4. Consultez le dashboard Resend pour voir les statistiques d'envoi

## Dépannage

### L'email n'est pas envoyé

1. **Vérifiez les logs de la Edge Function** :
   - Supabase Dashboard → **Edge Functions** → **send-signalement-email** → **Logs**
   - Recherchez les erreurs d'API Resend

2. **Vérifiez les secrets** :
   - Assurez-vous que `RESEND_API_KEY` est correctement configuré
   - Vérifiez que la clé API commence par `re_`
   - Vérifiez que `RESEND_FROM_EMAIL` est configuré

3. **Vérifiez la configuration de la commune** :
   - L'email de la mairie doit être configuré dans les paramètres de l'application
   - Vérifiez que `city_info.email` contient une adresse email valide

### Erreur d'API Resend

- Vérifiez que `RESEND_API_KEY` est valide et actif
- Vérifiez que vous n'avez pas dépassé votre quota d'emails (100/jour en version gratuite)
- Consultez les logs dans le dashboard Resend pour plus de détails

### L'email arrive en spam

- Vérifiez que votre domaine est correctement vérifié dans Resend
- Assurez-vous que les enregistrements DNS (SPF, DKIM, DMARC) sont correctement configurés
- Utilisez un domaine vérifié plutôt que `onboarding@resend.dev` pour la production

### Erreur "Domain not verified"

- Pour la production, vous devez vérifier votre domaine dans Resend
- Pour les tests, utilisez `onboarding@resend.dev` comme `RESEND_FROM_EMAIL`

## Sécurité

⚠️ **Important** : Les secrets Resend sont stockés de manière sécurisée dans Supabase et ne sont jamais exposés au client. L'envoi d'email se fait uniquement côté serveur via la Edge Function.

## Support

Pour plus d'informations sur Resend :
- [Documentation Resend](https://resend.com/docs)
- [Dashboard Resend](https://resend.com/dashboard)
- [Support Resend](https://resend.com/support)

## Migration depuis SMTP

Si vous migrez depuis SMTP Infomaniak, consultez les anciens fichiers de documentation :
- `SMTP_INFOMANIAK_SETUP.md` (obsolète)
- `CONFIGURATION_SMTP_RAPIDE.md` (obsolète)

Ces fichiers sont conservés à titre de référence mais ne sont plus utilisés.
