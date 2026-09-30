# Project Plan

**Status**: Integrating
**Created**: 2026-09-29
**Mode**: NEW

---

## 1. Project Overview

**Goal**: Build Mazzzali, a responsive wellness and recipe app for adults choosing between a weight-loss focus and healthier, tasty eating. After creating an account, users choose their focus; users choosing weight loss can enter starting weight, target weight, and a personal target date. Users can browse curated recipes across eight categories and view externally hosted cooking videos. The MVP does not add ongoing weigh-in history or provide medical advice. The project is designed so that every module is independently testable.

**App Type**: SPA + API

**API Login**: Yes

**Mode**: NEW

**Deployment Plan**: No deployment plan found

---

## 2. Backend — Azure Functions

| Component           | Technology     |
| ------------------- | -------------- |
| **Language**        | TypeScript     |
| **Framework**       | Express        |
| **Runtime**         | Node           |
| **Package Manager** | npm            |
| **Test Runner**     | vitest         |
| **Mocking Library** | vi.mock        |
| **Test Command**    | npm test       |
| **Orchestration**   | docker-compose |

The Azure Functions HTTP entry point hosts the Express API through a thin adapter. Keep handlers, Express routing, persistence, validation, and shared contracts in separate testable modules.

---

## 3. Frontend — Web App

| Component           | Technology   |
| ------------------- | ------------ |
| **Language**        | TypeScript   |
| **Framework**       | React + Vite |
| **Package Manager** | npm          |
| **Test Runner**     | vitest       |
| **Mocking Library** | vi.mock      |
| **Test Command**    | npm test     |

---

## 4. Services Required

| Azure Service   | Role in App                                                                               | Environment Variable       | Default Value (Local)                                                        | Classification |
| --------------- | ----------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------- | -------------- |
| Azure Functions | Run the Express-backed HTTP API                                                           | `FUNCTIONS_WORKER_RUNTIME` | `node`                                                                       | Essential      |
| PostgreSQL      | Persist accounts, focus choice, starting/target weight goals, and curated recipe metadata | `DATABASE_URL`             | `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/mazzzali` | Essential      |
| Blob Storage    | Required Azure Functions host storage; no user media uploads or video hosting             | `AzureWebJobsStorage`      | `UseDevelopmentStorage=true`                                                 | Essential      |

---

## 5. Prerequisites

Double-check every `❓` item before running or debugging the project; those probes were inconclusive, not proof that a tool is absent.

### Run

| Tool                       | Service(s) | Installed | Version     |
| -------------------------- | ---------- | --------- | ----------- |
| Node.js                    | \*         | ✅        | 24.11.1     |
| npm                        | \*         | ✅        | 11.6.2      |
| Azure Functions Core Tools | API        | ❓        | —           |
| Azure Functions Core Tools | API        | ❓        | Unconfirmed |

### Debug

| Tool                                  | Service(s)                               | Installed | Version                        |
| ------------------------------------- | ---------------------------------------- | --------- | ------------------------------ |
| Docker                                | API (Functions host storage), PostgreSQL | ❓        | CLI 27.0.3; engine unavailable |
| Docker Compose                        | API (Functions host storage), PostgreSQL | ✅        | v2.28.1-desktop.1              |
| Microsoft Edge                        | Frontend                                 | ✅        | 154.0.4258.37                  |
| `ms-azuretools.vscode-azurefunctions` | API                                      | ❓        | Unconfirmed                    |

---

## 6. Design System & UI

**Component Library**: Fluent UI v9
**Style Direction**: Fresh, editorial wellness with compact, scannable recipe and progress views, crisp 6px corners, quiet surfaces, and restrained green balanced by a warm coral accent. Keep health metrics factual and non-judgmental.
**Typography**: DM Sans, Segoe UI Variable

### Color Palette

| Token     | Hex       | Usage                                                                          |
| --------- | --------- | ------------------------------------------------------------------------------ |
| `primary` | `#1E6B52` | Mazzzali green for primary actions, selected navigation, and progress emphasis |
| `accent`  | `#D96045` | Coral highlights for featured recipes and secondary emphasis                   |
| `surface` | `#F4F8F5` | Soft green-white page background                                               |
| `text`    | `#1C2B24` | Main headings, recipe names, and body copy                                     |
| `muted`   | `#607168` | Preparation times, helper text, and secondary metadata                         |
| `border`  | `#D7E3DA` | Quiet dividers, form outlines, and card edges                                  |

### Pages

| Page              | Route                | Purpose                                                                                 | Layout                                                  |
| ----------------- | -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Home              | `/`                  | Signed-in snapshot of the user's chosen focus, starting/target weight, and recipe picks | `header + nav + hero + kpi-row + two-column(list+list)` |
| Recipes           | `/recipes`           | Browse curated recipes by category, with filtered-results empty state                   | `header + nav + tabs + grid + empty`                    |
| Recipe Detail     | `/recipes/:recipeId` | Review ingredients and steps, then open the publisher-hosted cooking video              | `header + nav + two-column(main+list)`                  |
| Weight Goals      | `/goals`             | Review or update the focus, weights, and personal target date                           | `header + nav + form + action-bar + loading (skeleton)` |
| Sign In & Sign Up | `/login`             | Sign in or create an account; new accounts continue to focus onboarding                 | `form + tabs`                                           |

### Sample Content

