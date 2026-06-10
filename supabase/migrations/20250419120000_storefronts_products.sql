-- Storefronts + products for ecommerce launches (public catalog read, owner writes)

create table if not exists public.storefronts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  slug text not null unique,
  name text not null,
  headline text,
  description text,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists storefronts_company_id_idx on public.storefronts (company_id);
create index if not exists storefronts_slug_idx on public.storefronts (slug);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  storefront_id uuid not null references public.storefronts (id) on delete cascade,
  title text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  image_url text,
  tags text[] not null default '{}'::text[],
  pod jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_storefront_id_idx on public.products (storefront_id);

alter table public.storefronts enable row level security;
alter table public.products enable row level security;

-- Public read (anonymous + authenticated) for live storefront pages
create policy "storefronts_select_public"
  on public.storefronts
  for select
  using (true);

create policy "products_select_public"
  on public.products
  for select
  using (true);

-- Writes: only company owner
create policy "storefronts_insert_owner"
  on public.storefronts
  for insert
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "storefronts_update_owner"
  on public.storefronts
  for update
  using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "storefronts_delete_owner"
  on public.storefronts
  for delete
  using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "products_insert_owner"
  on public.products
  for insert
  with check (
    exists (
      select 1 from public.storefronts s
      join public.companies c on c.id = s.company_id
      where s.id = storefront_id and c.user_id = auth.uid()
    )
  );

create policy "products_update_owner"
  on public.products
  for update
  using (
    exists (
      select 1 from public.storefronts s
      join public.companies c on c.id = s.company_id
      where s.id = storefront_id and c.user_id = auth.uid()
    )
  );

create policy "products_delete_owner"
  on public.products
  for delete
  using (
    exists (
      select 1 from public.storefronts s
      join public.companies c on c.id = s.company_id
      where s.id = storefront_id and c.user_id = auth.uid()
    )
  );

-- Optional: product images bucket (public read; authenticated upload)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_auth_upload" on storage.objects;
drop policy if exists "product_images_auth_update" on storage.objects;
drop policy if exists "product_images_auth_delete" on storage.objects;

create policy "product_images_public_read"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "product_images_auth_upload"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "product_images_auth_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "product_images_auth_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');
