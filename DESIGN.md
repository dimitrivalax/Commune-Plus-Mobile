# Guide de personnalisation du design

Ce guide explique comment personnaliser le design de l'application OK Mairie selon l'identité visuelle de votre ville.

## Design épuré et lisible

L'application utilise un design moderne et épuré avec :
- **Espacements cohérents** : Utilisation de variables CSS pour des espacements uniformes
- **Typographie claire** : Police système pour une lisibilité optimale
- **Couleurs harmonieuses** : Palette de couleurs basée sur la couleur principale de la ville
- **Ombres subtiles** : Ombres légères pour la profondeur sans surcharge visuelle
- **Bordures arrondies** : Coins arrondis pour un aspect moderne

## Personnalisation de la marque

### 1. Configuration de base

Éditez le fichier `src/config/city.js` :

```javascript
export const cityConfig = {
  name: 'Votre Ville',           // Nom de votre ville
  primaryColor: '#2563eb',        // Couleur dominante (hex)
  logo: '/assets/logo-city.svg',  // Chemin vers votre logo
}
```

### 2. Ajout du logo

1. Placez votre logo dans `public/assets/`
2. Formats recommandés :
   - **SVG** (recommandé) : Vectoriel, s'adapte à toutes les tailles
   - **PNG** : Avec fond transparent, résolution minimale 512x512px
3. Mettez à jour le chemin dans `city.js` si nécessaire

### 3. Couleur principale

La couleur principale est utilisée pour :
- Les boutons principaux
- Les éléments d'accentuation
- Le header de la ville
- Les icônes de navigation
- Les badges de statut

**Exemples de couleurs** :
- Bleu municipal : `#2563eb`
- Vert : `#059669`
- Rouge : `#dc2626`
- Violet : `#7c3aed`

### 4. Composant CityHeader

Le composant `CityHeader` affiche le logo et le nom de la ville en haut de certaines pages. Il utilise automatiquement :
- La couleur principale comme fond dégradé
- Le logo configuré
- Le nom de la ville

## Variables CSS personnalisées

Les variables CSS sont définies dans `src/theme/custom.css` :

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.12);
}
```

## Structure des pages

### Pages principales
- **HomePage** : Page d'accueil avec les services disponibles
- **SignalementsPage** : Liste des signalements
- **ReservationsPage** : Liste des réservations
- **InfoPage** : Liste des informations municipales

### Pages de formulaire
- **NewSignalementPage** : Formulaire de signalement
- **NewReservationPage** : Formulaire de réservation

### Composants réutilisables
- **CityHeader** : En-tête avec logo et nom de la ville

## Bonnes pratiques

1. **Cohérence** : Utilisez les variables CSS pour maintenir la cohérence
2. **Contraste** : Assurez-vous que le texte reste lisible sur les fonds colorés
3. **Espacement** : Respectez les espacements définis pour une hiérarchie visuelle claire
4. **Responsive** : Le design s'adapte automatiquement aux différentes tailles d'écran

## Personnalisation avancée

Pour des modifications plus poussées :

1. **Modifier les couleurs Ionic** : Éditez `src/theme/variables.css`
2. **Styles globaux** : Modifiez `src/theme/custom.css`
3. **Composants spécifiques** : Éditez les fichiers `.vue` dans `src/views/`

## Support

Pour toute question sur la personnalisation, consultez la documentation Ionic Vue : https://ionicframework.com/docs/vue/overview


