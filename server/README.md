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
