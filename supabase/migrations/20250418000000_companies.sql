-- Run this in the Supabase SQL editor or via the Supabase CLI after linking a project.

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sentence text not null,
  agent_plan jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists companies_user_id_idx on public.companies (user_id);

alter table public.companies enable row level security;

create policy "Users can read their companies"
  on public.companies
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their companies"
  on public.companies
  for insert
  with check (auth.uid() = user_id);
