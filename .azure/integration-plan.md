# Integration Hand-off

## Services

- Essential: Azure Functions (`services/mazzzali-api`), PostgreSQL (`DATABASE_URL` locally; `AZURE_POSTGRES_HOST`, `AZURE_POSTGRES_DATABASE`, and `AZURE_POSTGRES_USER` with managed identity in production), Blob Storage for Functions host storage (`AzureWebJobsStorage`; production SDK endpoint `AZURE_STORAGE_BLOB_ENDPOINT`). No enhancement services.

## Backend

- Folder: `services/mazzzali-api`
- Run: `func start` (HTTP port 7071; Functions host route prefix `/api`)
- Build from root: `npm run build --workspace mazzzali-api`
- Health: `GET /api/health`
- Express routes are in `src/routes`; Functions v4 entry is `src/functions/expressApi.ts`.

## Frontend

- Folder: `services/mazzzali-web`
- Build: `npm --prefix services/mazzzali-web run build`
- Dev: `npm --prefix services/mazzzali-web run dev`
- Live-client swap seam: `services/mazzzali-web/src/api/index.ts`; keep the `ApiClient` method contract and use `credentials: 'include'` for the HttpOnly session cookie.
- Delete after live wiring: `src/api/mockClient.ts`, `src/mocks/data.ts`, local API types `src/api/types.ts`, preview state helper `src/api/previewState.ts`, and the `PreviewStateSwitcher` in `src/App.tsx`.

## Routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/profile/me` (current-user lookup)
- `PUT /api/profile/me`
- `GET /api/goals`
- `PUT /api/goals`
- `GET /api/recipes?q=&category=&limit=`
- `GET /api/recipes/:recipeId`
- `GET /api/openapi.json` (public API document)

Auth issues a two-hour HS256 JWT in the HttpOnly `mazzzali_session` cookie. Preserve cookie auth and require `JWT_SECRET` (at least 32 bytes), `JWT_ISSUER`, and `JWT_AUDIENCE`. Passwords are bcrypt-hashed; user responses must never expose password hashes.

## Database

- PostgreSQL; use `node-pg-migrate` with migration files in `services/mazzzali-api/migrations`.
- Expected tables/collections: `users` (`user`), `goals` (`goal`), and `recipes` (`recipe`). Repository SQL defines the required columns and relationships.
- `DATABASE_URL` is the local connection setting. Production uses the Azure PostgreSQL host/database/user variables above and managed identity.
- Create schema migrations only. **NO seed data is to be created.**

## Shared Contracts

- Package: `services/shared` (`@mazzzali/shared`), containing entity types, API response contracts, error-code union, and Zod request schemas.
- Frontend imports should move from `src/api/types.ts` to `@mazzzali/shared`; backend uses relative `../shared` imports so `tsc` emits shared code into its deployable `dist`.
