import Link from "next/link";

const termsSections = [
  {
    title: "Using DomiVault",
    body: "DomiVault is a home and vehicle records platform for organizing expenses, maintenance tasks, vendors, appliances, receipts, warranties, service records, reminders, and exports. You agree to use the app lawfully and only for records you have permission to manage.",
  },
  {
    title: "Not Professional Advice",
    body: "DomiVault is an organization tool. It does not provide legal, tax, insurance, construction, electrical, plumbing, financial, or vehicle repair advice. You should consult qualified professionals before making decisions that require licensed expertise.",
  },
  {
    title: "Your Account And Records",
    body: "You are responsible for keeping your login credentials secure and for the accuracy of information you enter, upload, scan, edit, export, or share from DomiVault. You should review OCR text, reminder dates, tax markers, warranty details, and vendor information for accuracy.",
  },
  {
    title: "Documents And Uploads",
    body: "You may upload or scan supported receipts, warranties, photos, and records. You confirm that you have the right to upload those files. Do not upload unlawful content, malware, passwords, complete payment card numbers, or documents that violate another person's privacy.",
  },
  {
    title: "DomiVault Plus And Paid Features",
    body: "Some features may require a paid plan, such as receipt storage, warranty tracking, maintenance history, vehicle records, calendar sync, expiration alerts, and exports. Paid access, billing, cancellations, refunds, and subscription status are managed through RevenueCat and the plan terms shown during checkout.",
  },
  {
    title: "Exports And Reports",
    body: "Exports may contain sensitive home, financial, vendor, vehicle, and document information. You are responsible for securely storing, sharing, or deleting exported files after download.",
  },
  {
    title: "Service Availability",
    body: "We aim to keep DomiVault reliable, but the service may be interrupted by maintenance, provider outages, network issues, security updates, or changes to third-party services such as Supabase, payment processors, email providers, or browser camera APIs.",
  },
  {
    title: "Acceptable Use",
    body: "You may not misuse DomiVault, attempt to bypass access controls, upload harmful files, scrape the service, interfere with other users, reverse engineer restricted parts of the service, or use the app to store illegal or abusive content.",
  },
  {
    title: "Privacy",
    body: "Your use of DomiVault is also governed by the Privacy and Data Policy. We do not sell your data, and synced app records are stored using Supabase-backed authentication, database, and storage infrastructure.",
  },
  {
    title: "Changes To These Terms",
    body: "We may update these terms as DomiVault evolves. Continued use of the app after updated terms are posted means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">DomiVault</Link>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/login" className="hover:text-slate-950 dark:hover:text-white">Login</Link>
            <Link href="/privacy" className="hover:text-slate-950 dark:hover:text-white">Privacy</Link>
          </div>
        </nav>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Terms of service</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Clear terms for managing your home records.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            These terms explain how you may use DomiVault and what responsibilities apply when you store, scan, organize, or export home, vehicle, receipt, warranty, maintenance, and vendor records.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Effective date: June 25, 2026</p>
        </section>

        <section className="grid gap-4">
          {termsSections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-50">
          <h2 className="text-lg font-semibold">Production Note</h2>
          <p className="mt-2">
            These terms are a strong product draft, but DomiVault should have lawyer-reviewed terms before a full public launch, especially once paid subscriptions, refunds, support obligations, and payment processors are active.
          </p>
        </section>
      </div>
    </main>
  );
}
