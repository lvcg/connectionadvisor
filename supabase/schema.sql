create extension if not exists pgcrypto;

do $$ begin
  create type public.project_status as enum ('planning', 'active', 'completed', 'paused');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.expense_category as enum ('materials', 'labor', 'permits', 'utilities', 'inspection', 'design', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.bill_utility_type as enum ('electricity', 'water', 'gas', 'internet', 'trash', 'insurance', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.bill_status as enum ('scheduled', 'paid', 'overdue');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.maintenance_priority as enum ('critical', 'recommended', 'seasonal');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.maintenance_status as enum ('pending', 'overdue', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_channel as enum ('email', 'push', 'sms');
exception when duplicate_object then null;
end $$;
alter type public.notification_channel add value if not exists 'sms';

do $$ begin
  create type public.appliance_status as enum ('excellent', 'monitor', 'service-soon', 'replace');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vendor_type as enum ('plumbing', 'electrical', 'hvac', 'roofing', 'landscaping', 'general', 'appliance', 'cleaning', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reminder_status as enum ('scheduled', 'sent', 'dismissed', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.plan_tier as enum ('free', 'vault_plus');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vault_document_type as enum ('receipt', 'warranty', 'photo', 'report', 'vehicle');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vehicle_status as enum ('excellent', 'monitor', 'service-soon', 'repair');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  home_name text not null default 'My Home',
  home_address text,
  home_type text,
  timezone text not null default 'America/Chicago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists notification_email text;
alter table public.profiles add column if not exists reminder_channel public.notification_channel not null default 'email';
alter table public.profiles add column if not exists calendar_sync boolean not null default true;
alter table public.profiles add column if not exists receipt_scan boolean not null default true;
alter table public.profiles add column if not exists dark_mode boolean not null default false;
alter table public.profiles add column if not exists settings_saved_at timestamptz;
alter table public.profiles add column if not exists plan_tier public.plan_tier not null default 'free';

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  area text,
  description text,
  total_budget numeric(12,2) not null default 0 check (total_budget >= 0),
  status public.project_status not null default 'planning',
  start_date date,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  category public.expense_category not null,
  vendor text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  tax_deductible boolean not null default false,
  document_url text,
  document_name text,
  document_bucket text default 'receipts',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  utility_type public.bill_utility_type not null,
  provider text not null,
  amount numeric(12,2) not null check (amount >= 0),
  billing_month date not null,
  due_date date,
  paid_date date,
  status public.bill_status not null default 'scheduled',
  autopay boolean not null default false,
  document_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, billing_month)
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text not null,
  vendor_type public.vendor_type not null default 'general',
  phone text,
  email text,
  address text,
  website text,
  rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  preferred boolean not null default false,
  insured boolean not null default false,
  license_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appliances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  name text not null,
  brand text,
  model text,
  serial_number text,
  location text,
  install_date date,
  purchase_date date,
  expected_lifespan_years integer check (expected_lifespan_years is null or expected_lifespan_years > 0),
  last_service_date date,
  next_service_date date,
  warranty_expires date,
  status public.appliance_status not null default 'excellent',
  notes text,
  document_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  appliance_id uuid references public.appliances(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  title text not null,
  area text,
  instructions text,
  recurrence_interval_months integer not null default 1 check (recurrence_interval_months > 0),
  due_date date not null,
  completed_at timestamptz,
  priority public.maintenance_priority not null default 'recommended',
  status public.maintenance_status not null default 'pending',
  notification_channel public.notification_channel,
  reminder_date date,
  notify_days_before integer not null default 3 check (notify_days_before >= 0),
  last_notification_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  appliance_id uuid references public.appliances(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  maintenance_task_id uuid references public.maintenance_tasks(id) on delete set null,
  service_date date not null,
  service_type text not null,
  description text,
  cost numeric(12,2) check (cost is null or cost >= 0),
  next_service_date date,
  document_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  maintenance_task_id uuid references public.maintenance_tasks(id) on delete cascade,
  appliance_id uuid references public.appliances(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  title text not null,
  reminder_at timestamptz not null,
  channel public.notification_channel not null default 'email',
  status public.reminder_status not null default 'scheduled',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (maintenance_task_id is not null or appliance_id is not null)
);

create table if not exists public.vault_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete set null,
  appliance_id uuid references public.appliances(id) on delete set null,
  maintenance_task_id uuid references public.maintenance_tasks(id) on delete set null,
  service_event_id uuid references public.service_events(id) on delete set null,
  document_type public.vault_document_type not null,
  name text not null,
  storage_bucket text not null default 'receipts',
  storage_path text not null,
  vendor text,
  amount numeric(12,2) check (amount is null or amount >= 0),
  document_date date,
  warranty_expires date,
  ocr_text text,
  ocr_status text not null default 'pending' check (ocr_status in ('pending', 'processed', 'unavailable', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  name text not null,
  make text,
  model text,
  year integer check (year is null or (year >= 1900 and year <= extract(year from now())::integer + 1)),
  vin text,
  mileage integer not null default 0 check (mileage >= 0),
  purchase_date date,
  last_service_date date,
  next_service_date date,
  warranty_expires date,
  registration_expires date,
  insurance_expires date,
  status public.vehicle_status not null default 'excellent',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_service_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  service_date date not null,
  service_type text not null,
  description text,
  mileage integer check (mileage is null or mileage >= 0),
  cost numeric(12,2) check (cost is null or cost >= 0),
  next_service_date date,
  document_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists bills_set_updated_at on public.bills;
create trigger bills_set_updated_at
before update on public.bills
for each row execute function public.set_updated_at();

drop trigger if exists vendors_set_updated_at on public.vendors;
create trigger vendors_set_updated_at
before update on public.vendors
for each row execute function public.set_updated_at();

drop trigger if exists appliances_set_updated_at on public.appliances;
create trigger appliances_set_updated_at
before update on public.appliances
for each row execute function public.set_updated_at();

drop trigger if exists maintenance_tasks_set_updated_at on public.maintenance_tasks;
create trigger maintenance_tasks_set_updated_at
before update on public.maintenance_tasks
for each row execute function public.set_updated_at();

drop trigger if exists service_events_set_updated_at on public.service_events;
create trigger service_events_set_updated_at
before update on public.service_events
for each row execute function public.set_updated_at();

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

drop trigger if exists vault_documents_set_updated_at on public.vault_documents;
create trigger vault_documents_set_updated_at
before update on public.vault_documents
for each row execute function public.set_updated_at();

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists vehicle_service_events_set_updated_at on public.vehicle_service_events;
create trigger vehicle_service_events_set_updated_at
before update on public.vehicle_service_events
for each row execute function public.set_updated_at();

create index if not exists projects_user_status_idx on public.projects(user_id, status);
create index if not exists expenses_user_date_idx on public.expenses(user_id, expense_date desc);
create index if not exists expenses_project_idx on public.expenses(project_id);
create index if not exists expenses_user_category_idx on public.expenses(user_id, category);
create index if not exists bills_user_month_idx on public.bills(user_id, billing_month desc);
create index if not exists vendors_user_type_idx on public.vendors(user_id, vendor_type);
create index if not exists vendors_user_preferred_idx on public.vendors(user_id, preferred);
create index if not exists appliances_user_status_idx on public.appliances(user_id, status);
create index if not exists appliances_user_next_service_idx on public.appliances(user_id, next_service_date);
create index if not exists maintenance_user_due_idx on public.maintenance_tasks(user_id, due_date);
create index if not exists maintenance_user_status_idx on public.maintenance_tasks(user_id, status);
create index if not exists maintenance_vendor_idx on public.maintenance_tasks(vendor_id);
create index if not exists service_events_user_date_idx on public.service_events(user_id, service_date desc);
create index if not exists reminders_user_status_time_idx on public.reminders(user_id, status, reminder_at);
create index if not exists vault_documents_user_type_idx on public.vault_documents(user_id, document_type);
create index if not exists vault_documents_user_date_idx on public.vault_documents(user_id, document_date desc);
create index if not exists vehicles_user_status_idx on public.vehicles(user_id, status);
create index if not exists vehicles_user_next_service_idx on public.vehicles(user_id, next_service_date);
create index if not exists vehicle_service_events_user_date_idx on public.vehicle_service_events(user_id, service_date desc);
create index if not exists vehicle_service_events_vehicle_idx on public.vehicle_service_events(vehicle_id, service_date desc);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.expenses enable row level security;
alter table public.bills enable row level security;
alter table public.vendors enable row level security;
alter table public.appliances enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.service_events enable row level security;
alter table public.reminders enable row level security;
alter table public.vault_documents enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_service_events enable row level security;

create policy "Users manage own profile"
on public.profiles for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users manage own projects"
on public.projects for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own expenses"
on public.expenses for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own bills"
on public.bills for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own vendors"
on public.vendors for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own appliances"
on public.appliances for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own maintenance tasks"
on public.maintenance_tasks for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own service events"
on public.service_events for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own reminders"
on public.reminders for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own vault documents"
on public.vault_documents for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own vehicles"
on public.vehicles for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own vehicle service events"
on public.vehicle_service_events for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Storage architecture for receipts and documents.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "Users can upload own receipt files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own receipt files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own receipt files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);
