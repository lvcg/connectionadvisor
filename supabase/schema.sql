create extension if not exists pgcrypto;

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  stage text not null default 'Messaging',
  location text default '',
  interests text default '',
  vibe text default '',
  goals text default '',
  notes text default '',
  budget text not null default 'Moderate',
  mood text not null default 'Casual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.connections enable row level security;

drop policy if exists "Users can read own connections" on public.connections;
create policy "Users can read own connections"
on public.connections for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own connections" on public.connections;
create policy "Users can insert own connections"
on public.connections for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own connections" on public.connections;
create policy "Users can update own connections"
on public.connections for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own connections" on public.connections;
create policy "Users can delete own connections"
on public.connections for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists connections_set_updated_at on public.connections;
create trigger connections_set_updated_at
before update on public.connections
for each row
execute function public.set_updated_at();
