# Windows 11: complete local development setup

## Prerequisites
- Git for Windows (`git --version`)
- Node.js 20+ (`node --version`, `npm --version`)
- Docker Desktop with Linux containers (`docker --version`, `docker compose version`)
- A terminal such as PowerShell or Windows Terminal.

## 1. Open your existing repository

Open PowerShell, **not an elevated System32 terminal**, and navigate to the existing GrozCalc directory. If you are unsure of its location, find the folder using File Explorer, click the address bar, copy the path and run:

```powershell
cd "C:\path\to\your\GrozCalc"
git status
```

If `git status` reports "not a git repository", you are in the wrong folder.

## 2. Update without losing work

```powershell
git status
git fetch origin
git switch dev/initial-prototype
git pull --ff-only origin dev/initial-prototype
```

If `git status` reports local changes, stop before pulling and ask the team whether to commit or stash them. Do not run `git reset --hard` or delete the folder.

## 3. Start PostgreSQL

Launch Docker Desktop and wait for its engine to start. From the **repository root**:

```powershell
docker compose up -d db
docker compose ps
```

Expected: a `db` container running, eventually healthy. Database is accessible on localhost port 5432. Credentials in compose are **development-only**.

If port 5432 is in use, either stop the conflicting local PostgreSQL service or change the host port in compose to e.g. `127.0.0.1:5433:5432` and update the connection URL to port 5433.

## 4. Configure and start backend

Open a **second terminal**:

```powershell
cd "C:\path\to\your\GrozCalc\server"
Copy-Item .env.example .env
notepad .env
```

The example `DATABASE_URL` already matches Docker Compose. Replace `ADMIN_API_KEY` with a strong random secret, **keep it private**, and save. For example, create a random secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `ADMIN_API_KEY`. Do not commit `.env`, paste its value in chat, or embed it in the React frontend.

```powershell
npm install
npm run db
npm run dev
```

The API should listen on port 3001. Open `http://localhost:3001/health`; expected JSON: `{"ok":true}`. The products endpoint is `http://localhost:3001/api/products` and initially returns `[]` because the SQL database starts empty.

## 5. Start frontend

Open a **third terminal**:

```powershell
cd "C:\path\to\your\GrozCalc"
npm install
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`. Header should show `API: online` when the backend is reachable. **Important:** the current frontend still uses localStorage for catalog/diary; `API: online` only confirms connectivity, not full SQL synchronization.

## 6. Add a product to PostgreSQL (developer-only)

Use PowerShell in a **fourth terminal** and keep the same administrator secret you placed in `server/.env`. This example does not print or store your secret in source files:

```powershell
$secret = Read-Host "Enter local ADMIN_API_KEY"
$body = @{
 name = "Test product"
 brand = "Demo"
 store = "Rimi"
 calories = 100
 protein = 5
 fat = 3
 carbs = 12
 additives = ""
 ingredients = ""
 recommendation = "Neitrāls"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/admin/products" -Headers @{"x-admin-key"=$secret} -ContentType "application/json" -Body $body
Invoke-RestMethod "http://localhost:3001/api/products"
```

The product should appear in the API result. It will **not yet appear in the React catalog** until frontend/API integration is finished.

## 7. Export SQL product catalog

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/export" -Headers @{"x-admin-key"=$secret} -OutFile "$HOME\Downloads\grozcalc-products.json"
```

This exports the product catalog only, not the entire PostgreSQL database. To back up all SQL data, use `pg_dump` once the schema is finalized.

## 8. Shut down

Stop each Node process using Ctrl+C. Stop the database without deleting stored data:

```powershell
docker compose down
```

**Never run `docker compose down -v` unless you intentionally want to delete the development database volume.**

## Current limitations

- Admin key is temporary local-development authentication, not real RBAC.
- Frontend catalog/diary still uses browser storage.
- No real retailer product import or image upload.
- Goal presets are initial schema records, not medical or personalized recommendations.
- The application has not been fully integration-tested on your machine.

When errors occur, send the command and its complete error text **with credentials removed**.
