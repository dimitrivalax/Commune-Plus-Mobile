# Configuration SMTP Rapide

⚠️ **OBSOLÈTE** : Ce guide est obsolète. L'application utilise maintenant **Resend** pour l'envoi d'emails. Consultez `RESEND_SETUP.md` pour la configuration actuelle.

---

## ⚠️ Erreur : "SMTP credentials are not configured"

Cette erreur signifie que les secrets SMTP ne sont pas configurés dans votre projet Supabase.

**Note** : Cette configuration n'est plus utilisée. Voir `RESEND_SETUP.md` pour la configuration actuelle.

## Solution rapide

### Étape 1 : Accéder aux secrets Supabase

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
4. Dans le sous-menu, cliquez sur **Edge Functions**
5. Cliquez sur l'onglet **Secrets**

### Étape 2 : Ajouter les secrets

Cliquez sur **Add new secret** et ajoutez les secrets suivants **un par un** :

| Nom du secret | Valeur | Exemple |
|--------------|--------|---------|
| `SMTP_HOST` | `mail.infomaniak.com` | `mail.infomaniak.com` |
| `SMTP_PORT` | `465` (recommandé) ou `587` | `465` |
| `SMTP_USER` | Votre adresse email Infomaniak | `contact@mairie-exemple.fr` |
| `SMTP_PASSWORD` | Votre mot de passe SMTP | `votre-mot-de-passe` |
| `SMTP_FROM_EMAIL` | Email expéditeur (peut être identique à SMTP_USER) | `contact@mairie-exemple.fr` |

⚠️ **Note** : Le port **465** est recommandé pour éviter les erreurs `InvalidContentType` avec Deno. Utilisez le port 587 uniquement si le port 465 ne fonctionne pas.

### Étape 3 : Vérifier

Après avoir ajouté tous les secrets, vous devriez voir 5 secrets dans la liste :
- ✅ SMTP_HOST
- ✅ SMTP_PORT
- ✅ SMTP_USER
- ✅ SMTP_PASSWORD
- ✅ SMTP_FROM_EMAIL

### Étape 4 : Redéployer la fonction (si nécessaire)

Si vous avez ajouté les secrets après le déploiement initial, redéployez la fonction :

```bash
supabase functions deploy send-signalement-email
```

## Obtenir vos identifiants SMTP Infomaniak

1. Connectez-vous à votre [espace client Infomaniak](https://www.infomaniak.com)
2. Allez dans **E-mail** → **Paramètres**
3. Consultez la section **SMTP** pour obtenir :
   - Le serveur SMTP : `mail.infomaniak.com`
   - Le port : `587` (TLS) ou `465` (SSL)
   - Votre adresse email
   - Votre mot de passe SMTP (⚠️ peut être différent du mot de passe de connexion web)

## Vérification

Pour vérifier que tout fonctionne :

1. Créez un signalement dans l'application
2. Vérifiez les logs dans Supabase Dashboard → **Edge Functions** → **send-signalement-email** → **Logs**
3. Si l'email est envoyé avec succès, vous verrez : `Email sent successfully`

## Dépannage

### Les secrets ne sont pas reconnus

- Vérifiez que les noms des secrets sont **exactement** : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL` (respectez la casse)
- Redéployez la fonction après avoir ajouté les secrets
- Vérifiez que vous êtes dans le bon projet Supabase

### Erreur d'authentification SMTP

- Vérifiez que `SMTP_USER` et `SMTP_PASSWORD` sont corrects
- Assurez-vous d'utiliser le **mot de passe SMTP**, pas le mot de passe de connexion web
- Vérifiez que l'authentification SMTP est activée dans votre compte Infomaniak

## Besoin d'aide ?

Consultez le guide complet : `SMTP_INFOMANIAK_SETUP.md`

