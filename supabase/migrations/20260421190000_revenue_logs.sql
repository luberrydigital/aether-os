-- Real revenue logging + company totals (replaces mock dashboard telemetry)

alter table public.companies
  add column if not exists total_revenue_usd_cents bigint not null default 0,
  add column if not exists total_revenue_zar_cents bigint not null default 0,
  add column if not exists total_platform_fee_usd_cents bigint not null default 0,
  add column if not exists total_platform_fee_zar_cents bigint not null default 0,
  add column if not exists total_net_usd_cents bigint not null default 0,
  add column if not exists total_net_zar_cents bigint not null default 0;

create table if not exists public.revenue_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  gateway text not null default 'sandbox',
  currency text not null check (currency in ('USD','ZAR')),
  gross_cents integer not null check (gross_cents >= 0),
  platform_fee_rate numeric not null check (platform_fee_rate >= 0.18 and platform_fee_rate <= 0.22),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  net_cents integer not null check (net_cents >= 0),
  reference text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists revenue_logs_company_id_idx on public.revenue_logs (company_id);
create index if not exists revenue_logs_user_id_idx on public.revenue_logs (user_id);
create index if not exists revenue_logs_created_at_idx on public.revenue_logs (created_at desc);

alter table public.revenue_logs enable row level security;

create policy "revenue_logs_select_owner"
  on public.revenue_logs
  for select
  using (auth.uid() = user_id);

create policy "revenue_logs_insert_owner"
  on public.revenue_logs
  for insert
  with check (auth.uid() = user_id);

create or replace function public._apply_revenue_log_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Safety: only allow owner-owned rows to roll up
  if new.user_id is null then
    return new;
  end if;

  if new.currency = 'USD' then
    update public.companies
      set total_revenue_usd_cents = total_revenue_usd_cents + new.gross_cents,
          total_platform_fee_usd_cents = total_platform_fee_usd_cents + new.platform_fee_cents,
          total_net_usd_cents = total_net_usd_cents + new.net_cents
      where id = new.company_id and user_id = new.user_id;
  else
    update public.companies
      set total_revenue_zar_cents = total_revenue_zar_cents + new.gross_cents,
          total_platform_fee_zar_cents = total_platform_fee_zar_cents + new.platform_fee_cents,
          total_net_zar_cents = total_net_zar_cents + new.net_cents
      where id = new.company_id and user_id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists revenue_logs_rollup_totals on public.revenue_logs;
create trigger revenue_logs_rollup_totals
  after insert on public.revenue_logs
  for each row execute function public._apply_revenue_log_totals();

