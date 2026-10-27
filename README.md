# GrozCalc

Nutrition tracking and meal planning based on products from Latvian supermarkets.

## Current milestone: frontend prototype

- Responsive React + TypeScript interface with glass-style CSS components and geometric decorations; no generated artwork.
- Overview with calories and macro progress.
- Searchable product catalog with store filtering.
- Daily diary: add products by grams, edit amounts, remove entries and change dates.
- Demo product manager: add/delete products with macro values and declared additives.
- Data saved in browser localStorage.

**This is not the completed university prototype.** The current data is illustrative, the product-management page has no role-based access control, and persistence is in browser localStorage rather than the planned SQL database.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the local URL reported by Vite. To check the production build:

```bash
npm run build
```

## Next milestones

1. FastAPI + PostgreSQL backend with Products, Daily_Logs and Log_Items.
2. Connect catalog and diary to real API reads and writes.
3. Add profiles, authentication and administrator permissions.
4. Verify real product nutrition data; extend additive/ingredient records.
5. Tests, GitHub Actions, documentation and deployment.

See the project requirements specification and design documentation for full scope.
