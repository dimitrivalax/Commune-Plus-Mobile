# Contributing

Thanks for contributing to Commune Plus Mobile.

## Setup

1. Install [pnpm](https://pnpm.io/) and Node.js 22+.
2. `pnpm install`
3. `cp .env.example .env` and fill in your own Firebase / Cloudinary / BackOffice URL values.
4. For native builds, copy Firebase configs from the Firebase console:
   - `cp android/app/google-services.json.example android/app/google-services.json`
   - `cp ios/App/App/GoogleService-Info.plist.example ios/App/App/GoogleService-Info.plist`
   - Then replace placeholders with your project values (or download the real files from Firebase).

Never commit `.env`, `google-services.json`, or `GoogleService-Info.plist`.

## Development

```bash
pnpm dev
pnpm lint
pnpm test:e2e
```

## Pull requests

- Keep changes focused and documented when they change architecture (see `adr/`).
- Ensure lint passes.
- Do not include secrets, keystores, or production Firebase configs.
