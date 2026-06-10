-- Printful fulfillment + orders ledger

alter table public.storefronts
  add column if not exists printful_store_id text;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  storefront_id uuid not null references public.storefronts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  user_id uuid references auth.users (id) on delete set null,

  currency text not null check (currency in ('USD','ZAR')),
  gross_cents integer not null check (gross_cents >= 0),
  platform_fee_rate numeric not null check (platform_fee_rate >= 0.18 and platform_fee_rate <= 0.22),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  net_cents integer not null check (net_cents >= 0),

  customer_email text,
  recipient jsonb not null default '{}'::jsonb,

  printful_order_id text,
  printful_status text,
  tracking_number text,
  tracking_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_storefront_id_idx on public.orders (storefront_id);
create index if not exists orders_company_id_idx on public.orders (company_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Public read for storefront "thank you" pages is optional later; for now keep owner-only.
create policy "orders_select_owner"
  on public.orders
  for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "orders_insert_owner"
  on public.orders
  for insert
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create or replace function public._touch_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public._touch_orders_updated_at();

