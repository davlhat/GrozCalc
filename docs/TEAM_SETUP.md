# Team setup and export guide

## Option A — Clone from GitHub (recommended)

Install **Node.js 20+** and **Git**. Open a terminal:

```bash
git clone -b dev/initial-prototype https://github.com/davlhat/GrozCalc.git
cd GrozCalc
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173). The development server must remain running.

## Option B — Download a ZIP without Git

1. Open the [development branch](https://github.com/davlhat/GrozCalc/tree/dev/initial-prototype).
2. Choose **Code → Download ZIP**.
3. Extract the ZIP and open a terminal in the extracted folder.
4. Run `npm install` and `npm run dev`.

## Build a shareable static frontend

```bash
npm install
npm run build
```

The compiled static frontend is generated in `dist/`. Upload its contents to a static web host, or preview it locally with:

```bash
npx vite preview
```

Do **not** double-click `dist/index.html` and expect it to work via `file://`; use an HTTP server. A `dist/` ZIP is useful for static hosting but is **not** the editable source project.

## Data sharing caveat

The current prototype stores foods and diary entries in each browser's `localStorage`. **Custom products are not shared between team members.** Each person has independent browser data. Clearing site data resets local changes. The seeded sample foods are illustrative, not verified supermarket entries.

The future FastAPI/PostgreSQL milestone will replace browser-only storage with shared SQL persistence, server validation, and admin permissions. The current "Product manager" is a UI preview, not a secured admin interface.

## Team development

1. Work on feature branches based on `dev/initial-prototype`.
2. Commit changes, push your branch, and open a pull request.
3. Review and merge into the development branch.
4. Merge to `main` only after builds and tests pass.

The interface uses CSS and hand-authored SVG geometric icons. No generated images are included.
