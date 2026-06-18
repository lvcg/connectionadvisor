# Homey

Homey is a premium home improvement and maintenance tracker for homeowners who want one polished place to manage renovation spend, recurring utility bills, receipts, tax-deductible expenses, appliance service schedules, repair reminders, and trusted home vendors.

## Core Experience

- Premium dashboard with total home investment, monthly utility spend, upcoming maintenance, and deductible expense metrics.
- Expense and bill organizer for materials, labor, permits, utilities, inspections, and design costs.
- Interactive expense table with search, category filtering, project filtering, receipt metadata, and an add-record modal.
- Login and signup page powered by Supabase Auth environment keys.
- Input workflows for expenses, utility bills, vendors, and maintenance reminders.
- Project budget progress with amount spent vs. total budget.
- Maintenance routine scheduler for recurring tasks like HVAC filters, gutters, and water heater flushes.
- Appliance lifecycle tracker with install dates, expected lifespan, age progress, warranty dates, last service, and next service dates.
- Repair and maintenance reminders with due dates, reminder channels, vendor assignments, and reminder status architecture.
- Vendor address book for plumbers, HVAC techs, roofers, appliance repair, and other preferred service contacts.
- Supabase schema with auth-scoped RLS across profiles, projects, expenses, bills, maintenance tasks, appliances, vendors, service events, reminders, and receipt storage.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage
- Recharts
- Lucide icons

## Folder Structure

```text
app/
  appliances/
  dashboard/
  expenses/
  login/
  maintenance/
  vendors/
components/
  appliances/
  auth/
  dashboard/
  expenses/
  layout/
  ui/
  vendors/
hooks/
lib/
  supabase/
supabase/
  schema.sql
types/
```

## Getting Started

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

In the Supabase SQL editor, run:

```text
supabase/schema.sql
```

The schema creates:

- `profiles`
- `projects`
- `expenses`
- `bills`
- `maintenance_tasks`
- `appliances`
- `vendors`
- `service_events`
- `reminders`
- private `receipts` storage bucket

RLS policies ensure authenticated users can only access rows and files scoped to their own `auth.uid()`.

### Auth Setup

In Supabase Auth settings:

- Enable email/password sign-in.
- Enable magic links if you want passwordless login.
- Enable Google and GitHub providers if you want OAuth buttons to work.
- Add these redirect URLs:

```text
http://localhost:3000/auth/callback
http://localhost:3005/auth/callback
http://localhost:3000/auth/update-password
http://localhost:3005/auth/update-password
https://your-production-domain.com/auth/callback
https://your-production-domain.com/auth/update-password
```

The login page automatically redirects successful auth sessions back to `/dashboard`.

For password recovery, set the Supabase Auth **Site URL** to your Homey app URL, not the old ConnectionAdvisor URL:

```text
http://localhost:3005
```

If you customize the recovery email template, make sure the link points to Homey with:

```text
{{ .ConfirmationURL }}
```

### OAuth Preview Setup

Homey implements the OAuth preview consent route at:

```text
/oauth/consent
```

For the local preview authorization URL, use the same port your app is running on:

```text
http://localhost:3000/oauth/consent
http://localhost:3005/oauth/consent
```

Supabase project OAuth endpoints:

```text
Authorization: https://odxobincteposdhqhxvs.supabase.co/auth/v1/oauth/authorize
Token: https://odxobincteposdhqhxvs.supabase.co/auth/v1/oauth/token
JWKS: https://odxobincteposdhqhxvs.supabase.co/auth/v1/.well-known/jwks.json
```

## Product Direction

The current UI uses local demo data so the premium experience can be reviewed immediately. The next implementation step is wiring the dashboard and expense forms to Supabase queries/mutations, then adding auth screens and receipt uploads.
