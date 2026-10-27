# GrozCalc — university demonstration and acceptance plan

## What is demonstrable
GrozCalc is a responsive React/TypeScript nutrition tracker backed by Node.js/Express and PostgreSQL. It includes authentication, account-specific products, food diary, goal settings and presets, favorites, blacklist, catalog filters, analytics, administrator catalog management, image uploads, and JSON exports. The catalog includes 55 illustrative demo foods and 60 retailer-associated entries: 20 source-linked Rimi, 20 source-linked Maxima, and 20 **unverified approximate Lidl analogues** with conspicuous WIP warnings. A link is not evidence of independently verified nutrition; confirm individual labels before describing records as verified.

## Demo script (about 6 minutes)
1. **Overview (30 seconds):** Show the daily calorie and macro dashboard and responsive/mobile preview.
2. **Catalog (60 seconds):** Search and filter Rimi, Maxima and Lidl. Open a source link. Point out the amber ◷ WIP marker on Lidl estimates and explain why unverified figures are not treated as verified.
3. **Account and personal products (60 seconds):** Sign in, create a food with nutrients per 100 g, refresh and show persistence.
4. **Food diary (60 seconds):** Add a source-linked food and the personal food; change grams and show the recalculated daily totals. Refresh to prove PostgreSQL persistence.
5. **Favorites and blacklist (45 seconds):** Favorite a catalog food, blacklist another, inspect their dedicated pages, remove them, and refresh.
6. **Goals (45 seconds):** Change the daily target and macro goals, save a custom preset, refresh and restore it.
7. **SQL demonstration (45 seconds):** Show `products`, `user_custom_products`, `personal_diary_entries`, `account_showcase_diary`, `account_product_lists`, `user_settings` and `goal_presets`. Explain read → process → write flows and account isolation.
8. **Export and localization (30 seconds):** Download personal JSON, switch EN/LV, and show mobile layout.

## Single-pass test checklist
- [ ] `npm run build` succeeds.
- [ ] `node scripts/check-products.mjs` succeeds and reports 20/20/20.
- [ ] `cd server && npm run db` succeeds on PostgreSQL.
- [ ] `node scripts/integration.mjs` succeeds on a **separate clean test database**; the script creates accounts and data.
- [ ] Account A cannot read/delete account B's products, diary or collections.
- [ ] Guest data does not appear in account totals.
- [ ] Favorite and blacklist toggle, dedicated pages, refresh persistence, and removal work for demo, retailer-associated, shared SQL and personal foods.
- [ ] Diary create/edit/delete works for all supported product types; refresh persists signed-in entries.
- [ ] Goals and custom presets persist after sign-out/sign-in.
- [ ] Non-admin cannot create, import or verify catalog products.
- [ ] LV/EN switch covers all visible controls and error messages; inspect narrow mobile viewport.
- [ ] No estimated product is labeled verified; check Lidl badge, explanation, and source category link.
- [ ] JSON export contains account records and excludes password hashes and session tokens.

## Important limitations
- The 20 Lidl values are analogues, **not exact verified Lidl label measurements**.
- 40 Rimi/Maxima records have product links, but an independent final label audit is still needed; source-linked does not mean verified.
- No native React Native app or Python ingestion pipeline is included.
- No production-grade password reset, email verification or distributed rate limiter.
- The in-browser guest profile is not automatically imported into signed-in SQL records.
- Run database integration tests on an isolated CI/test PostgreSQL database, not a production database.

## Commands for the final combined update
From the repository root on Windows:
```cmd
git pull --ff-only origin dev/initial-prototype
node scripts/check-products.mjs
npm run build
cd server
npm run db
```
Do not launch a second server on port 3001. Keep one backend process running; the frontend uses port 5173.
