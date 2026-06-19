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

rollback;

-- Manual checklist:
-- 1. Create test user A with profiles.plan_tier = 'free'.
-- 2. Confirm vault document insert is rejected.
-- 3. Set user A profiles.plan_tier = 'vault_plus'.
-- 4. Confirm vault document insert succeeds.
-- 5. Create test user B and confirm user B cannot select user A rows.
