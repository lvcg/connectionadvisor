export default function TermsPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Terms</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Terms of Use</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          These starter terms describe how DomiVault should be used while the app is being prepared for production.
        </p>
      </div>

      <div className="grid gap-4">
        {[
          ["Use of DomiVault", "DomiVault is an organization tool for home, maintenance, expense, warranty, vendor, and vehicle records. It does not replace licensed financial, legal, tax, insurance, construction, or repair advice."],
          ["User responsibility", "Users are responsible for the accuracy of uploaded records, document names, reminders, tax markers, vendor details, and service notes."],
          ["Paid features", "DomiVault Plus features should only be available to accounts with an active paid plan once billing is connected. Plan status must be controlled by the billing system, not by client-side settings."],
          ["Exports and documents", "Users should be able to download their own documents and reports. Exported files may contain sensitive home and financial information and should be stored carefully."],
          ["Production note", "Before public launch, replace these starter terms with lawyer-reviewed terms that name the production company, billing terms, refund policy, support contact, acceptable use, and limitation of liability."],
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
