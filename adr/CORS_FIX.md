# Depannage CORS (etat actuel)

## Cas principaux

1. Requetes mobile/web vers le BackOffice API (`VITE_BACKOFFICE_API_URL`)
2. Uploads directs Cloudinary

## Verifications

- `VITE_BACKOFFICE_API_URL` correct (https, domaine public, sans slash final)
- BackOffice deploye avec CORS autorisant les origines de dev (`localhost`)
- Config Cloudinary valide (`cloud_name`, `upload_preset`)

## Si erreur persiste

- Redemarrer le serveur dev.
- Verifier la requete fautive dans l'onglet Network.
- Verifier que l'endpoint cible existe (`/api/public/signalement-email`, `/api/propositions/notify`).
