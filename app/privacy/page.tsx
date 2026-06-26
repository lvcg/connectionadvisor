import Link from "next/link";

const privacySections = [
  {
    title: "Information You Add To DomiVault",
    body: "DomiVault stores the home, maintenance, expense, appliance, vendor, vehicle, receipt, warranty, and document records you choose to create or upload. This may include document names, OCR text, dates, amounts, vendor details, notes, reminders, profile settings, and uploaded files.",
  },
  {
    title: "How We Use Your Data",
    body: "We use your data to operate the app: showing dashboards, saving records, syncing your account, organizing documents, preparing reminders, creating exports, and helping you manage home and vehicle information. We do not sell your personal data.",
  },
  {
    title: "Data Storage And Security",
    body: "DomiVault uses Supabase for authentication, database storage, and document storage. Records are scoped to your account using database access rules and private storage policies. No online system is perfect, so you should avoid uploading passwords, full payment card numbers, or records you do not want stored digitally.",
  },
  {
    title: "Documents, Receipts, Warranties, And OCR",
    body: "When you scan or upload a document, DomiVault may save the file, file metadata, and extracted OCR text so you can search, edit, export, or manage the record. You can update or delete records from the app where those controls are available.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell user data. We may process data through service providers that help run DomiVault, including Supabase for secure auth, database, and storage infrastructure, and RevenueCat for subscription access, billing state, and purchase entitlement management.",
  },
  {
    title: "Your Controls",
    body: "You can edit many profile and record details in the app, download/export available reports, and delete supported records or documents. Some deletion requests may require support if a record is tied to billing, security logs, backups, or legal retention requirements.",
  },
  {
    title: "Retention",
    body: "We keep account records for as long as your account is active or as needed to provide DomiVault. Deleted documents should be removed from active storage and related vault metadata, subject to normal backup and operational retention windows.",
  },
  {
    title: "Children's Privacy",
    body: "DomiVault is intended for adults managing household, property, vehicle, and financial records. It is not intended for children under 13.",
  },
  {
    title: "Policy Updates",
    body: "We may update this policy as DomiVault adds new features, payment plans, integrations, or security improvements. Material updates should be reflected on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">DomiVault</Link>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/login" className="hover:text-slate-950 dark:hover:text-white">Login</Link>
            <Link href="/terms" className="hover:text-slate-950 dark:hover:text-white">Terms</Link>
          </div>
        </nav>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Privacy and data policy</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Your records stay yours.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            DomiVault helps you manage private home, vehicle, receipt, warranty, and maintenance records. We do not sell your data. Your synced records are stored securely using Supabase authentication, database, and storage services.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Effective date: June 25, 2026</p>
        </section>

        <section className="grid gap-4">
          {privacySections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2">Questions about privacy, exports, or deletion requests can be sent to the DomiVault support contact listed in your account or product materials.</p>
        </section>
      </div>
    </main>
  );
}
