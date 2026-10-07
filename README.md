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

## Demo access

For local/EC2 demonstration, migration `004_demo_account_seed` creates:

- Email: `you@example.com`
- Password: `mazzzali-demo`

Change or remove this demo account before production use.

## Updating an EC2 deployment from S3

Upload the project folder to an S3 prefix, then on the EC2 host run:

```bash
cd /root/mazzzali
./scripts/update-from-s3.sh s3://BUCKET/mazzzali-main/
./rerun_mazzzali_after_update.sh
```

The helper intentionally preserves the EC2 `.env`, Azure Functions `local.settings.json`, `node_modules`, and the generated frontend `dist` directory. Do not use `--delete` for the normal application update flow.
