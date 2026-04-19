create table if not exists public.orchestration_sessions (
  thread_id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'awaiting_approval',
  state jsonb not null,
  interrupt jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orchestration_sessions_user_id_idx
  on public.orchestration_sessions (user_id);

alter table public.orchestration_sessions enable row level security;

create policy "Users select own orchestration sessions"
  on public.orchestration_sessions
  for select
  using (auth.uid() = user_id);

create policy "Users insert own orchestration sessions"
  on public.orchestration_sessions
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own orchestration sessions"
  on public.orchestration_sessions
  for update
  using (auth.uid() = user_id);
