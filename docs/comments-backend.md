# Collaborator Comments — Backend Setup (Supabase)

The collaborator-comments feature (comment mode: press **C**, the toolbar
comment button, or the `/` console) persists to a single Supabase project shared
by **all** store deployments. Each build reads only its own store's rows — FCM
never sees COD:M comments — enforced by the `store` column plus Row-Level
Security. A second column, `deployment_scope`, separates the internal
multi-store build (runtime theme switcher) from the locked per-store builds
even when both are showing the same store/theme (see §2).

## 1. Create the project & env vars

1. Create a Supabase project (free tier is fine).
2. Copy the Project URL and the `anon` public key.
3. Set them locally in `.env.local` (see `.env.example`) and in **every** Vercel
   project's *Environment Variables*:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

The anon key is public by design; the SQL below constrains what it can do.

## 2. Schema + RLS

Run this in the Supabase SQL editor:

```sql
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  thread_id    uuid not null,                 -- root comment id; groups a thread
  parent_id    uuid references public.comments(id) on delete cascade,
  store        text not null,                 -- = useTheme().theme.value (isolation key)
  -- 'internal' (default multi-store build, theme switchable at runtime) or
  -- 'locked' (a build:<store> deployment, one fixed theme forever). Set by the
  -- client from the __STORE_LOCKED__ compile-time flag — plain column, not
  -- generated (it isn't derived from context/anchor jsonb).
  deployment_scope text not null default 'internal',
  context      jsonb not null default '{}',   -- { page, view, surface, surfaceLabel } — flow state (see comments-schema.md)
  anchor       jsonb not null default '{}',   -- { container, selector, index, nx, ny, sectionId, device, component, label, text, breadcrumb }
  -- Flow-state surface, promoted out of context jsonb for indexing/filtering.
  -- Generated (always derived from context) so the client never sets it directly.
  surface      text generated always as (context->>'surface') stored,
  author_id    text not null,                 -- per-browser token (localStorage) — owns edit/delete
  author_name  text not null,
  author_color text not null,
  body         text not null,
  resolved     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists comments_store_idx on public.comments (store);
create index if not exists comments_thread_idx on public.comments (thread_id);
create index if not exists comments_surface_idx on public.comments (surface);
create index if not exists comments_store_scope_idx on public.comments (store, deployment_scope);

alter table public.comments enable row level security;

-- Prototype-grade policies: anonymous reviewers may read/insert/update/delete,
-- but every row is bound to a store. There is no real auth; edit/delete
-- ownership is enforced client-side via author_id. Tighten before any real use.
create policy "read all"   on public.comments for select using (true);
create policy "insert any" on public.comments for insert
  with check (store is not null and deployment_scope is not null);
create policy "update any" on public.comments for update using (true) with check (true);
create policy "delete any" on public.comments for delete using (true);
```

> Note: with the anon key public and permissive policies, this is suitable for an
> internal prototype only. The `store` column is the isolation boundary; the
> client always filters `store = <active theme>`, and the realtime channel
> subscribes with the same filter. `deployment_scope` adds a second boundary so
> the internal (all-stores) build and a locked per-store build never see each
> other's comments even when they happen to share the same `store` value —
> realtime can only server-side filter on one column, so the client also
> double-checks `deployment_scope` on incoming INSERT/UPDATE events before
> applying them (see `useComments.js`).

### Migrating an existing `comments` table

If you created the table before `deployment_scope`/`surface` existed:

```sql
-- Only if your existing rows are just setup/test data with no real value —
-- otherwise skip this and accept that pre-migration rows default to 'internal'.
truncate table public.comments;

alter table public.comments
  add column if not exists deployment_scope text not null default 'internal';
alter table public.comments
  add column if not exists surface text
  generated always as (context->>'surface') stored;

create index if not exists comments_surface_idx on public.comments (surface);
create index if not exists comments_store_scope_idx on public.comments (store, deployment_scope);

drop policy if exists "insert any" on public.comments;
create policy "insert any" on public.comments for insert
  with check (store is not null and deployment_scope is not null);
```

Old rows (if not truncated) have no `context.surface`, so their generated
`surface` is `null` — the client treats a missing surface as `'storefront'` on
read. They also default `deployment_scope` to `'internal'`, which may not
match where they were actually created; if that matters, delete/tag them
manually instead of truncating.

The full column + jsonb-shape reference lives in
[comments-schema.md](./comments-schema.md).

## 3. Realtime

Enable realtime for the `comments` table (Database → Replication, or Table
Editor → toggle Realtime). The client subscribes to `postgres_changes` filtered
to the active store so new comments/replies/resolves appear without a refresh.
