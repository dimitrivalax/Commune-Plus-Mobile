# Résolution des erreurs CORS avec Supabase

## Problème

L'erreur CORS se produit lorsque votre application locale (`http://localhost:5173`) essaie d'accéder à Supabase (`https://*.supabase.co`).

## Solution 1 : Configurer CORS dans Supabase (Recommandé)

### Étapes :

1. **Connectez-vous à Supabase Dashboard**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet

2. **Accédez aux paramètres API**
   - Dans le menu de gauche, cliquez sur **Settings** (⚙️)
   - Allez dans l'onglet **API**

3. **Ajoutez votre origine locale**
   - Dans la section **CORS**, ajoutez :
     - `http://localhost:5173`
     - `http://localhost:5174` (si vous utilisez un autre port)
     - `http://localhost:8100` (pour Ionic serve)
     - `http://localhost:3000` (si vous utilisez un autre serveur)

4. **Sauvegardez les modifications**

### Configuration recommandée :

```
http://localhost:*
http://127.0.0.1:*
```

Cela autorisera toutes les requêtes depuis localhost sur n'importe quel port.

## Solution 2 : Utiliser un proxy Vite (Alternative)

Si la solution 1 ne fonctionne pas, vous pouvez configurer un proxy dans Vite.

Le fichier `vite.config.js` a été mis à jour avec une configuration de proxy. Assurez-vous que vos variables d'environnement sont correctement configurées.

## Solution 3 : Vérifier les credentials

Assurez-vous que votre fichier `.env` contient les bonnes valeurs :

```env
VITE_SUPABASE_URL=https://rmkcglmohxphykhbwbge.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

**Important** : 
- L'URL doit commencer par `https://`
- Pas d'espace avant/après les valeurs
- Pas de guillemets autour des valeurs

## Vérification

Après avoir configuré CORS dans Supabase :

1. Redémarrez votre serveur de développement :
   ```bash
   pnpm dev
   ```

2. Rechargez la page dans votre navigateur

3. L'erreur CORS devrait disparaître

## Dépannage

### L'erreur persiste

1. Vérifiez que vous avez bien sauvegardé les paramètres CORS dans Supabase
2. Attendez quelques secondes (les changements peuvent prendre un moment)
3. Videz le cache de votre navigateur (Cmd+Shift+R ou Ctrl+Shift+R)
4. Vérifiez la console du navigateur pour d'autres erreurs

### Erreur "Invalid API key"

- Vérifiez que votre clé API dans `.env` correspond à celle du Dashboard Supabase
- Assurez-vous d'utiliser la clé **anon/public**, pas la clé **service_role**

## Ressources

- [Documentation Supabase CORS](https://supabase.com/docs/guides/api/cors)
- [Documentation Vite Proxy](https://vitejs.dev/config/server-options.html#server-proxy)

