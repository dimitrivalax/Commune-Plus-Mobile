# E2E Mobile Web (Playwright)

## Prerequisites

- Install dependencies: `pnpm install`
- Install Chromium for Playwright: `pnpm exec playwright install chromium`

## Run tests

- Headless run: `pnpm test:e2e`
- Headed run: `pnpm test:e2e:headed`
- Interactive UI: `pnpm test:e2e:ui`

## Current scope

- Smoke test for tab routes navigation:
  - `Accueil` -> `Signalements` -> `Accueil`
- Smoke test for `Signalements` page:
  - route loads
  - filter UI is visible
  - list or empty state is displayed
- Smoke test for `Actualités` page:
  - route loads
  - list or empty state is displayed
  - opens detail route when an item exists
- Smoke test for `Réservations` page:
  - route loads
  - list or empty state is displayed
  - opens detail route when an item exists
- Smoke test for `Settings` page:
  - route loads
  - main sections are visible
- Smoke test for `Home` page:
  - route loads
  - cards or state message is displayed
- Smoke test for `Nouveau signalement` page:
  - route loads
  - base form UI is visible
  - submit button stays disabled when required inputs are missing
  - mocked submit success flow (network dependencies mocked)
- Page Object Model:
  - `e2e/pages/tabs-page.js`
  - `e2e/pages/signalements-page.js`
  - `e2e/pages/actualite-page.js`
  - `e2e/pages/reservations-page.js`
  - `e2e/pages/settings-page.js`
  - `e2e/pages/home-page.js`
  - `e2e/pages/new-signalement-page.js`
  - Encapsulates navigation actions and optional onboarding modal dismissal.

## Setup project (shared state)

- `e2e/auth.setup.js` prepares a reusable Playwright `storageState`.
- The `chromium` project depends on `setup` and reuses `e2e/.auth/user.json`.
- Shared E2E mock installers live in `e2e/fixtures/mocks.js`.
- Shared navigation helpers live in `e2e/fixtures/navigation.js`.
- Shared Playwright extended fixture lives in `e2e/fixtures/test-fixtures.js`.

## Notes

- The Playwright config starts Vite automatically on `127.0.0.1:5173`.
- On failures, Playwright keeps screenshot/video artifacts and an HTML report.
