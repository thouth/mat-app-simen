# Matlager & Handleliste (cloud-only)

App for å holde oversikt over matvarene hjemme (Matlager) og Handleliste.
- Frontend/Backend: Next.js (App Router) + serverless routes
- Database: Supabase Postgres
- Eksternt API: Matvaretabellen (`/api/nb/foods.json`) via server-side proxy/rensing
- Mobil-først UI
- E2E-tester med Playwright (kjøres i CI)

## Oppsett (uten lokal kjøring)
1. Opprett et prosjekt i **Supabase** og kjør SQL i SQL Editor:
```sql
create extension if not exists pgcrypto;
do $$ begin
  create type item_state as enum ('SHOPPING','PANTRY');
exception when duplicate_object then null; end $$;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  food_id integer,
  name text not null,
  quantity numeric not null default 1,
  unit text not null default 'stk',
  state item_state not null default 'SHOPPING',
  added_at timestamptz not null default now(),
  purchased_at timestamptz,
  expires_at timestamptz,
  notes text
);

create index if not exists items_state_name_idx on public.items(state, name);
```

2. **Deploy** denne repoen til **Vercel** (eller Render).

3. Sett miljøvariabler i Vercel/Render (Project Settings → Environment Variables):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`  (kun serverless routes)

4. (Valgfritt) Slå på RLS og `user_id` senere for multi-user.

## Endepunkter
- `GET /api/foods?q=melk` – proxy og rensing av Matvaretabellen, 24t cache
- `GET /api/items?state=SHOPPING|PANTRY`
- `POST /api/items` – opprett vare (default SHOPPING)
- `PATCH /api/items/:id` – oppdater / flytt til `PANTRY` (setter `purchased_at`)
- `DELETE /api/items/:id`

## Tester i CI (GitHub Actions)
Workflow `ci.yml` bygger Next, starter server og kjører Playwright mot `http://localhost:3000` i runneren.

> Husk å legge inn Supabase-secrets i repoets GitHub Secrets før CI.

## Lisens
MIT
