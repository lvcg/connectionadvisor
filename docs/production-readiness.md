# DomiVault Production Readiness

## Completed In App

- Protected routes redirect through Supabase auth.
- Supabase schema includes user-scoped RLS for core app tables.
- Document storage uses the private `receipts` bucket.
- Vault document insert/update and storage upload policies require `profiles.plan_tier = 'vault_plus'`.
- Settings can read plan tier but can no longer self-upgrade the account.
- Document upload, camera scan, delete, metadata save, signed URLs, and Tesseract OCR are wired.
- Error boundaries post client errors to `/api/monitoring/errors` and log server-side.
- Privacy and Terms starter pages exist.

## Must Run In Supabase

1. Open Supabase SQL editor.
2. Run `supabase/schema.sql`.
3. Confirm `profiles.plan_tier` exists and defaults to `free`.
4. Confirm `vault_documents.ocr_text` and `vault_documents.ocr_status` exist.
5. Confirm the `receipts` storage bucket is private.
6. Run the manual steps in `supabase/rls-smoke-tests.sql` with two test users.

## Must Configure In Hosting

Set production environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
TESSERACT_LANG
```

Future paid plan variables:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Future monitoring variable:

```text
SENTRY_DSN
```

## Billing Enforcement Still Needed

The database now enforces `vault_plus` before document rows and storage uploads can be created. A real billing provider still needs to update `profiles.plan_tier` from a trusted webhook.

Recommended flow:

1. Create Stripe products for Free and DomiVault Plus.
2. Add checkout and customer portal routes.
3. Handle Stripe webhooks server-side.
4. Update `profiles.plan_tier` only from the webhook or a trusted admin action.
5. Never let the browser directly upgrade its own plan.

## QA Checklist

- Create two Supabase users and verify records do not cross accounts.
- Confirm free users cannot upload documents.
- Confirm Plus users can upload, scan, OCR, rename, open, and delete documents.
- Test camera scan on iOS Safari, Android Chrome, desktop Chrome, and desktop Edge.
- Test responsive layouts at 390px, 768px, 1024px, and 1440px.
- Test password recovery, magic link, Google OAuth, and sign out.
- Review Privacy and Terms with counsel before public launch.

## Known Limitation

Tesseract OCR supports image files and camera captures. PDF files can be stored, and text-like files are extracted directly. Scanned PDF OCR still needs a PDF-to-image conversion layer before Tesseract can process the pages.
