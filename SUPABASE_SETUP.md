# Guide de configuration Supabase

## Erreur : Table non trouvée

Si vous voyez l'erreur `Could not find the table 'public.reservations'`, cela signifie que les tables n'ont pas encore été créées dans votre projet Supabase.

## Étapes pour créer les tables

### 1. Accéder à l'éditeur SQL Supabase

1. Connectez-vous à [Supabase](https://supabase.com)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New query**

### 2. Exécuter le script de création

1. Ouvrez le fichier `supabase-schema.sql` dans votre projet
2. Copiez tout le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur `Cmd+Enter` / `Ctrl+Enter`)

### 3. Vérifier que les tables sont créées

1. Dans le menu de gauche, cliquez sur **Table Editor**
2. Vous devriez voir 3 tables :
   - `incivilities`
   - `reservations`
   - `municipal_info`

## Structure des tables

### Table `incivilities`
- Stocke les signalements d'incivilités
- Supporte GPS (latitude/longitude) ou adresse textuelle
- Contient les coordonnées du déclarant

### Table `reservations`
- Stocke les demandes de réservation de salles
- Contient les informations de contact du demandeur

### Table `municipal_info`
- Stocke les informations municipales à afficher aux citoyens

## Permissions (RLS - Row Level Security)

Les politiques RLS sont configurées pour permettre :
- **Lecture publique** : Tous peuvent lire les informations municipales
- **Insertion publique** : Tous peuvent créer des incivilités et réservations
- **Lecture publique** : Tous peuvent lire leurs propres incivilités et réservations

Pour un environnement de production, vous devriez :
- Ajouter l'authentification Supabase Auth
- Restreindre les politiques RLS selon les rôles utilisateurs
- Ajouter des politiques pour les mises à jour et suppressions

## Vérification rapide

Pour vérifier que tout fonctionne, vous pouvez exécuter cette requête dans l'éditeur SQL :

```sql
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
  AND table_name IN ('incivilities', 'reservations', 'municipal_info');
```

Vous devriez voir les 3 tables listées.

## Dépannage

### Erreur "permission denied"
- Vérifiez que vous êtes connecté avec un compte ayant les droits d'administration
- Vérifiez que vous êtes dans le bon projet Supabase

### Erreur "relation already exists"
- Les tables existent déjà
- Si vous voulez les recréer, supprimez-les d'abord dans Table Editor

### Erreur de contrainte
- Vérifiez que toutes les extensions nécessaires sont activées
- Pour les index spatiaux, PostGIS doit être activé (optionnel)

## Prochaines étapes

Une fois les tables créées :
1. Testez l'application
2. Créez quelques données de test
3. Configurez les politiques RLS selon vos besoins
4. Ajoutez l'authentification si nécessaire


