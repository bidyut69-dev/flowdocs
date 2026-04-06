-- ════════════════════════════════════════════════
-- FlowDocs — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════

-- 1. PROFILES (linked to auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  company text,
  email text,
  phone text,
  plan text default 'free',
  created_at timestamptz default now()
);

-- 2. CLIENTS
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  email text,
  company text,
  country text,
  phone text,
  created_at timestamptz default now()
);

-- 3. DOCUMENTS
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  type text not null check (type in ('Proposal', 'Contract', 'Invoice', 'NDA')),
  status text default 'draft' check (status in ('draft', 'pending', 'signed', 'paid', 'overdue')),
  amount numeric(12, 2),
  currency text default 'USD',
  content jsonb default '{}',
  sign_token uuid default gen_random_uuid() unique,
  signature_url text,
  signed_at timestamptz,
  pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ──────────────────────────

alter table profiles enable row level security;
alter table clients enable row level security;
alter table documents enable row level security;

-- Profiles: own row only
create policy "profiles_select" on profiles for select using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Clients: own rows only
create policy "clients_all" on clients for all using (auth.uid() = user_id);

-- Documents: own rows + public read by sign_token
create policy "documents_owner" on documents for all using (auth.uid() = user_id);
create policy "documents_public_read" on documents for select using (true);
create policy "documents_public_sign" on documents for update using (true)
  with check (sign_token is not null);

-- ── STORAGE BUCKETS ─────────────────────────────

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', true)
on conflict (id) do nothing;

-- Storage: anyone can upload signatures
create policy "signatures_upload" on storage.objects
for insert with check (bucket_id = 'signatures');

create policy "signatures_read" on storage.objects
for select using (bucket_id = 'signatures');

-- ── AUTO-CREATE PROFILE ON SIGNUP ───────────────

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── UPDATED_AT TRIGGER ───────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on documents
  for each row execute procedure update_updated_at();
