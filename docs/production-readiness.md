# DomiVault Production Readiness

## Completed In App

- Protected routes redirect through Supabase auth.
- Supabase schema includes user-scoped RLS for core app tables.
- Document storage uses the private `receipts` bucket.
- Vault document insert/update and storage upload policies require `profiles.plan_tier = 'vault_plus'`.
- Vehicle records, vehicle service events, maintenance history rows, paid reminders, and appliance warranty fields are gated by `profiles.plan_tier = 'vault_plus'`.
- Profile billing fields are protected by a trigger so browser clients cannot self-upgrade `plan_tier`.
- Report exports and saved-document OCR run through Plus-gated API routes.
- Settings can read plan tier but can no longer self-upgrade the account.
- Document upload, camera scan, delete, metadata save, signed URLs, and Tesseract OCR are wired.
- Error boundaries post client errors to `/api/monitoring/errors` and log server-side.
- Privacy and Terms starter pages exist.

## Must Run In Supabase

1. Open Supabase SQL editor.
2. Run `supabase/schema.sql`.
3. Confirm `profiles.plan_tier` exists and defaults to `free`.
4. Confirm RevenueCat billing columns exist on `profiles`.
5. Confirm `vault_documents.ocr_text` and `vault_documents.ocr_status` exist.
6. Confirm the `receipts` storage bucket is private.
7. Run the manual steps in `supabase/rls-smoke-tests.sql` with two test users.

## Must Configure In Hosting

Set production environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
TESSERACT_LANG
```

RevenueCat paid plan variables:

```text
NEXT_PUBLIC_REVENUECAT_PURCHASE_LINK
REVENUECAT_WEBHOOK_AUTH_TOKEN
REVENUECAT_WEBHOOK_SIGNING_SECRET
```

Future monitoring variable:

```text
SENTRY_DSN
```

## Billing Enforcement Still Needed

The database now enforces `vault_plus` before document rows and storage uploads can be created. RevenueCat should update `profiles.plan_tier` from a trusted webhook after purchase events.

Recommended flow:

1. Create a RevenueCat project for DomiVault.
2. Create a `vault_plus` entitlement.
3. Create DomiVault Plus monthly/yearly products and attach them to `vault_plus`.
4. Create an offering and a hosted Web Purchase Link.
5. Add the production purchase link to `NEXT_PUBLIC_REVENUECAT_PURCHASE_LINK`.
6. Configure a RevenueCat webhook to `/api/billing/revenuecat`.
7. Update `profiles.plan_tier` only from the webhook or a trusted admin action.
8. Never let the browser directly upgrade its own plan.

## QA Checklist

- Create two Supabase users and verify records do not cross accounts.
- Confirm free users cannot upload documents.
- Confirm free users cannot create vehicle records, maintenance history rows, paid reminders, warranty-tracking appliance rows, or export reports.
- Confirm free users cannot directly update `profiles.plan_tier`.
- Confirm Plus users can upload, scan, OCR, rename, open, and delete documents.
- Confirm Plus users can export reports and create paid records after RevenueCat or an admin action updates `profiles.plan_tier`.
- Test camera scan on iOS Safari, Android Chrome, desktop Chrome, and desktop Edge.
- Test responsive layouts at 390px, 768px, 1024px, and 1440px.
- Test password recovery, magic link, Google OAuth, and sign out.
- Review Privacy and Terms with counsel before public launch.

## Known Limitation

Tesseract OCR supports image files and camera captures. PDF files can be stored, and text-like files are extracted directly. Scanned PDF OCR still needs a PDF-to-image conversion layer before Tesseract can process the pages.
