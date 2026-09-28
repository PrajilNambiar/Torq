# BrandBridge.Web

React (Vite + TypeScript) frontend for the BrandBridge marketplace API.

## Run

```bash
# API on http://localhost:5081 (see repo root README)
cd BrandBridge.Web
cp .env.example .env   # if needed
npm install
npm run dev
```

App: `http://localhost:3000` (CORS is already allowed by the API).

## Roles

- **Business** — briefs, proposals, fund campaigns, approve milestones
- **Provider** — profile, opportunities, proposals, deliver milestones
- **Admin** — open/reject requirements, verify providers, disputes

Seed admin (API): `admin@brandbridge.local` / `Admin12345!`
