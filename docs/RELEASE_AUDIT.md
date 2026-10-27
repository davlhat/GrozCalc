# GrozCalc release audit — October 2026

## Implemented in dev/initial-prototype
- Mint-green responsive dashboard, SVG icons and handmade cart mascot.
- Account registration/login, hashed passwords, server sessions and admin role.
- Account SQL goals and account-specific custom goal presets; protected built-in presets.
- Account-owned products, diary CRUD for both shared SQL catalog and personal SQL foods.
- Favorites and blacklist for **demo, shared catalog, and personal foods** via account SQL collections. Guest collections remain browser-local.
- Catalog search, shop filter, recommendation filter, protein/calorie filter, sorting, product image upload, atomic JSON batch import (1–100 sourced products, initially unverified), and manual source review.
- SQL export for shared catalog (admin) and personal account data (signed-in users).
- 55 **illustrative** demo foods plus **60 retailer-associated catalog entries**: 20 Rimi and 20 Maxima with individual source links, plus 20 Lidl-category analogues with **estimated, unverified** nutrition. All Lidl estimates are visibly labeled ◷ Estimated · WIP, with an amber warning and category-reference link.
- Partial EN/LV translation and mobile layout preview.
- GitHub Actions CI for frontend build, backend syntax, catalog consistency, PostgreSQL migrations and authenticated API integration tests.

## Still required before presenting as production-ready
1. **60 verified store SKUs:** 40 source-linked SKUs are prepared (20 Rimi and 20 Maxima); **20 Lidl entries are provisional approximations, not verified SKU nutrition**. Their values use typical nutrition for comparable foods; product names are category-level approximations, not proof of an exact package formulation. Data in `data/sourced-products.json` is auditable by direct source links; Confirm all package labels before claiming 60 verified items. Estimates should not be used for medically precise nutrition tracking.
2. **Complete EN/LV localization:** static UI and explicit backend error strings have Latvian equivalents; edge-case dynamic notifications still require bilingual browser QA.
3. **Cross-device guest migration:** old browser-local custom products, diary and collections are not automatically migrated into an account.
4. **Production auth hardening:** persistent/distributed rate limiter, CSRF protections, password reset and email verification; current in-memory throttling is suitable only for a single-instance demo.
5. **Backend integration tests:** CI now provisions PostgreSQL and executes multi-account API checks for auth, diary, collections, export and access control. Browser-level E2E tests and load tests are still pending.
6. **Admin verification quality:** manual review currently requires a source URL, but a URL alone does not guarantee correctness; reviewers must actually check labels. Add change history and evidence capture before public use.
7. **React Native mobile app:** responsive web/mobile preview exists; there is no native app.
8. **Automated Python ingestion:** data collection/verification pipeline not implemented.
9. **SQL schema refinements:** universal collections reference multiple product tables and do not have a polymorphic foreign key; app code validates writes and cleans up personal product deletions, but stronger database integrity would be preferable.

## Acceptance testing (one combined pass)
1. Run `npm run build` and `cd server && npm run db`; check the GitHub Actions workflow.
2. Sign in; create a personal food, add to diary, edit grams, refresh and delete.
3. Favorite and blacklist each of a demo, shared SQL and personal food; check Favorites/Blacklist pages; unblock and refresh.
4. Create a custom preset; save account goals; sign out/in and verify both.
5. Test guest mode separately; confirm guest diary does not appear in signed-in totals.
6. For an admin account, upload a photo, create a product, add a source URL, verify only after inspecting the source, and export catalog.
7. Download account JSON export and check for personal goals/products/diary/presets/collections (not passwords).
8. Switch EN/LV, test mobile preview and check for untranslated strings.
9. Test bad inputs, missing sessions, account isolation and 404s for another user's products.

Do not advertise the prototype as having 60 verified supermarket products or complete bilingual localization until these acceptance criteria are met.
