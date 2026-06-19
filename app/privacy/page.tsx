export default function PrivacyPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Privacy</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Privacy Policy</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          DomiVault stores home records, receipts, warranty documents, service notes, vendors, and vehicle records for the signed-in account that owns them.
        </p>
      </div>

      <div className="grid gap-4">
        {[
          ["Information stored", "Profile settings, project records, expenses, documents, OCR text, maintenance tasks, appliances, vendors, vehicle records, and export metadata may be stored when you use synced features."],
          ["Document security", "Documents are stored in a private storage bucket and database records are protected by account-scoped access rules. Users should still avoid uploading passwords, payment cards, or documents they do not want stored."],
          ["How data is used", "Data is used to show your dashboard, reminders, documents, reports, and saved home records. DomiVault does not need to sell user data to function."],
          ["Retention and deletion", "Deleting a document removes its storage object and vault metadata. Deleting app records removes the related database row according to the app workflow and database constraints."],
          ["Production note", "Before public launch, replace this starter policy with a lawyer-reviewed privacy policy that names the production company, hosting provider, analytics tools, payment processor, support contact, and data-retention terms."],
        ].map(([title, body]) => (
          <article key={title} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
