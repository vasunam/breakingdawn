create extension if not exists "uuid-ossp";

create table if not exists public.app_states (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

alter table public.app_states enable row level security;

drop policy if exists "select own app state" on public.app_states;
drop policy if exists "insert own app state" on public.app_states;
drop policy if exists "update own app state" on public.app_states;
drop policy if exists "delete own app state" on public.app_states;
drop trigger if exists touch_app_states_updated_at on public.app_states;
drop function if exists public.touch_app_states_updated_at();

create policy "select own app state" on public.app_states
for select
using (auth.uid() = user_id);

create policy "insert own app state" on public.app_states
for insert
with check (auth.uid() = user_id);

create policy "update own app state" on public.app_states
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "delete own app state" on public.app_states
for delete
using (auth.uid() = user_id);

create or replace function public.touch_app_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_app_states_updated_at
before update on public.app_states
for each row
execute function public.touch_app_states_updated_at();
