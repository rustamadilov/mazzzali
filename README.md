# Mazzzali

Mazzzali is a React/Vite wellness and recipe app backed by an Express API hosted in Azure Functions. The MVP stores account details, eating focus, and optional starting/target weights; it does not collect weigh-in history or host recipe media.

## Local setup

1. Copy `.env.example` to `.env`. If you change the local PostgreSQL password, update `DATABASE_URL` in the ignored `services/mazzzali-api/local.settings.json` to match.
2. Start PostgreSQL and Azurite with `docker compose up -d`.
3. Install workspace dependencies with `npm install`.
4. Build all workspaces with `npm run build`.
5. Start the API from `services/mazzzali-api` with Azure Functions Core Tools (`func start`).
6. Start the web app with `npm --prefix services/mazzzali-web run dev`.

The frontend currently uses a mock API client so it can run without the Functions host. `.azure/integration-plan.md` records the API seam and database work for the integration phase. Local Functions settings are intentionally ignored by Git; `services/mazzzali-api/local.settings.json` contains development-only values.

## Workspaces

- `services/mazzzali-web`: React, Vite, Fluent UI, and the mock-backed API seam.
- `services/mazzzali-api`: Express routes, Azure Functions v4 entry point, auth, repositories, and Azure service providers.
- `services/shared`: API entities, response contracts, and Zod validation schemas.
