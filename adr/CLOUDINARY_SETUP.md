# Configuration Cloudinary

## Objectif

Permettre l'upload d'images depuis le mobile sans exposer les secrets serveur.

## Configuration minimale

Dans Cloudinary, creer un upload preset `unsigned` puis renseigner :

- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## Recommandations

- Limiter formats (`jpg`, `png`, `webp`)
- Limiter taille max
- Activer optimisation auto (`quality:auto`, `format:auto`)

## Note architecture

Les URLs des images sont ensuite stockees dans Firestore (pas en base Supabase).
