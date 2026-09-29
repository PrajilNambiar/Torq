# BrandBridge

Marketing marketplace (Phase 1). Product source: BrandBridge Startup & Product Blueprint. Stack: ASP.NET Core 9, PostgreSQL, and a React (Vite) UI.

## Solution

- `BrandBridge.Api` — marketplace API (Identity, Marketplace, Campaigns, Payments stub)
- `BrandBridge.Web` — React frontend (Vite + TypeScript) on `http://localhost:3000`
- `tests/BrandBridge.Api.Tests` — API flow tests (in-memory)

## Run locally

```powershell
docker compose up -d
cd BrandBridge.Api
dotnet ef database update
dotnet run
```

API: `http://localhost:5081/swagger`

Frontend:

```bash
cd BrandBridge.Web
npm install
npm run dev
```

UI: `http://localhost:3000`

Seed admin: `admin@brandbridge.local` / `Admin12345!`

## Core loop

1. Register business + provider (`POST /api/v1/auth/register`)
2. Provider profile + service + portfolio
3. Business creates requirement (Draft) and submits (UnderReview)
4. Admin opens requirement (`POST /api/v1/admin/requirements/{id}/open`)
5. Provider lists opportunities and submits a proposal
6. Business compares and selects → campaign `PendingFunding`
7. Business funds (stub), both sides message, provider submits milestone, business approves and payouts (stub + 10% fee)
8. Reviews after completion. All critical actions write `AuditEvent`.

JWT is required except register, login, health, and Swagger. Resource IDs are authorized against the caller's business/provider — client-supplied tenant IDs are not trusted.

Payments are stubbed (`ExternalProvider = stub`). Replace with a regulated marketplace PSP before production. Do not store card numbers.

## Engineering

- Thin controllers, rules in services, EF projections/`AsNoTracking` on reads, pagination (max 50)
- Structured Serilog + `X-Correlation-Id`
- FluentValidation auto-validation, verified-only opportunities, linked file metadata, idempotency keys on select/fund/payout, chat leak checks
- Set `Jwt:Key` and `Seed:AdminPassword` via environment or `appsettings.Development.json` (not production config)
- CI: restore, build, test
