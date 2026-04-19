alter table public.companies
  add column if not exists creator_blueprint jsonb;

comment on column public.companies.creator_blueprint is 'AI-generated launch brief: name, description, agent team, revenue band.';
