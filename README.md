# Mazzzali

Mazzzali is a React/Vite wellness and recipe app backed by an Express API hosted in Azure Functions. After creating an account, users choose an eating focus. Weight-loss users can enter starting and target weights and a personal target date. The MVP does not collect weigh-in history or host recipe media.

## Local setup

1. Copy `.env.example` to `.env`. If you change the local PostgreSQL password, update `DATABASE_URL` in the ignored `services/mazzzali-api/local.settings.json` to match.
2. Start PostgreSQL and Azurite with `docker compose up -d`.
3. Install workspace dependencies with `npm install`.
4. Build all workspaces with `npm run build`.
5. Start the API from `services/mazzzali-api` with Azure Functions Core Tools (`func start`).
6. Start the web app with `npm --prefix services/mazzzali-web run dev`.

The frontend uses a typed live API client through the Vite `/api` proxy. New accounts are directed to focus onboarding before accessing the app. Local Functions settings are intentionally ignored by Git; `services/mazzzali-api/local.settings.json` contains development-only values.

## Workspaces

- `services/mazzzali-web`: React, Vite, Fluent UI, and the live API client.
- `services/mazzzali-api`: Express routes, Azure Functions v4 entry point, auth, repositories, and Azure service providers.
- `services/shared`: API entities, response contracts, and Zod validation schemas.