Home — member goal: Focus: Weight loss · Starting weight: 84.2 kg · Target weight: 76.0 kg · no current-weight or progress history.
Home — focus and entered goal: Weight loss · Starting weight: 84.2 kg · Target weight: 76.0 kg. No current-weight history is stored.
Home — recipe picks: Lemon Chickpea Bowls · Tomato & White Bean Soup · Herby Salmon Tray Bake

Recipes — recipe cards:
| Recipe | Categories | Prep time | Servings |
|--------|------------|-----------|----------|
| Lemon Chickpea Bowls | Vegan, Mediterranean, Quick & Easy | 25 min | 2 |
| Tomato & White Bean Soup | Vegetarian, Budget-Friendly | 35 min | 4 |
| Herby Salmon Tray Bake | High Protein, Gluten-Free | 30 min | 2 |
| Cocoa Oat Bites | Desserts, Vegetarian | 20 min | 12 |

Recipes — categories: Quick & Easy · High Protein · Vegetarian · Vegan · Mediterranean · Gluten-Free · Budget-Friendly · Desserts. Empty state: no recipes match selected filters; offer Clear filters.
Recipe Detail — recipe fixtures:
| Recipe | Prep / servings | Categories | Video |
|--------|----------------|------------|-------|
| Lemon Chickpea Bowls | 25 min / 2 | Vegan, Mediterranean | Publisher-hosted cooking video |
| Tomato & White Bean Soup | 35 min / 4 | Vegetarian, Budget-Friendly | Publisher-hosted cooking video |
| Herby Salmon Tray Bake | 30 min / 2 | High Protein, Gluten-Free | Publisher-hosted cooking video |
Recipe Detail — Lemon Chickpea Bowls ingredients: 1 can chickpeas · 1 cucumber · 1 lemon · 150 g cooked quinoa · 2 tbsp tahini
Weight Goals — choices: Weight loss (starting: 84.2 kg · target: 76.0 kg · target date: user selected) · Healthy, tasty eating (no weight goal).
Weight Goals — food categories: Quick & Easy · High Protein · Vegetarian · Vegan · Mediterranean · Gluten-Free · Budget-Friendly · Desserts.
Sign In & Sign Up — fields: Email: you@example.com · Password: (blank) · Display name: (blank). After signup, onboarding asks for eating focus; weight loss additionally asks starting weight, target weight, unit, and target date.

---

## 7. Project Structure

```text
project-root/
├── .azure/
│   └── project-plan.md
├── .env.example
├── package.json
├── docker-compose.yml
└── services/
    ├── mazzzali-api/
    │   ├── host.json
    │   ├── local.settings.json
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── functions/
    │       ├── routes/
    │       ├── services/
    │       ├── repositories/
    │       ├── middleware/
    │       └── tests/
    ├── mazzzali-web/
    │   ├── package.json
    │   ├── vite.config.ts
    │   └── src/
    │       ├── api/
    │       ├── components/
    │       ├── pages/
    │       └── tests/
    └── shared/
        ├── package.json
        ├── types/
        └── schemas/
```

---

## 8. Route Definitions

| #   | Method | Path                     | Description                                                               | Request Body                                               | Response Body                 | Status Codes  |
| --- | ------ | ------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------- | ------------- |
| 1   | GET    | `/api/health`            | Health check for API and required dependencies                            | —                                                          | `{ status, services }`        | 200, 503      |
| 2   | POST   | `/api/auth/register`     | Create an account before choosing an eating focus                         | `{ email, password, displayName }`                         | `{ user }`                    | 201, 409, 422 |
| 3   | POST   | `/api/auth/login`        | Sign in to an existing account                                            | `{ email, password }`                                      | `{ user }`                    | 200, 401, 422 |
| 4   | GET    | `/api/profile/me`        | Read the signed-in user's profile, focus, and food categories             | —                                                          | `{ user, focus, categories }` | 200, 401, 404 |
| 5   | PUT    | `/api/profile/me`        | Update display name, eating focus, or food categories                     | `{ displayName?, focus?, categories? }`                    | `{ user, focus, categories }` | 200, 401, 422 |
| 6   | GET    | `/api/goals`             | Read the signed-in user's starting weight, target weight, and target date | —                                                          | `{ goal }`                    | 200, 401, 404 |
| 7   | PUT    | `/api/goals`             | Create or update the weight goal and personal target date                 | `{ startingWeight, targetWeight, weightUnit, targetDate }` | `{ goal }`                    | 200, 401, 422 |
| 8   | GET    | `/api/recipes`           | Browse recipes with optional text and category filters                    | Query: `q?`, `category?`, `limit?`                         | `{ recipes, total }`          | 200, 422      |
| 9   | GET    | `/api/recipes/:recipeId` | Read ingredients, steps, source, and cooking-video embed metadata         | —                                                          | `{ recipe }`                  | 200, 404      |

All API errors use `{ error: { code, message, details } }`; validate user-entered values and avoid medical advice or guaranteed health outcomes. Recipe records retain their publisher attribution and externally hosted video embed URL; the app does not copy or host media files. The weight-goal model stores the user-entered starting and target weights and personal target date, not ongoing check-ins.

---

## 9. Next Steps

1. Run **azure-project-scaffold** to execute this plan
2. Run **azure-project-integrate** to wire the frontend to live data, smoke-test the backend, and create the migrations
3. Run **azure-debug-plan** → **azure-debug-generate** for Docker emulators and VS Code debugging
4. Run the **azure-deploy** agent when ready; it uses **azure-app-onboard** for architecture, cost estimation, IaC generation, provisioning, and health verification
