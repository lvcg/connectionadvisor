-- DomiVault RLS smoke tests
-- Run after supabase/schema.sql with two real auth users.
-- Replace the UUID values below with IDs from auth.users.

begin;

-- Simulate user A.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('role', 'authenticated', true);

-- User A should only see their own rows.
select id, user_id, name from public.projects where user_id <> auth.uid();
select id, user_id, name from public.vault_documents where user_id <> auth.uid();

-- Free accounts should be blocked from vault document inserts.
-- This should fail unless the profile is vault_plus.
insert into public.vault_documents (user_id, document_type, name, storage_path)
values (auth.uid(), 'receipt', 'rls-test.txt', auth.uid() || '/receipt/rls-test.txt');

-- Free accounts should be blocked from paid vehicle records.
insert into public.vehicles (user_id, name, make, model, year)
values (auth.uid(), 'RLS Test Vehicle', 'Test', 'Car', 2024);

-- Free accounts should be blocked from maintenance history rows.
insert into public.service_events (user_id, service_date, service_type, description)
values (auth.uid(), current_date, 'RLS test', 'Should require DomiVault Plus');

-- Free accounts should be blocked from warranty-tracking appliance rows.
insert into public.appliances (user_id, name, warranty_expires)
values (auth.uid(), 'RLS Warranty Appliance', current_date + interval '1 year');

-- Free accounts should be blocked from paid reminders.
with test_appliance as (
  insert into public.appliances (user_id, name)
  values (auth.uid(), 'RLS Basic Appliance')
  returning id
)
insert into public.reminders (user_id, title, reminder_at, appliance_id)
select auth.uid(), 'RLS renewal reminder', now() + interval '30 days', id
from test_appliance;

rollback;

-- Manual checklist:
-- 1. Create test user A with profiles.plan_tier = 'free'.
-- 2. Confirm vault document insert is rejected.
-- 3. Confirm vehicle, service_events, reminders, and warranty appliance inserts are rejected for free users.
-- 4. Confirm user A cannot directly update their own profiles.plan_tier from the client.
-- 5. Set user A profiles.plan_tier = 'vault_plus' from a trusted admin/service-role context.
-- 6. Confirm vault document, vehicle, service_events, reminders, and warranty appliance inserts succeed.
-- 7. Create test user B and confirm user B cannot select user A rows.
