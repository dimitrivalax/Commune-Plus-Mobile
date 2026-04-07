# Architecture Decision Records (ADR)

Ce dossier contient les Architecture Decision Records (ADR) et la documentation technique du projet mobile.

## Fichiers

- `GUIDE_DEMARRAGE.md` : setup rapide local (Firebase/Firestore + BackOffice API).
- `PUSH_NOTIFICATIONS_SETUP.md` : configuration FCM mobile + stockage des tokens `push_token` dans Firestore.
- `RESEND_SETUP.md` : envoi d'emails de signalement via `POST /api/public/signalement-email` (BackOffice).
- `CLOUDINARY_SETUP.md` : configuration upload presets Cloudinary.
- `CORS_FIX.md` : dépannage CORS (API BackOffice / Cloudinary).
- `SUPABASE_SETUP.md` : note d'archive (migration vers Firebase).
- `CONFIGURATION_SMTP_RAPIDE.md` : note d'archive (SMTP remplacé par Resend).
- `SMTP_INFOMANIAK_SETUP.md` : note d'archive (SMTP remplacé par Resend).

## Qu'est-ce qu'un ADR ?

Un Architecture Decision Record (ADR) est un document qui capture une décision architecturale importante, le contexte qui l'a motivée, et les conséquences de cette décision.

Ces documents aident à :
- Comprendre pourquoi certaines décisions ont été prises
- Partager la connaissance avec l'équipe
- Éviter de répéter les mêmes discussions
- Faciliter l'onboarding de nouveaux développeurs
