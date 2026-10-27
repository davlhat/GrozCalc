# GrozCalc SQL API — first backend milestone

This is an **initial** Node.js/Express/PostgreSQL backend, not a completed production authentication system.

1. Create a local PostgreSQL database named `grozcalc`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `ADMIN_API_KEY`.
3. In `server/`: run `npm install`, `npm run db`, then `npm run dev`.
4. GET `/health` and GET `/api/products` are public. Admin requests require header `x-admin-key`.
5. POST `/api/admin/products` inserts products. DELETE `/api/admin/products/:id` removes products. GET `/api/admin/export` exports catalog JSON.

**Security limitation:** API-key admin access is temporary for local development. Never expose the key in frontend code. Before deployment, replace it with authenticated sessions and role-based authorization, per project documentation.

**Not yet connected:** The React UI still uses localStorage. The diary, favorites, blacklist and goal tables are schema groundwork; their API endpoints and identity checks are pending. No image-upload storage is implemented; products can reference externally hosted images by URL.

## SQL diary and personal collections (local development)

New endpoints: `GET/POST /api/diary`, `PATCH/DELETE /api/diary/:id`, `GET /api/lists/:kind`, `PUT/DELETE /api/lists/:kind/:productId` where kind is `favorite` or `blacklist`. All require an `x-dev-user-id` header. The React client generates a random browser-local identifier and reuses it across refreshes.

**Critical security restriction:** This identifier is **not authentication** and can be spoofed. Do not expose these endpoints to the public internet or store sensitive personal information. Replace with real sessions and authenticated user IDs before any production use. This is only a local proof of SQL persistence. SQL products use database IDs; demo/custom products still use localStorage. Browser storage clearing loses the local identifier, making its SQL diary inaccessible from that browser without restoring the ID.

After pulling backend changes, restart `npm run dev` in `server/` (Node watch may reload automatically). No additional migration is required for these existing tables.

## Account login (development)
Run `npm run db` after pulling to create `app_users` and `app_sessions` (existing data is retained).
Restart the backend and frontend. Open **Account** in the sidebar, register with an email and password of at least 10 characters, then sign in.
Passwords use per-user salted scrypt hashes; sessions are opaque HttpOnly cookies with seven-day expiration and database-backed revocation. API CORS must match the frontend origin exactly (`http://localhost:5173` by default).
New accounts always have the **user** role. For local development, promote an account manually through PostgreSQL after registration, for example:
```sql
UPDATE app_users SET role='admin' WHERE email='your-actual-email@example.com';
```
Only run that query for an account you control; do not make admin promotion publicly accessible. Existing `ADMIN_API_KEY` support remains a **development-only** fallback and is disabled when `NODE_ENV=production`.
**Deployment blockers:** authenticated accounts coexist with a legacy development user-ID fallback, and browser-local demo data is not migrated into the account. Before public deployment, remove development fallbacks, implement request rate limiting and password reset/email verification, and review cross-origin/session security and image hosting.
